#!/usr/bin/env bash
# Wanka end-to-end smoke test. Requires the dev server running.
# Usage: BASE=http://localhost:8788 bash tests/smoke.sh
set -uo pipefail
BASE="${BASE:-http://localhost:8788}"
pass=0; fail=0
chk(){ if [ "$1" = "$2" ]; then echo "  ✅ $3"; pass=$((pass+1)); else echo "  ❌ $3 (expected '$2' got '$1')"; fail=$((fail+1)); fi; }
j(){ node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s)$1)}catch(e){console.log('')}})"; }

echo "== health =="
H=$(curl -s "$BASE/api/health"); chk "$(echo "$H" | j '.ok')" "true" "health ok"

echo "== config =="
C=$(curl -s "$BASE/api/config"); chk "$(echo "$C" | j '.kinds.length')" "4" "4 kinds"; chk "$(echo "$C" | j '.langs.length')" "9" "9 langs"

echo "== register =="
EMAIL="t$(date +%s%N | head -c 12)@shop.com"
R=$(curl -s -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"pw123456\",\"role\":\"merchant\"}")
TOKEN=$(echo "$R" | j '.token'); chk "$([ -n "$TOKEN" ] && echo yes)" "yes" "got token"; chk "$(echo "$R" | j '.user.credits')" "20" "20 free credits"

echo "== me =="
ME=$(curl -s "$BASE/api/me" -H "Authorization: Bearer $TOKEN"); chk "$(echo "$ME" | j '.user.email')" "$EMAIL" "me returns user"

echo "== generate (single-player value) =="
G=$(curl -s -X POST "$BASE/api/generate" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"product":"便携榨汁杯","category":"home","audience":"US fitness","selling_pts":"便携\n30秒出汁\n可水洗","kinds":["ad_copy","video_script","image_brief","listing"],"langs":["zh","en"]}')
chk "$(echo "$G" | j '.assets.length')" "8" "8 assets (4 kinds x 2 langs)"
chk "$(echo "$G" | j '.credits')" "12" "credits spent (20-8=12)"

echo "== templates (network layer) =="
T=$(curl -s "$BASE/api/templates"); chk "$([ "$(echo "$T" | j '.templates.length')" -ge 10 ] && echo ok)" "ok" ">=10 seeded templates"
TPL=$(echo "$T" | j '.templates[0].id')

echo "== use template (interaction data) =="
U=$(curl -s -X POST "$BASE/api/templates/$TPL/use" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"product":"保温杯","lang":"zh"}')
chk "$(echo "$U" | j '.asset.template_id')" "$TPL" "asset carries template_id"

echo "== report win (outcome data / moat) =="
W=$(curl -s -X POST "$BASE/api/templates/$TPL/report-win" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{}')
chk "$(echo "$W" | j '.ok')" "true" "win recorded"

echo "== no-credit gate (402) =="
# drain credits: try a huge request
Z=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/generate" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"product":"x","kinds":["ad_copy","video_script","image_brief","listing"],"langs":["zh","en","ja","ko","es","pt","ar","hi","fr"]}')
# 36 needed, have 11 -> 402
chk "$Z" "402" "402 when insufficient credits"

echo "== checkout (upgrade) =="
P=$(curl -s -X POST "$BASE/api/billing/checkout" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"plan":"pro"}')
chk "$(echo "$P" | j '.plan')" "pro" "upgraded to pro"

echo "== metrics (North-Star) =="
M=$(curl -s "$BASE/api/metrics"); chk "$([ "$(echo "$M" | j '.generations')" -ge 1 ] && echo ok)" "ok" "generations counted"; chk "$([ "$(echo "$M" | j '.reported_wins')" -ge 1 ] && echo ok)" "ok" "wins counted"

echo ""
echo "==== $pass passed, $fail failed ===="
[ "$fail" -eq 0 ]
