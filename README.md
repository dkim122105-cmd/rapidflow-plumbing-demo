# Plumber Demo — productized site template

A single-page, mobile-first demo site (fictional **RapidFlow Plumbing**, Brisbane). Doubles as:
1. **A sales asset** — show a prospect exactly what their $89/mo site looks like.
2. **A clone-master** — duplicate the folder, swap the content below, ship in minutes.

Built with static HTML + Tailwind (Play CDN) + vanilla JS. No build step, no backend. Hosts free on Netlify / Vercel / Cloudflare Pages.

## View it
Open `index.html` in a browser (double-click), or serve locally:
```bash
cd "Plumber Demo" && python3 -m http.server 8000   # → http://localhost:8000
```

## Clone for a new client — swap checklist
Per client, find-and-replace inside `index.html`:

| What | Find | Notes |
|------|------|-------|
| Business name | `RapidFlow` | Logo text, footer, titles |
| Phone | `(07) 3185 0420` and `+61731850420` | The `tel:` links use the `+61…` form |
| Email | `hello@rapidflowplumbing.com.au` | Footer mailto |
| City / suburbs | `Brisbane`, the suburb `<li>` list, service-area copy | Match their real area |
| Licence / ABN | `QBCC Lic. 15234876`, `ABN 00 000 000 000` | Footer trust block |
| Reviews | 3 `<figure>` blocks under `#reviews` | Paste their real Google reviews |
| Map | `iframe` in `#areas` — the `q=` value | Change to the client's suburb/address (URL-encoded). No API key needed for this embed. |
| Trade type | services cards, hero copy | Re-skin for sparkies, roofers, etc. |

### Brand colour (one place)
In the `tailwind.config` `colors` block: change `aqua` (primary accent) and `amber` (CTA). Everything else inherits.

### Make the form real
The two forms (`heroForm`, `quoteForm`) are mocked in the `<script>` (`wireForm`). For production, point the form `action` at a real endpoint:
- **Formspree** — `<form action="https://formspree.io/f/XXded" method="POST">` (simplest)
- **GoHighLevel** — inbound webhook (matches the business plan's lead → SMS/email notify promise)

Then the labelled "Demo note" line in `#quoteSuccess` can be removed.

## Going to production
For real client sites, swap the Tailwind **Play CDN** (`cdn.tailwindcss.com`) for a built stylesheet (Tailwind CLI) so there's no CDN dependency and a smaller payload. The CDN is fine for the demo and quick mockups.
