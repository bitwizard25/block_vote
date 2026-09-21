# project
block chain concept voting demonstration

## Deployment

This is two deployables from one repo: a static React frontend and a
stateful Go backend (blockchain ledger, PoW miner, WebSocket telemetry hub,
all in-memory). They can't both live on Vercel — Vercel's serverless
functions are stateless and time-limited, and can't host a background
miner goroutine or persistent WebSocket connections. The frontend fits
Vercel perfectly; the backend needs a host that runs a long-lived process,
such as Railway, Render, or Fly.io.

### Frontend → Vercel (one command)

```bash
npx vercel --prod
```

Run from the repo root. `vercel.json` at the root already points Vercel at
`frontend/` for the build and `frontend/dist` for the output, so no extra
project configuration is needed. The only thing to set once, in the Vercel
project's environment variables:

- `VITE_API_BASE_URL` — the backend's public URL (e.g.
  `https://blockvote-backend.up.railway.app`), no trailing slash.

Without it, the frontend assumes the backend is same-origin (the local dev
proxy, or the Go binary serving both), which is what you want if you ever
deploy them as a single service instead of splitting them.

### Backend → Railway (one command)

```bash
railway up
```

Run from the repo root. `railway.json` and the root `Dockerfile` tell
Railway to build and run the Go backend as a container; `main.go` already
binds to whatever port Railway assigns via `$PORT`. Once it's up, set:

- `ALLOWED_ORIGIN` — your Vercel frontend's exact origin (e.g.
  `https://blockvote-bharat.vercel.app`), so the API only accepts requests
  from your deployed frontend instead of the permissive `*` default.

Render and Fly.io work the same way from the same `Dockerfile` (`render
deploy` / `fly deploy`) if you'd rather use one of those.

### Single-binary alternative

The Go binary also embeds and serves the frontend itself (`web/templates`,
kept in sync with `frontend/dist` — see the build step in `cmd/blockvote`).
Deploying just that one binary to any of the backend hosts above gives you
the whole app from one service and one URL, with no `VITE_API_BASE_URL` or
CORS configuration needed. The tradeoff is losing Vercel's frontend-specific
edge network and preview deployments.
