//  read form - call api - render times

import { getStopByCode, getArrivals } from "./api.js";
import {
  parseStopCode,
  formatDue,
  sortArrivals,
  getStopDetails,
  formatStopMeta,
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

// when quick search twice - latest search updates page
let latestRequest = 0;

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

function renderBoard(stop, arrivals) {
  const details = getStopDetails(stop, arrivals);
  const meta = formatStopMeta(details);

  stopName.textContent = details.name;
  stopMeta.textContent = meta;
  stopMeta.hidden = !meta;
  list.replaceChildren(...sortArrivals(arrivals).map(renderRow));
  board.hidden = false;

  status.textContent = arrivals.length ? `${arrivals.length} due at ${details.name}.` : `No buses due at ${details.name} right now.`;
}

// data

async function loadStop(code) {
    const requestId = ++latestRequest;
    results.setAttribute("aria-busy", "true");
    status.textContent = "Loading live bus times...";
    board.hidden = true;

    try {
        const stop = await getStopByCode(code);
        const arrivals = await getArrivals(getStopDetails(stop).id);

        if (requestId !== latestRequest) return; // ignore old, new search started
        renderBoard(stop, arrivals);      
    } catch (err) {
        if (requestId !== latestRequest) return;
        status.textContent = err.message;
    } finally {
        if (requestId === latestRequest) results.setAttribute("aria-busy", "false");
    }
}

// form events

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
