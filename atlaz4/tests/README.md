# Atlaz v4 — Tests

Two CommonJS harnesses validate the web mirror (which shares logic with the KMP app).

## Run
```bash
cd atlaz4/tests
node integrity.cjs     # data minimums, 15-field envelope, i18n, FX, honesty checks
node simulation.cjs    # the must-pass US TikTok Shop $3,000 home-cleaning story
```

## Why `.cjs`
The repo's parent `package.json` is `"type":"module"`. The web JS modules attach
their public objects to `global` as a side effect of loading. The harnesses
therefore `require()` the files (executing the global assignments) and read from
`global.*`. A plain `node -e "require('./x.js')"` would be treated as ESM and
throw — use these `.cjs` files instead.

## Latest results
- `integrity.cjs` — **33/33 PASS**
- `simulation.cjs` — **27/27 PASS** (decision=`lower_price`, cash=`buy`)
