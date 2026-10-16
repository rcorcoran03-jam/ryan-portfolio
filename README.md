# ryan-corcoran.com: deploy folder

Everything that goes live is in this folder, and only this folder.

```
deploy/
  index.html               the site (single file; headshot embedded)
  og-image.jpg             link-preview image (LinkedIn, iMessage, Slack)
  jobquest-focus.png       JobQuest build card image
  liquidity-preview.png    Liquidity build card image
  functions/api/claude.js  "See how I map to your role" fit checker (Cloudflare Pages Function)
```

## Deploy

Pick ONE of these. Do **not** drag and drop in the Cloudflare dashboard: dashboard uploads skip
`functions/`, which is what broke the fit checker before.

**A. Wrangler (from your Mac):**
```
cd ~/Documents/"Job - Career"/ryan-portfolio/deploy
npx wrangler pages deploy . --project-name <your-pages-project>
```
Run it from inside `deploy/` so Wrangler finds `functions/`.

**B. Git auto-deploy:** in Cloudflare → Pages → your project → Settings → Build:
Root directory = `deploy`, Build command = (none), Build output directory = `.`
Then commit and push.

## One-time Cloudflare settings (Pages → Settings)

- `ANTHROPIC_API_KEY`: secret, required
- KV binding named `RATE_LIMIT`: caps the fit checker at 10 analyses per visitor per day
- `CLAUDE_MODEL` (optional): overrides the default `claude-sonnet-4-5`
- `ALLOWED_ORIGINS` (optional): extra origins, e.g. a `*.pages.dev` preview URL, comma-separated

## After deploying

Paste a real job description into the fit checker on the live site and confirm you get a score.

## Editing

Edit `deploy/index.html` directly. Keep the version note in the HTML comment at the top.
Older versions live in `archive/versions/`.
