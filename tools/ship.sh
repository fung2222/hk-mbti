#!/bin/sh
# ship.sh - 出貨閘：任何一套測試失敗，直接拒絕 commit + push（唔准靠人眼睇輸出）
# 用法： sh tools/ship.sh "commit message"
# 2026-10-04 加：之前試過見到 28/29 都照 push，所以把閘寫入程式碼。
# 2026-10-05 加：靜態守門 A／B（捉「引用已刪函數」同「死 selector」，毫秒級）＋真 Chrome 幾何閘；
#                 閘數由 run_gate 自己數，唔再寫死（上一版寫死「5 項」，加閘時會對唔上）。
set -u
cd "$(dirname "$0")/.." || exit 1
: "${NODE_PATH:=/opt/data/profiles/apps/cache/scratch/harness/node_modules}"
export NODE_PATH
: "${PLAYWRIGHT_BROWSERS_PATH:=/opt/data/profiles/apps/cache/scratch/pw/browsers}"
export PLAYWRIGHT_BROWSERS_PATH
: "${CHROME:=/opt/data/profiles/apps/cache/scratch/pw/browsers/chromium-1243/chrome-linux64/chrome}"
if [ ! -x "$CHROME" ] && [ -x /usr/bin/google-chrome ]; then CHROME=/usr/bin/google-chrome; fi
export CHROME
: "${PWPY:=/opt/data/profiles/apps/cache/scratch/pwpy/bin/python}"
if [ ! -x "$PWPY" ]; then PWPY=python3; fi

MSG="${1:-}"
if [ -z "$MSG" ]; then echo "用法: sh tools/ship.sh \"commit message\""; exit 2; fi

gates=0
fail=0
run_gate() {
  label="$1"; shift
  gates=$((gates+1))
  out=$("$@" 2>&1); rc=$?
  if [ "$rc" -eq 0 ]; then
    echo "  OK   $label"
  else
    echo "  FAIL $label (exit $rc)"
    echo "$out" | grep -E "✗|FAIL|Error|Traceback" | head -8 | sed "s/^/       /"
    fail=1
  fi
}

echo "== 出貨閘 =="
# 純靜態（毫秒級、零依賴）：捉今次兩類事故（已刪函數引用、死 selector）
run_gate "gate_refs（靜態：UI 函數存在＋語法）" python3 tools/gate_refs.py
run_gate "gate_design（靜態：死 selector）"     python3 tools/gate_design.py
run_gate "preflight"                            python3 tools/preflight.py
# jsdom 全套
run_gate "run.sh (jsdom UI 全套)"               sh tools/ui/run.sh
run_gate "desktop_layout_test"                  node tools/desktop_layout_test.js
run_gate "desktop_gate_test"                    node tools/desktop_gate_test.js
run_gate "deeplink_test"                        node tools/deeplink_test.js
run_gate "record_view_test（紀錄頁兩個渠道）"      node tools/record_view_test.js
run_gate "voice_test（朗讀開關）"                  node tools/voice_test.js
# 真 Chrome 幾何（約 30 秒）—— 冇 Chrome 就 fail（fail-closed，唔可以靜靜當通過）
if [ -x "$CHROME" ]; then
  run_gate "desktop_render_test（真 Chrome 幾何）" "$PWPY" tools/desktop_render_test.py
else
  gates=$((gates+1)); fail=1
  echo "  FAIL desktop_render_test：搵唔到 Chrome（CHROME=$CHROME）"
fi
echo "== 共 $gates 項 =="

if [ "$fail" -ne 0 ]; then
  echo "== 拒絕出貨：有閘未過，唔會 commit / push =="
  exit 1
fi

# 桌面層改動提示（唔 fail，但大聲提醒；pixel 測試約 5 分鐘，唔放入每次 push）
if git diff --quiet HEAD -- index.html 2>/dev/null; then :; else
  if git diff HEAD -- index.html | grep -q "desktop-layer\|dtNav\|dtFoot\|home-acc"; then
    echo "注意：index.html 桌面層有改動 —— 記得另外跑像素零影響測試："
    echo "      $PWPY tools/mobile_zero_impact.py"
  fi
fi

if [ -z "$(git status --porcelain)" ]; then echo "== 冇改動，唔需要出貨 =="; exit 0; fi

git add -A || exit 1
git commit -q -m "$MSG" || exit 1
git push origin main || exit 1
echo "== 已出貨 =="
git log --oneline -1
echo "index.html md5: $(md5sum index.html | cut -c1-32)"
echo "sw.js     md5: $(md5sum sw.js | cut -c1-32)"
