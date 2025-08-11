# Trip Diary App — Render-ready bundle

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```
Create a `.env` with:
```
GOOGLE_MAPS_API_KEY=YOUR_KEY
PORT=3000
```

## Deploy on Render
- Build Command: `npm install`
- Start Command: `npm start`
- Add env var `GOOGLE_MAPS_API_KEY` in the service settings
- Health check: `/health`

The app injects `window.__GOOGLE_MAPS_API_KEY__` at runtime and loads Google Maps dynamically.
