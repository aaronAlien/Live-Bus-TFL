// browser calls then this forwards to tfl api with key

const TFL_BASE_URL = "https://api.tfl.gov.uk";

// allowlist - only endpoint needed
const ALLOWED_PATHS = [
  /^\/StopPoint\/Sms\/\d{5}$/, // stop by 5-digit SMS code
  /^\/StopPoint\/[A-Za-z0-9]+$/, // stop details by NaPTAN id
  /^\/StopPoint\/[A-Za-z0-9]+\/Arrivals$/, // live arrivals at a stop
  /^\/Line\/[A-Za-z0-9]+\/Route\/Sequence\/(inbound|outbound)$/, // route stops
  /^\/Line\/[A-Za-z0-9]+\/Arrivals\/[A-Za-z0-9]+$/, // one route at one stop
  /^\/StopPoint$/, // stops near a lat/lon (geolo)
];


export function isAllowedPath(path) {
    return typeof path === "string" && ALLOWED_PATHS.some((re) => re.test(path));
}

export default async function handler(req, res) {
    const { path, ...params} = req.query;

    if (!isAllowedPath(path)) {
        return res.status(400).json({ error: "Endpoint not allowed" });
    }

    const key = process.env.TFL_API_KEY; // server only no vite

    if (!key) {
        return res.status(500).json({ error: "Server missing TFL_API_KEY" });
    }

    const qs = new URLSearchParams({ ...params, app_key: key });

    try {
        const tflRes = await fetch(`${TFL_BASE_URL}${path}?${qs}`);
        const body = await tflRes.text();

        // cache at vercel 15s - sharing one call
        res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=15");
        res.setHeader("Content-Type", "application/json");

        return res.status(tflRes.status).send(body);
    } catch (error) {
        return res.status(502).json({ error: "Could not reach TFL" });
    }
}