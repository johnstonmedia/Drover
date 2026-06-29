# Drover

An agricultural margin dashboard for the **Australian beef supply chain**. Drover
tracks buy/sell prices and trade margins across four stages — **post-breeding →
backgrounding → feedlot → processing (incl. export)** — locks in livestock
"mobs" at their purchase price, compares routes (e.g. live export from Darwin vs.
trucking south to a feedlot), generates an AI advisor brief, and exports to
Excel. All values in **AUD**.

## Architecture (all free to host)

| Piece | Tech | Hosting |
|---|---|---|
| Web app (UI, auth, data, margins, Excel, email) | Next.js 14 (static export), Firebase, EmailJS | **GitHub Pages** |
| API (AI advisor + price fetcher) | Vercel serverless functions, Groq | **Vercel** |
| Auth + database | Firebase Auth + Firestore | **Firebase** |

Only the `/server` API needs a server, because it holds the **secret Groq key**
and does the MLA/AuctionsPlus fetching. Everything else is static.

```
/app            Next.js App Router pages (home, login, privacy, dashboard, admin)
/components     Shared UI (navbar, footer, dashboard chrome)
/lib            Domain model, margin engine, Firebase, RBAC, Excel, email, API client
/server         Vercel serverless API (advisor + prices) — separate deploy
firestore.rules Security rules to paste into the Firebase console
```

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in values (Firebase config is already filled)
npm run dev                         # http://localhost:3000
```

The `/server` API runs on Vercel; for local advisor/price testing, run it with
`vercel dev` inside `/server` and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`.

## Setup checklist

### 1. Firebase
1. In the [Firebase console](https://console.firebase.google.com) → **Authentication → Sign-in method**, enable: **Google, Email/Password, Phone, Microsoft** (Microsoft needs an Azure app id/secret).
2. **Authentication → Settings → Authorized domains**: add `johnstonmedia.github.io` and `localhost`.
3. **Firestore Database** → create database, then paste `firestore.rules` into the **Rules** tab and Publish.
4. To make yourself the first **site admin**, set the repo Variable `NEXT_PUBLIC_SITE_ADMIN_EMAILS` to your email (comma-separated for several).

### 2. EmailJS (notifications)
Create a service + template at [emailjs.com](https://dashboard.emailjs.com), then
set `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `_TEMPLATE_ID`, `_PUBLIC_KEY`. Template
should accept `to_email`, `to_name`, `subject`, `message`.

### 3. GitHub Pages
1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Repo **Settings → Secrets and variables → Actions → Variables**: add the
   `NEXT_PUBLIC_*` variables listed in `.github/workflows/deploy.yml`
   (Firebase config, EmailJS, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_ADMIN_EMAILS`).
3. Push to `main` → the workflow builds and deploys to
   `https://johnstonmedia.github.io/drover`.

### 4. Vercel API — step-by-step (this is the part you asked me to explain)

Vercel takes the `/server` folder and turns each file in `/server/api` into a
live web address (a "serverless function"). You connect it once to GitHub and it
redeploys on every push.

1. **Sign up** at [vercel.com](https://vercel.com) with your GitHub account (free "Hobby" plan).
2. Click **Add New… → Project**, and **Import** your `drover` repo.
3. On the configure screen:
   - **Root Directory** → click *Edit* and choose **`server`**. (This is key — it
     tells Vercel to deploy only the API, not the whole site.)
   - Framework preset: **Other**. Leave build/output blank.
4. Open **Environment Variables** and add:
   - `GROQ_API_KEY` = your **new** (rotated) Groq key — paste it here, *only* here.
   - `ALLOWED_ORIGIN` = `https://johnstonmedia.github.io`
   - (optional) `GROQ_MODEL`, `MLA_PRICES_URL`, `AUCTIONSPLUS_PRICES_URL`, etc.
5. Click **Deploy**. After ~30s you'll get a URL like
   `https://drover-api.vercel.app`.
6. Test it: open `https://drover-api.vercel.app/api/prices` in your browser — you
   should see JSON (with warnings until the price sources are wired).
7. Copy that base URL into the GitHub repo Variable
   `NEXT_PUBLIC_API_BASE_URL` = `https://drover-api.vercel.app`, then re-run the
   Pages workflow so the site knows where the API lives.

That's it — from then on, **push to GitHub** and both GitHub Pages (site) and
Vercel (API) redeploy automatically.

## The cinematic hero video

The Higgsfield MCP wasn't available when this was built. To add the hero video,
see [`public/README-hero.md`](public/README-hero.md). Until then the hero shows a
poster/dark background with overlay copy — the scrub mechanics already work.

## Important notes on data integrity

- **No fabricated numbers.** Placeholder data is marked `source: 'estimate'` with
  zero values. The price fetcher returns only data it can really retrieve, plus
  warnings — never invented figures.
- **Freight and farm-specific figures are user-supplied.**
- Before automating MLA / AuctionsPlus pulls, confirm you're permitted to fetch
  from those sources (terms of use / data agreement).
