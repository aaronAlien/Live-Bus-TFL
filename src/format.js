// reuse and test functions

// input
export function parseStopCode(input) {
    const code = String(input ?? "").replace(/\s+/g, "");

    if (code === "") {
        return { ok: false, error: "Please enter the 5-digit code from the bus stop sign." };
    }
    if (!/^\d{5}$/.test(code)) {
        return { ok: false, error: "Bus stop codes are 5 numbers, e.g., 12345" };
    }
    return { ok: true, code };
}

// arrival time

// tfl timeToStaion = seconds. countdown to show "due" when < 1 minute. round down minutes.

export function formatDue(seconds) {
    if (!Number.isFinite(seconds)) return "-";
    if (seconds < 60) return "Due";
    return `${Math.floor(seconds / 60)} min`;
}

export function sortArrivals(arrivals = []) {
    return [...arrivals].sort((a, b) => a.timeToStation - b.timeToStation);
}

// update
export function formatUpdatedAgo(seconds, failed = false) {
    if (failed) return "Couldn't refresh - showing older times";
    if (seconds < 10) return "Updated just now";
    return ""; // blank label
}

// stop details & stops with no letter.
function cleanLetter(letter) {
    if (!letter || letter === "null" || letter.startsWith("->")) return null;
    return letter;
}

// pull stop header, first arrival fallback. playformName (letter) and direction (towards)

export function getStopDetails(stop, arrivals = []) {
    const towardsProp = stop?.additionalProperties?.find((p) => p.key === "Towards")?.value;
    const first = arrivals[0];

    return {
        id: stop?.naptanId || stop?.id || null,
        name: stop?.commonName || "Unknown stop",
        letter: cleanLetter(stop?.stopLetter) || cleanLetter(first?.platformName),
        towards: towardsProp || first?.towards || null,
        routes: (stop?.lines ?? []).map((line) => line.name),
    };
}

// e.g. Stop K towards Elephant & Castle - or what exists
export function formatStopMeta({ letter, towards }) {
    return [letter && `Stop ${letter}`, towards && `towards ${towards}`].filter(Boolean).join(" - ");
}