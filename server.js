// server.js (Render-ready, enhanced)
import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import helmet from "helmet";
import compression from "compression";

dotenv.config();
const app = express();
const publicDir = path.join(process.cwd(), "public");
const isProd = process.env.NODE_ENV === "production";

// Security headers (disable CSP to avoid blocking inline Maps/init scripts)
app.use(helmet({
  contentSecurityPolicy: false
}));

// Gzip compression
app.use(compression());

// Static assets: long cache for hashed files, no cache for HTML by default
app.use(express.static(publicDir, {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store");
    } else {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
}));

// Health check for Render
app.get("/health", (_req, res) => res.status(200).send("ok"));

// Helper to inject ENV into HTML
async function renderIndex(req, res) {
  try {
    const templatePath = path.join(publicDir, "index_env_ready.html");
    let html = await fs.readFile(templatePath, "utf8");

    const marker = "<!-- Google Maps API key will be injected by backend as window.__GOOGLE_MAPS_API_KEY__ -->";
    const keyScript = `<script>
      window.__GOOGLE_MAPS_API_KEY__ = ${JSON.stringify(process.env.GOOGLE_MAPS_API_KEY || "")};
      window.__APP_ENV__ = ${JSON.stringify(isProd ? "production" : "development")};
    </script>`;

    if (html.includes(marker)) {
      html = html.replace(marker, marker + "\n" + keyScript);
    } else {
      html = html.replace("<head>", "<head>\n" + keyScript);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Prevent HTML caching at the edge/CDN
    res.setHeader("Cache-Control", "no-store");
    return res.send(html);
  } catch (err) {
    console.error("Error rendering index:", err);
    return res.status(500).send("Server error");
  }
}

// Root route -> render index with injected keys
app.get("/", renderIndex);

// Optional SPA fallback (uncomment if needed for client-side routing)
// app.get("*", renderIndex);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
