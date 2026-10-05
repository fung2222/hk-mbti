#!/bin/sh
# hk-mbti UI 回歸測試（jsdom）— 由 Roy 2026-09-29 要求永久保存
# 用法：sh tools/ui/run.sh
# 需要 jsdom：npm i --prefix tools/ui jsdom  （只需一次；唔會影響 repo 其他嘢）
cd "$(dirname "$0")/../.." || exit 1
if [ -d tools/ui/node_modules/jsdom ]; then
  export NODE_PATH="$PWD/tools/ui/node_modules"
elif [ -d /opt/data/profiles/apps/cache/scratch/harness/node_modules/jsdom ]; then
  export NODE_PATH=/opt/data/profiles/apps/cache/scratch/harness/node_modules
else
  echo "缺少 jsdom。請先執行：npm i --prefix tools/ui jsdom"
  exit 1
fi
FAIL=0
FILES=0
TOTAL=0
for t in tools/ui/*_test.js; do
  printf '%-42s ' "$(basename "$t")"
  out=$(node "$t" 2>&1)
  ec=$?
  FILES=$((FILES+1))
  line=$(printf '%s\n' "$out" | grep -E '全部通過|有失敗|=====' | tail -1)
  printf '%s\n' "$line"
  # canonical 斷言總數：由每檔自己印嘅「（N/M）」或「（N 項）」抽，唔靠人手加
  n=$(printf '%s\n' "$line" | grep -oE '[0-9]+(/[0-9]+)?' | tail -1 | cut -d/ -f1)
  TOTAL=$((TOTAL + ${n:-0}))
  [ "$ec" -eq 0 ] || FAIL=$((FAIL+1))
  printf '%s\n' "$out" | grep -qE '^(✗|===== 有失敗)' && [ "$ec" -eq 0 ] && { echo "   （exit 0 但輸出有行首 ✗ → 當失敗）"; FAIL=$((FAIL+1)); }
done
echo ""
[ "$FAIL" -eq 0 ] && echo "===== 全部 UI 測試通過（$FILES 檔 / $TOTAL 斷言）=====" || echo "===== 有 $FAIL 個測試檔失敗（$FILES 檔 / $TOTAL 斷言）====="
exit $FAIL
