#!/usr/bin/env bash
# 版本號單一來源：VERSION 係唯一權威，呢個 script 負責同步去其他 3 個地方。
# 用法：bash tools/sync-version.sh            （同步）
#       bash tools/sync-version.sh --check    （只檢查，唔改；preflight 已經內建同樣檢查）
set -euo pipefail
cd "$(dirname "$0")/.."

VER="$(tr -d '[:space:]' < VERSION)"
SHORT="${VER%.*}"
CHECK=0
[ "${1:-}" = "--check" ] && CHECK=1

python3 - "$VER" "$SHORT" "$CHECK" <<'PY'
import json, re, sys, pathlib
ver, short, check = sys.argv[1], sys.argv[2], sys.argv[3] == "1"
changed = []

# manifest.json
p = pathlib.Path("manifest.json"); m = json.loads(p.read_text(encoding="utf-8"))
if m.get("version") != ver:
    m["version"] = ver
    if not check: p.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    changed.append("manifest.json → %s" % ver)

# sw.js cache 名
p = pathlib.Path("sw.js"); s = p.read_text(encoding="utf-8")
new = re.sub(r'const CACHE = "hk-mbti-v[0-9.]+"', 'const CACHE = "hk-mbti-v%s"' % ver, s)
if new != s:
    if not check: p.write_text(new, encoding="utf-8")
    changed.append("sw.js CACHE → hk-mbti-v%s" % ver)

# index.html chrome 文字（只顯示 major.minor）
p = pathlib.Path("index.html"); h = p.read_text(encoding="utf-8")
new = re.sub(r"(版本\s*v)[0-9]+\.[0-9]+", r"\g<1>%s" % short, h)
if new != h:
    if not check: p.write_text(new, encoding="utf-8")
    changed.append("index.html chrome → 版本 v%s" % short)

if not changed:
    print("版本 %s：3 處已經一致，唔使改。" % ver)
else:
    print(("（--check 模式，未改）" if check else "已同步：") + "；".join(changed))
    if check: sys.exit(1)
PY
