//  read form - call api - render times

import { getStopByCode, getArrivals } from "./api.js";
import {
  parseStopCode,
  formatDue,
  sortArrivals,
  getStopDetails,
  formatStopMeta,
  formatUpdatedAgo,
} from "./format.js";

const form = document.querySelector("#search-form");
const input = document.querySelector("#stop-code");
const fieldError = document.querySelector("#stop-code-error");
const results = document.querySelector("#results");
const status = document.querySelector("#status");
const board = document.querySelector("#board");
const stopName = document.querySelector("#stop-name");
const stopMeta = document.querySelector("#stop-meta");
const list = document.querySelector("#arrivals");
const rowTemplate = document.querySelector("#arrival-row");
const updated = document.querySelector("#updated");
const refreshButton = document.querySelector("#refresh");

const REFRESH_EVERY_MS = 30_000; // 30 seconds

// when quick search twice - latest search updates page
let latestRequest = 0;

// refresh state
let currentStop = null; // stop on screen, refresh skip code lookup
let lastUpdated = null; // arrivals loaded successfully
let refreshFailed = false; // true if rcent refresh fails
let refreshing = false; // double clicks wont double request
let refreshTimer = null;
let labelTimer = null;

// rendering

function showFieldError(message) {
  fieldError.textContent = message;
  fieldError.hidden = !message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function renderRow(arrival) {
  const row = rowTemplate.content.firstElementChild.cloneNode(true);
  row.querySelector(".route").textContent = arrival.lineName;
  row.querySelector(".destination").textContent = arrival.destinationName;
  row.querySelector(".due").textContent = formatDue(arrival.timeToStation);

  return row;
}

function renderBoard(stop, arrivals, { announce = true } = {}) {
  const details = getStopDetails(stop, arrivals);
  const meta = formatStopMeta(details);

  stopName.textContent = details.name;
  stopMeta.textContent = meta;
  stopMeta.hidden = !meta;
  list.replaceChildren(...sortArrivals(arrivals).map(renderRow));
  board.hidden = false;

  const statusIsHidden = status.classList.contains("visually-hidden");
  if (!announce && arrivals.length && statusIsHidden) return; // if no changes no extra announcement

  if (arrivals.length) {
    // hide text but still announce to screen readers
    status.textContent = `${arrivals.length} buses due at ${details.name}`;
    status.classList.add("visually-hidden");
  } else {
    // if no buses display for all users
    status.textContent = `No buses due at ${details.name} right now.`;
    status.classList.remove("visually-hidden");
  }
}

// update refreh
function updateLabel() {
  if (lastUpdated) {
    const seconds = Math.round((Date.now() - lastUpdated) / 1000);
    updated.textContent = refreshing ? "Updating..." : formatUpdatedAgo(seconds, refreshFailed);
  }
}

// timers
function stopTimers() {
  clearInterval(refreshTimer);
  clearInterval(labelTimer);
}

function startTimers() {
  stopTimers();
  refreshTimer = setInterval(() => refreshArrivals(), REFRESH_EVERY_MS);
  labelTimer = setInterval(updateLabel, 1000);
}

// data

async function loadStop(code) {
    const requestId = ++latestRequest;
    stopTimers();
    results.setAttribute("aria-busy", "true");
    status.textContent = "Loading live bus times...";
    status.classList.remove("visually-hidden");
    board.hidden = true;

    try {
        const stop = await getStopByCode(code);
        const arrivals = await getArrivals(getStopDetails(stop).id);
        if (requestId !== latestRequest) return; // ignore old, new search started
        
        renderBoard(stop, arrivals);
        currentStop = stop;
        lastUpdated = Date.now();
        refreshFailed = false;
        updateLabel();
        startTimers();      
    } catch (err) {
        if (requestId !== latestRequest) return;
        status.textContent = err.message;
    } finally {
        if (requestId === latestRequest) results.setAttribute("aria-busy", "false");
    }
}

// fetch arrivals again for already loaded - on failure keep old times
async function refreshArrivals({ manual = false } = {}) {
  if (!currentStop || refreshing) return;

  const requestId = latestRequest; // new search changes
  refreshing = true;
  refreshButton.setAttribute("aria-busy", "true");
  updateLabel();

  try {
    const arrivals = await getArrivals(getStopDetails(currentStop).id);
    if (requestId !== latestRequest) return; // ignore old

    renderBoard(currentStop, arrivals, { announce: !manual });
    lastUpdated = Date.now();
    refreshFailed = false;
  } catch {
    if (requestId !== latestRequest) {
      refreshFailed = true;
    }
  } finally {
    refreshing = false;
    refreshButton.setAttribute("aria-busy", "false");
    if (requestId === latestRequest) updateLabel();
  }
}

// events

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = parseStopCode(input.value);

    if (!result.ok) {
        showFieldError(result.error);
        input.focus();
        return;
    }

    showFieldError("");
    loadStop(result.code);
});


refreshButton.addEventListener("click", () => {
  refreshArrivals({ manual: true });
  startTimers(); // reset timers on manual refresh
});

// pause when page in background - api calls
document.addEventListener("visibilitychange", () => {
  if (!currentStop) return;
  if (document.hidden) {
    stopTimers();
  } else {
    refreshArrivals();
    startTimers();
  }
});