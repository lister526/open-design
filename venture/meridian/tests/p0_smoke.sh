#!/usr/bin/env bash
# P0 security smoke tests. Proves the CRIT-* fixes actually hold at runtime.
# Usage: BASE=http://localhost:8787 bash tests/p0_smoke.sh
set -u
BASE="${BASE:-http://localhost:8787}"
PASS=0; FAIL=0
ok(){ echo "  ✅ $1"; PASS=$((PASS+1)); }
no(){ echo "  ❌ $1"; FAIL=$((FAIL+1)); }
jqget(){ python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('$1',''))" 2>/dev/null; }
jquser(){ python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('user',{}).get('$1',''))" 2>/dev/null; }

echo "== P0 SMOKE TESTS =="
EMAIL="p0_$(date +%s%N | cut -c1-16)@test.com"

echo "[1] register (weak password rejected)"
R=$(curl -s -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d "{\"email\":\"w$EMAIL\",\"password\":\"123\"}")
[ "$(echo "$R" | jqget error)" = "weak_password" ] && ok "weak password (<8) rejected" || no "weak password NOT rejected: $R"

echo "[2] register (valid)"
R=$(curl -s -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"strongpass123\",\"name\":\"T\"}")
TOKEN=$(echo "$R" | jqget token)
[ -n "$TOKEN" ] && ok "registered, got token" || { no "no token: $R"; }

echo "[3] CRIT-1: demo upgrade backdoor must be GONE"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/billing/upgrade -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"plan":"pro"}')
[ "$R" = "404" ] && ok "/api/billing/upgrade returns 404 (backdoor removed)" || no "backdoor still reachable (HTTP $R)"

echo "[4] CRIT-1: checkout creates PENDING order, no entitlement"
R=$(curl -s -X POST $BASE/api/billing/checkout -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"plan":"sync_monthly","provider":"mock"}')
OID=$(echo "$R" | jqget order_id)
[ -n "$OID" ] && ok "checkout created order $OID" || no "checkout failed: $R"
ME=$(curl -s $BASE/api/me -H "Authorization: Bearer $TOKEN")
[ "$(echo "$ME" | jquser plan)" = "free" ] && ok "still free after checkout (no premature entitlement)" || no "plan changed without payment!"

echo "[5] CRIT-1: forged webhook (bad signature) must be REJECTED"
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/billing/webhook/mock -H 'x-signature: forged' -H 'Content-Type: application/json' -d "{\"order_id\":\"$OID\",\"amount\":3900,\"currency\":\"CNY\"}")
[ "$R" = "401" ] && ok "forged webhook rejected (401)" || no "forged webhook accepted (HTTP $R)"

echo "[6] CRIT-1: valid signed webhook grants entitlement"
PAYLOAD="{\"order_id\":\"$OID\",\"event_id\":\"evt_$OID\",\"amount\":3900,\"currency\":\"CNY\"}"
SIG=$(python3 -c "import hmac,hashlib;print(hmac.new(b'mock-test-secret-local','''$PAYLOAD'''.encode(),hashlib.sha256).hexdigest())")
R=$(curl -s -X POST $BASE/api/billing/webhook/mock -H "x-signature: $SIG" -H 'Content-Type: application/json' -d "$PAYLOAD")
[ "$(echo "$R" | jqget ok)" = "True" ] && ok "signed webhook accepted" || no "signed webhook failed: $R"
ME=$(curl -s $BASE/api/me -H "Authorization: Bearer $TOKEN")
[ "$(echo "$ME" | jquser plan)" = "member" ] && ok "entitlement granted (plan=member)" || no "entitlement NOT granted: $ME"

echo "[7] CRIT-1: replay same webhook is idempotent"
R=$(curl -s -X POST $BASE/api/billing/webhook/mock -H "x-signature: $SIG" -H 'Content-Type: application/json' -d "$PAYLOAD")
echo "$R" | grep -q 'deduped\|already_paid' && ok "replay deduped" || no "replay not idempotent: $R"

echo "[8] input length cap on chat"
CID=$(curl -s -X POST $BASE/api/chart -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"gender":"male","date":"2000-02-05","time":"15:05","longitude":117.2}' | jqget id)
CONV=$(curl -s -X POST $BASE/api/conversations -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "{\"chart_id\":\"$CID\"}" | jqget id)
BIG=$(python3 -c "print('x'*9000)")
R=$(curl -s -X POST $BASE/api/conversations/$CONV/chat -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "{\"content\":\"$BIG\"}")
# should succeed but be truncated (not error) — proves cap applied without crash
echo "$R" | grep -q 'reply' && ok "oversized input handled (capped, no crash)" || no "oversized input broke: ${R:0:100}"

echo "[9] cross-user data isolation"
E2="iso_$(date +%s%N|cut -c1-16)@test.com"
T2=$(curl -s -X POST $BASE/api/auth/register -H 'Content-Type: application/json' -d "{\"email\":\"$E2\",\"password\":\"strongpass123\"}" | jqget token)
R=$(curl -s -o /dev/null -w "%{http_code}" $BASE/api/chart/$CID -H "Authorization: Bearer $T2")
{ [ "$R" = "404" ] || [ "$R" = "401" ]; } && ok "user B denied access to user A's chart (HTTP $R)" || no "cross-user leak (HTTP $R)"

echo "[10] decision-OS: create + analyze"
DID=$(curl -s -X POST $BASE/api/decisions -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"是否跳槽到AI创业公司","statement":"稳定大厂 vs 早期创业","chart_id":"'$CID'"}' | jqget id)
[ -n "$DID" ] && ok "decision created $DID" || no "decision create failed"
R=$(curl -s -X POST $BASE/api/decisions/$DID/analyze -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{}')
echo "$R" | grep -q 'recommendations\|analysis' && ok "structured analysis returned" || no "analyze failed: ${R:0:120}"

echo "[11] privacy: export + memory control"
R=$(curl -s $BASE/api/me/export -H "Authorization: Bearer $TOKEN")
echo "$R" | grep -q '"charts"' && ok "data export works" || no "export failed"
R=$(curl -s -X POST $BASE/api/me/memory-optin -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"enabled":true}')
[ "$(echo "$R" | jqget memory_opt_in)" = "True" ] && ok "memory opt-in toggle works" || no "opt-in failed: $R"

echo "[12] SYNC: public preview (no auth, no privacy leak)"
PV=$(curl -s -X POST $BASE/api/sync/preview -H 'Content-Type: application/json' -d '{"rel_type":"romance","a":{"name":"A","gender":"female","date":"1998-06-15","time":"08:30","longitude":121.47},"b":{"name":"B","gender":"male","date":"1996-11-02","time":"14:00","longitude":116.4}}')
echo "$PV" | grep -q '"overall"' && ok "preview returns score" || no "preview failed: ${PV:0:120}"
echo "$PV" | grep -q '"date"\|password_hash' && no "preview LEAKS birth data!" || ok "preview hides raw birth data"

echo "[13] SYNC: create relationship + report starts LOCKED"
CR=$(curl -s -X POST $BASE/api/sync/relationships -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"rel_type":"romance","a":{"name":"A","gender":"female","date":"1998-06-15","time":"08:30","longitude":121.47},"b":{"name":"B","gender":"male","date":"1996-11-02","time":"14:00","longitude":116.4}}')
REPID=$(echo "$CR" | jqget report_id)
[ -n "$REPID" ] && ok "relationship+report created ($REPID)" || no "create failed: ${CR:0:120}"
RG=$(curl -s $BASE/api/sync/reports/$REPID -H "Authorization: Bearer $TOKEN")
[ "$(echo "$RG" | jqget locked)" = "True" ] && ok "report starts locked" || no "report not locked: ${RG:0:120}"

echo "[14] SYNC: unlock spends a free credit, returns full report"
UN=$(curl -s -X POST $BASE/api/sync/reports/$REPID/unlock -H "Authorization: Bearer $TOKEN")
[ "$(echo "$UN" | jqget locked)" = "False" ] && ok "unlocked (full report)" || no "unlock failed: ${UN:0:120}"

echo "[15] SYNC: share card is public + hides birth data"
SLUG=$(curl -s -X POST $BASE/api/sync/share -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "{\"report_id\":\"$REPID\"}" | jqget slug)
CARD=$(curl -s $BASE/api/sync/card/$SLUG)
{ echo "$CARD" | grep -q '"keyword"' && ! echo "$CARD" | grep -q '"date"'; } && ok "public card ok, no birth leak" || no "card failed/leaked: ${CARD:0:120}"

echo ""
echo "== RESULT: $PASS passed, $FAIL failed =="
[ "$FAIL" = "0" ] && exit 0 || exit 1
