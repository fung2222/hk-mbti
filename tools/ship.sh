#!/bin/sh
# ship.sh - 出貨閘：任何一套測試失敗，直接拒絕 commit + push（唔准靠人眼睇輸出）
# 用法： sh tools/ship.sh "commit message"        （真出貨）
#        SHIP_DRY=1 sh tools/ship.sh "x"          （只跑閘，唔 commit／push，用嚟驗閘／驗 RED）
# 2026-10-04 加：之前試過見到 28/29 都照 push，所以把閘寫入程式碼。
# 2026-10-05 加：靜態守門 A／B（捉「引用已刪函數」同「死 selector」，毫秒級）＋真 Chrome 幾何閘；
#                 閘數由 run_gate 自己數，唔再寫死（上一版寫死「5 項」，加閘時會對唔上）。
# 2026-10-05 加：jsdom 由 scratch 搬入 repo（tools/ui/node_modules）—— scratch 會被定時清理，2026-10-05 真係消失過一次，
#                 令全部 jsdom 測試跑唔到（閘形同虛設）。依家優先搵 repo 內，scratch 只做最後 fallback。
# 2026-10-06 加：改為兩批並行（同一批閘、保護力零變，只係唔再逐個排隊）。
#                 實測：4 個慢閘序列 247.4 秒 → 並行 99.7 秒；快閘一批 2.6 秒。
#                 並行安全理由：全部閘都係唯讀檢查（只讀檔、唔寫檔），6 核 31GB RAM。
#                 保留 fail-fast：快閘（含語法／禁字）紅就即刻停，唔會白等 100 秒。
set -u
cd "$(dirname "$0")/.." || exit 1
if [ -z "${NODE_PATH:-}" ]; then
  if [ -d tools/ui/node_modules/jsdom ]; then
    NODE_PATH="$PWD/tools/ui/node_modules"
  else
    NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules
  fi
fi
export NODE_PATH
: "${PLAYWRIGHT_BROWSERS_PATH:=/opt/data/profiles/apps/cache/pw/browsers}"
export PLAYWRIGHT_BROWSERS_PATH
if [ -z "${CHROME:-}" ]; then
  CHROME=$(ls -d /opt/data/profiles/apps/cache/pw/browsers/*/chrome-linux*/chrome 2>/dev/null | tail -1)
fi
: "${CHROME:=/opt/data/profiles/apps/cache/scratch/pw/browsers/chromium-1243/chrome-linux64/chrome}"
if [ ! -x "$CHROME" ] && [ -x /usr/bin/google-chrome ]; then CHROME=/usr/bin/google-chrome; fi
export CHROME
if [ -z "${PWPY:-}" ]; then
  if [ -x /opt/data/profiles/apps/cache/pwpy/bin/python ]; then PWPY=/opt/data/profiles/apps/cache/pwpy/bin/python
  else PWPY=/opt/data/profiles/apps/cache/scratch/pwpy/bin/python; fi
fi
if [ ! -x "$PWPY" ]; then PWPY=python3; fi

MSG="${1:-}"
if [ -z "$MSG" ] && [ -z "${SHIP_DRY:-}" ]; then echo "用法: sh tools/ship.sh \"commit message\""; exit 2; fi

gates=0
fail=0

# 單閘：output 收集埋一齊（序列用）
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

# 一批並行：每個參數係 "標籤|指令"。跑完逐個報，紅一樣照舊 fail=1（保護力不變）
run_par() {
  _d=$(mktemp -d) || return 1
  _i=0
  for _spec in "$@"; do
    _i=$((_i+1))
    _cmd=${_spec#*|}
    ( sh -c "$_cmd" > "$_d/$_i.out" 2>&1; echo $? > "$_d/$_i.rc" ) &
  done
  wait
  _i=0
  for _spec in "$@"; do
    _i=$((_i+1))
    _label=${_spec%%|*}
    gates=$((gates+1))
    _rc=$(cat "$_d/$_i.rc" 2>/dev/null || echo 97)
    if [ "$_rc" -eq 0 ]; then
      echo "  OK   $_label"
    else
      echo "  FAIL $_label (exit $_rc)"
      grep -E "✗|FAIL|Error|Traceback" "$_d/$_i.out" 2>/dev/null | head -8 | sed "s/^/       /"
      fail=1
    fi
  done
  rm -rf "$_d"
}

echo "== 出貨閘（第 1 批：快閘，並行）=="
# 純靜態 + 快閘：捉「已刪函數引用」「死 selector」「inline script 語法」「全站禁字」。
# 呢批幾秒內完，一紅即刻停 —— 唔會白等慢閘。
run_par \
  "gate_refs（靜態：UI 函數存在＋語法）|python3 tools/gate_refs.py" \
  "gate_design（靜態：死 selector）|python3 tools/gate_design.py" \
  "preflight（含 inline script 語法／禁字）|python3 tools/preflight.py" \
  "question_audit（題庫 109 條結構／計分／文法／重複）|node tools/question_audit.js" \
  "desktop_layout_test|node tools/desktop_layout_test.js" \
  "desktop_gate_test|node tools/desktop_gate_test.js" \
  "voice_test（朗讀開關）|node tools/voice_test.js"

if [ "$fail" -ne 0 ]; then
  echo "== 共 $gates 項（第 1 批）=="
  echo "== 拒絕出貨：快閘未過，唔會跑慢閘、唔會 commit / push =="
  exit 1
fi

echo "== 出貨閘（第 2 批：慢閘，並行）=="
# 真 Chrome 幾何：冇 Chrome 就 fail（fail-closed，唔可以靜靜當通過）
if [ ! -x "$CHROME" ]; then
  gates=$((gates+1)); fail=1
  echo "  FAIL desktop_render_test：搵唔到 Chrome（CHROME=$CHROME）"
else
  run_par \
    "run.sh (jsdom UI 全套)|sh tools/ui/run.sh" \
    "deeplink_test|node tools/deeplink_test.js" \
    "record_view_test（紀錄頁兩個渠道）|node tools/record_view_test.js" \
    "desktop_render_test（真 Chrome 幾何）|\"$PWPY\" tools/desktop_render_test.py"
fi
echo "== 共 $gates 項 =="

if [ "$fail" -ne 0 ]; then
  echo "== 拒絕出貨：有閘未過，唔會 commit / push =="
  exit 1
fi

if [ -n "${SHIP_DRY:-}" ]; then
  echo "== SHIP_DRY：閘全綠，但唔 commit／push（乾跑）=="
  exit 0
fi

# 桌面層改動提示（唔 fail，但大聲提醒；pixel 測試約 5 分鐘，唔放入每次 push）
if git diff --quiet HEAD -- index.html 2>/dev/null; then :; else
  if git diff HEAD -- index.html | grep -q "desktop-layer\|dtNav\|dtFoot\|home-acc"; then
    echo "注意：index.html 桌面層有改動 —— 記得另外跑像素零影響測試："
    echo "      $PWPY tools/mobile_zero_impact.py"
  fi
fi

if [ -z "$(git status --porcelain)" ]; then echo "== 冇改動，唔需要出貨 =="; exit 0; fi

echo "== 將入 commit 嘅檔 =="
git status --short
git add -A || exit 1
git commit -q -m "$MSG" || exit 1
git push origin main || exit 1
echo "== 已出貨 =="
git log --oneline -1
echo "index.html md5: $(md5sum index.html | cut -c1-32)"
echo "sw.js     md5: $(md5sum sw.js | cut -c1-32)"

# 出貨後自動驗 live（唔影響出貨結果，只係報告；GitHub Pages 有時要 5-10 分鐘先上）
if [ "${SHIP_NO_LIVE:-}" != "1" ] && command -v curl >/dev/null 2>&1; then
  _L=$(md5sum index.html | cut -d' ' -f1)
  _n=0
  while [ "$_n" -lt 8 ]; do
    _n=$((_n+1))
    _R=$(curl -s --max-time 10 "https://fung2222.github.io/hk-mbti/index.html?cb=$_n" | md5sum | cut -d' ' -f1)
    if [ "$_R" = "$_L" ]; then echo "== live 已同步（第 $_n 次 poll，md5 一致）=="; break; fi
    sleep 10
  done
  if [ "$_R" != "$_L" ]; then
    echo "== live 未見新版（poll $_n 次）—— 可能 Pages build 未完成；稍後再對 md5。本機=$_L live=$_R =="
  fi
fi
