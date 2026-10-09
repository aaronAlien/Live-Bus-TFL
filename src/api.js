// broswer side api layer

export class TflError extends Error {
    constructor(status, message) {
        super(message);
        this.name = "TflError";
        this.status = status;
    }
}

// understandable status messages
function messageFor(status) {
    if (status === 404) return "We couldn't find that. Please check the code or try again";
    if (status === 429) return "Too many requests. Please try again later";
    if (status >= 500) return "TfL isn't responding.";
    return "Something went wrong fetching data."
}

export async function tflRequest(path, params = {}, fetchFn = fetch) {
    const qs = new URLSearchParams({ path, ...params });

    let res;

    try {
        res = await fetchFn(`/api/tfl?${qs}`);
    } catch {
        throw new TflError(0, "You appear to be offline. Please check your connection and try again");
    }

    if (!res.ok) throw new TflError(res.status, messageFor(res.status));
    return res.json();
}

// stops

// 5 digit sms code from bus stop sign -> full object in one call
export async function getStopByCode(code, fetchFn = fetch) {
    const notFound = new TflError(404, `No bus stop found with code ${code}.`);

    let stop;
    
    try {
        stop = await tflRequest(`/StopPoint/Sms/${code}`, {}, fetchFn);
    } catch (err) {
        throw err.status === 404 ? notFound : err;
    }

    if (!stop || !stop.naptanId || stop.id) throw notFound;
    return stop;
}

export function getArrivals(naptanId, fetchFn = fetch) {
    return tflRequest(`/StopPoint/${encodeURIComponent(naptanId)}/Arrivals`, {}, fetchFn);
}