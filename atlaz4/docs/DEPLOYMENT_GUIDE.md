# Deployment Guide — Permanent Hosting for Atlaz v4

The Atlaz v4 web app is a **zero-dependency static site** (HTML + CSS + vanilla
JS, no build step). That makes it trivial to host **permanently** on any static
host. This guide gives real, long-term options with exact steps.

> **Status note (honest):** The site has been **fully prepared and pushed** to
> the `gh-pages` branch of `github.com/lister526/open-design` under the
> `atlaz4/` folder. The automated deploy agent does **not** have permission to
> flip the GitHub *Pages* toggle or to add a Cloudflare API token for you, so
> the final "go live" step needs **one click from you**. Once done, the site is
> permanent and free.

---

## Option A — GitHub Pages (recommended, free, permanent, already staged)

The content is already on the `gh-pages` branch. Enable Pages:

1. Open **https://github.com/lister526/open-design/settings/pages**
2. **Build and deployment → Source** → **Deploy from a branch**.
3. Branch **`gh-pages`**, folder **`/ (root)`** → **Save**.
4. Wait ~1–2 minutes for the first build.
5. **Permanent URL:**
   ```
   https://lister526.github.io/open-design/atlaz4/
   ```

Every push to `gh-pages/atlaz4/` redeploys automatically.

> Query params on the live site:
> `?demo=1` (skip onboarding) · `?lang=ar` (force language) · `?ccy=EUR` ·
> `?go=dealroom:OPP-4001` (jump into a Deal Room).

### Re-deploy later
```bash
git checkout gh-pages
rm -rf atlaz4 && cp -r path/to/atlaz4/web atlaz4 && touch atlaz4/.nojekyll
git add atlaz4 && git commit -m "deploy: update Atlaz v4" && git push origin gh-pages
```

---

## Option B — Cloudflare Pages (free, permanent, global CDN)

Gives `https://atlaz4.pages.dev`.

**With wrangler (you own the CF account):**
1. Paste your Cloudflare API token (scope *Cloudflare Pages: Edit*) into the
   project's **Deploy panel**.
2. ```bash
   npx wrangler pages project create atlaz4 --production-branch main --compatibility-date 2024-01-01
   npx wrangler pages deploy atlaz4/web --project-name atlaz4
   ```
3. Permanent URL: `https://atlaz4.pages.dev`.

**Or via dashboard (no CLI):** Pages → Create → Connect to Git → pick the repo →
**build output directory** `atlaz4/web`, **no build command** → Deploy.

---

## Option C — Netlify (free, permanent)
1. Netlify → **Add new site → Import from Git** (or drag-drop the `atlaz4/web`
   folder onto the dashboard).
2. Build command: *(none)*. Publish directory: `atlaz4/web`.
3. URL: `https://<your-site>.netlify.app`.

## Option D — Vercel (free, permanent)
1. Vercel → **Add New → Project** → import the repo.
2. Preset **Other**, root `atlaz4/web`, no build command.
3. URL: `https://<your-project>.vercel.app`.

## Option E — Any static host / your own server
No build step, so just copy `atlaz4/web/` to S3+CloudFront, Nginx/Apache,
Firebase Hosting, Surge.sh, Render, etc.
```bash
cd atlaz4/web && python3 -m http.server 8090   # local test
```

---

## Custom domain (any option)
Point a CNAME at the host and add the domain in that host's settings.

## What "permanent" means here
- The source AND the deploy-ready build are committed to git (`atlaz4/web` on the
  working branch, `atlaz4/` on `gh-pages`). They do not depend on the temporary
  sandbox.
- Once any one option is enabled, the public URL is persistent and re-deploys on
  every push.

## Sandbox preview (temporary — NOT permanent)
During development the site is served from a sandbox URL like
`https://8090-…sandbox.novita.ai`. **That URL is temporary** and stops when the
sandbox recycles — use a permanent option above for a lasting site.

## The KMP iOS app
The production product is the KMP + Compose iOS app in `kmp/`. To run it you need
a Mac with Xcode + the KMP toolchain:
```bash
cd kmp && ./gradlew :shared:assemble
# then open iosApp in Xcode and run on a simulator/device
```
(The sandbox has no JDK/Gradle/Xcode, so the KMP app is delivered as build-ready
source, validated structurally and by the shared test logic.)
