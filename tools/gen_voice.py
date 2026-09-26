#!/usr/bin/env python3
"""
gen_voice.py — 為 hk-mbti 題庫預先生成粵語 neural TTS 音檔（edge-tts）

用法：
  python3 tools/gen_voice.py --check                 # 只列出會做幾多條、唔生成
  python3 tools/gen_voice.py --voice zh-HK-HiuMaanNeural
  python3 tools/gen_voice.py --voice zh-HK-HiuMaanNeural --only-sample /tmp/sample.mp3

產出：
  audio/q/<key>.mp3   題目
  audio/o/<key>.mp3   選項
  voice-map.js        window.Q_AUDIO / window.O_AUDIO 文字→檔名對照
  tools/voice-manifest.json  生成紀錄（文字 sha1），下次可以只補新／改過嘅

設計重點：
  * 以「文字 sha1 頭 12 位」做檔名 → 改題目就自動是新檔，舊檔可由 --prune 清走
  * map 用原文做 key，前端搵唔到就 fallback 返 speechSynthesis（唔會死）
  * 支援中英混排（例如「send WhatsApp 話唔太舒服」）
"""
import argparse
import asyncio
import hashlib
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(REPO, "index.html")
AUDIO_Q = os.path.join(REPO, "audio", "q")
AUDIO_O = os.path.join(REPO, "audio", "o")
MAP_JS = os.path.join(REPO, "voice-map.js")
MANIFEST = os.path.join(REPO, "tools", "voice-manifest.json")

DEFAULT_VOICE = "zh-HK-HiuMaanNeural"


# ---------- 由 index.html 抽出題庫（唔靠 browser，用 bracket match） ----------
def _grab_array(html, name):
    i = html.find("window." + name + " = ")
    if i < 0:
        raise SystemExit("搵唔到 window.%s 喺 index.html" % name)
    open_i = html.find("[", i)
    open_o = html.find("{", i)
    start = open_o if (open_o >= 0 and (open_i < 0 or open_o < open_i)) else open_i
    depth = 0
    j = start
    while j < len(html):
        c = html[j]
        if c in "[{":
            depth += 1
        elif c in "]}":
            depth -= 1
            if depth == 0:
                return html[start:j + 1]
        j += 1
    raise SystemExit("window.%s 括號唔平衡" % name)


def load_bank():
    """題庫係 JS object literal（key 冇引號）→ 交畀 node 抽，避免自己寫 parser。

    回傳 (questions, alts)。alts = Q_ALTS：buildDeck 會隨機將題目字換成變體，
    所以變體文字一樣要有音檔，否則一半題目會跌返落舊 speechSynthesis 聲。
    """
    import subprocess
    extractor = os.path.join(REPO, "tools", "extract_bank.js")
    out = subprocess.run(["node", extractor, INDEX], capture_output=True, text=True, check=True)
    data = json.loads(out.stdout)
    return data["questions"], data.get("alts", {})


# ---------- 文字正規化：只改讀音相關嘅符號，唔改意思 ----------
def normalize(text):
    t = text.strip()
    t = t.replace("／", "，").replace("/", "，")
    t = t.replace("~", "至").replace("～", "至")
    t = re.sub(r"[_*`]+", " ", t)
    t = re.sub(r"\s+", " ", t)
    t = t.strip()
    # 句尾冇標點就補個句號，令 TTS 收得自然啲
    if t and t[-1] not in "。！？，、；：,.!?":
        t += "。"
    return t


def key_of(text):
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]


def collect_items(questions, alts=None):
    """回傳 [(kind, raw_text, spoken_text, path)]

    raw_text  = index.html 原本嘅字（前端用佢做 lookup key，唔需要喺 JS 重做正規化）
    spoken    = 真正讀出嚟嘅字（正規化過、選項加字母前綴）

    kind='q' 包含正題 + Q_ALTS 變體（buildDeck 會隨機揀其中一個）。
    """
    alts = alts or {}
    items = []
    seen = set()

    def add_q(raw):
        raw = (raw or "").strip()
        if not raw or ("q", raw) in seen:
            return
        spoken = normalize(raw)
        seen.add(("q", raw))
        items.append(("q", raw, spoken, os.path.join(AUDIO_Q, key_of(spoken) + ".mp3")))

    for q in questions:
        add_q(q.get("t"))
        # 題目變體：key 同 buildDeck 一致 = q.k || q.d
        for variant in alts.get(q.get("k") or q.get("d"), []):
            if isinstance(variant, str):
                add_q(variant)
        for opt in q.get("o", []):
            oraw = (opt.get("t") or "").strip()
            if not oraw or ("o", oraw) in seen:
                continue
            otext = normalize(oraw)
            letter = opt.get("l", "")
            ospoken = "%s、%s" % (letter, otext) if letter else otext
            seen.add(("o", oraw))
            items.append(("o", oraw, ospoken, os.path.join(AUDIO_O, key_of(ospoken) + ".mp3")))
    return items


async def _synth(sem, voice, text, path, rate, retries=4):
    import edge_tts
    for attempt in range(retries):
        try:
            async with sem:
                c = edge_tts.Communicate(text, voice, rate=rate)
                tmp = path + ".part"
                await c.save(tmp)
                if os.path.getsize(tmp) < 1000:
                    raise RuntimeError("音檔太細，可能失敗")
                os.replace(tmp, path)
            return True
        except Exception as e:  # noqa: BLE001
            if attempt == retries - 1:
                print("  ✗ FAIL %s (%s)" % (os.path.basename(path), e), file=sys.stderr)
                return False
            await asyncio.sleep(1.5 * (attempt + 1))
    return False


async def run(items, voice, rate, force, quiet):
    sem = asyncio.Semaphore(5)
    todo = [it for it in items if force or not os.path.exists(it[3])]
    os.makedirs(AUDIO_Q, exist_ok=True)
    os.makedirs(AUDIO_O, exist_ok=True)
    if not todo:
        print("冇新檔要生成（共 %d 條）" % len(items))
        return 0
    print("生成 %d / %d 條（voice=%s rate=%s）..." % (len(todo), len(items), voice, rate))
    ok = 0
    done = 0
    for i in range(0, len(todo), 20):
        batch = todo[i:i + 20]
        res = await asyncio.gather(*[_synth(sem, voice, t[2], t[3], rate) for t in batch])
        ok += sum(1 for r in res if r)
        done += len(batch)
        if not quiet:
            print("  %d/%d" % (done, len(todo)), flush=True)
    print("完成：%d 成功 / %d 失敗" % (ok, len(todo) - ok))
    return len(todo) - ok


def write_map(items):
    lines = ["// 自動生成 — 唔好手改。重生：python3 tools/gen_voice.py",
             "// key = index.html 題庫原本嘅字（未經正規化），前端直接 Q_AUDIO[q.t] lookup；",
             "// 搵唔到就 fallback 用 speechSynthesis（見 index.html speakQuestion）。",
             "window.Q_AUDIO = {"]
    for kind, raw, _spoken, path in items:
        if kind != "q":
            continue
        lines.append("  %s: %s," % (json.dumps(raw, ensure_ascii=False),
                                    json.dumps(os.path.relpath(path, REPO).replace(os.sep, "/"))))
    lines.append("};")
    lines.append("window.O_AUDIO = {")
    for kind, raw, _spoken, path in items:
        if kind != "o":
            continue
        lines.append("  %s: %s," % (json.dumps(raw, ensure_ascii=False),
                                    json.dumps(os.path.relpath(path, REPO).replace(os.sep, "/"))))
    lines.append("};")
    with open(MAP_JS, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("寫入 %s（%d 題 + %d 選項）" % (os.path.relpath(MAP_JS, REPO),
                                    sum(1 for k, _, _, _ in items if k == "q"),
                                    sum(1 for k, _, _, _ in items if k == "o")))


def write_manifest(items, voice, rate):
    m = {
        "voice": voice,
        "rate": rate,
        "count": len(items),
        "items": {os.path.basename(p): {"raw": raw, "spoken": sp} for _, raw, sp, p in items},
    }
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(m, f, ensure_ascii=False, indent=1, sort_keys=True)
    print("寫入 %s" % os.path.relpath(MANIFEST, REPO))


def verify_map(items):
    """每個 key 都要有檔喺度，否則前端會靜靜地 fallback（唔會死，但就白做）。"""
    missing = [p for _, _, _, p in items if not os.path.exists(p)]
    if missing:
        print("✗ 有 %d 個音檔唔存在，例如 %s" % (len(missing), missing[0]), file=sys.stderr)
        return False
    print("✓ 全部 %d 條音檔齊" % len(items))
    return True


def prune(items):
    keep = {os.path.abspath(p) for _, _, _, p in items}
    removed = 0
    for d in (AUDIO_Q, AUDIO_O):
        if not os.path.isdir(d):
            continue
        for fn in os.listdir(d):
            fp = os.path.join(d, fn)
            if fp not in keep:
                os.remove(fp)
                removed += 1
    print("清走 %d 個孤兒檔" % removed)


async def sample(voice, out, rate):
    """生成一條完整題目＋4 個選項嘅試聽檔（畀 Roy 揀聲用）"""
    import edge_tts
    q = load_bank()[0][0]
    parts = [normalize(q["t"])]
    for opt in q["o"]:
        parts.append("%s、%s" % (opt["l"], normalize(opt["t"])))
    text = " ".join(parts)
    c = edge_tts.Communicate(text, voice, rate=rate)
    await c.save(out)
    print("sample → %s (%d bytes)" % (out, os.path.getsize(out)))
    print("讀出嘅內容：" + text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--rate", default="+0%", help="例如 -10%% 慢啲")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--prune", action="store_true")
    ap.add_argument("--no-map", action="store_true")
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--only-sample", metavar="OUT.mp3")
    args = ap.parse_args()

    if args.only_sample:
        asyncio.run(sample(args.voice, args.only_sample, args.rate))
        return

    questions, alts = load_bank()
    items = collect_items(questions, alts)
    nq = sum(1 for k, _, _, _ in items if k == "q")
    no = sum(1 for k, _, _, _ in items if k == "o")
    if args.check:
        total = sum(os.path.getsize(p) for _, _, _, p in items if os.path.exists(p))
        have = sum(1 for _, _, _, p in items if os.path.exists(p))
        print("題目（含 Q_ALTS 變體）%d 條、選項 %d 條、合共 %d 條（已有 %d 個檔）"
              % (nq, no, len(items), have))
        print("已存在音檔 %.2f MB" % (total / 1048576))
        print("題目 sample：%s" % items[0][1][:40])
        return

    failed = asyncio.run(run(items, args.voice, args.rate, args.force, args.quiet))
    if failed:
        print("有檔生成失敗，唔寫 map（避免前端靜靜 fallback）", file=sys.stderr)
        sys.exit(1)
    if not verify_map(items):
        sys.exit(1)
    if not args.no_map:
        write_map(items)
        write_manifest(items, args.voice, args.rate)
    if args.prune:
        prune(items)
    total = sum(os.path.getsize(p) for _, _, _, p in items if os.path.exists(p))
    print("音檔總量 %.2f MB" % (total / 1048576))


if __name__ == "__main__":
    main()
