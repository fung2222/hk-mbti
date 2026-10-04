#!/bin/sh
# ship.sh - 出貨閘：任何一套測試失敗，直接拒絕 commit + push（唔准靠人眼睇輸出）
# 用法： sh tools/ship.sh "commit message"
# 2026-10-04 加：之前試過見到 28/29 都照 push，所以把閘寫入程式碼。
set -u
cd "$(dirname "$0")/.." || exit 1
: "${NODE_PATH:=/opt/data/profiles/apps/cache/scratch/harness/node_modules}"
export NODE_PATH

MSG="${1:-}"
if [ -z "$MSG" ]; then echo "用法: sh tools/ship.sh \"commit message\""; exit 2; fi

fail=0
run_gate() {
  label="$1"; shift
  out=$("$@" 2>&1); rc=$?
  if [ "$rc" -eq 0 ]; then
    echo "  OK   $label"
  else
    echo "  FAIL $label (exit $rc)"
    echo "$out" | grep -E "✗|FAIL|Error|Traceback" | head -8 | sed "s/^/       /"
    fail=1
  fi
}

echo "== 出貨閘 (5 項) =="
run_gate "run.sh (jsdom UI 全套)" sh tools/ui/run.sh
run_gate "desktop_layout_test" node tools/desktop_layout_test.js
run_gate "desktop_gate_test"   node tools/desktop_gate_test.js
run_gate "deeplink_test"       node tools/deeplink_test.js
run_gate "preflight"           python3 tools/preflight.py

if [ "$fail" -ne 0 ]; then
  echo "== 拒絕出貨：有閘未過，唔會 commit / push =="
  exit 1
fi

if [ -z "$(git status --porcelain)" ]; then echo "== 冇改動，唔需要出貨 =="; exit 0; fi

git add -A || exit 1
git commit -q -m "$MSG" || exit 1
git push origin main || exit 1
echo "== 已出貨 =="
git log --oneline -1
echo "index.html md5: $(md5sum index.html | cut -c1-32)"
echo "sw.js     md5: $(md5sum sw.js | cut -c1-32)"
