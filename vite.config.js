import { defineConfig, loadEnv } from "vite";
import tflHandler from "./api/tfl.js";
 
// Local stand-in for Vercel: while `npm run dev` is running, requests to
// /api/tfl are answered by the same api/tfl.js code Vercel runs in production.
// This only exists in dev. It is never part of the built site.
function localApi() {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use("/api/tfl", async (req, res) => {
        const url = new URL(req.url, "http://localhost");
 
        // Give the handler the same shape of req/res that Vercel provides
        const vercelReq = { query: Object.fromEntries(url.searchParams) };
        const vercelRes = {
          status(code) { res.statusCode = code; return this; },
          setHeader(name, value) { res.setHeader(name, value); return this; },
          send(body) { res.end(body); return this; },
          json(data) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
            return this;
          },
        };
 
        await tflHandler(vercelReq, vercelRes);
      });
    },
  };
}
 
export default defineConfig(({ mode }) => {
  // Read TFL_APP_KEY from .env.local into the dev server only (not the browser)
  const env = loadEnv(mode, process.cwd(), "");
  if (env.TFL_APP_KEY) process.env.TFL_APP_KEY = env.TFL_APP_KEY;
 
  return {
    plugins: [localApi()],
    test: {
      environment: "node",
      include: ["tests/**/*.test.js"],
    },
  };
});