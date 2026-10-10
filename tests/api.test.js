// ai generated test file for api.js

import { describe, it, expect, vi } from "vitest";
import { tflRequest, getStopByCode, getArrivals } from "../src/api.js";
import { isAllowedPath } from "../api/tfl.js";

const okResponse = (data) => ({ ok: true, status: 200, json: async () => data });
const errResponse = (status) => ({ ok: false, status, json: async () => ({}) });

describe("tflRequest", () => {
  it("calls the local proxy, never TfL directly", async () => {
    const fetchFn = vi.fn().mockResolvedValue(okResponse({}));
    await tflRequest("/StopPoint/Sms/71244", {}, fetchFn);

    const url = fetchFn.mock.calls[0][0];
    expect(url.startsWith("/api/tfl?")).toBe(true);
    expect(url).not.toContain("app_key");
  });

  it("returns parsed JSON on success", async () => {
    const fetchFn = vi.fn().mockResolvedValue(okResponse({ id: "490000077E" }));
    await expect(tflRequest("/StopPoint/Sms/71244", {}, fetchFn))
      .resolves.toEqual({ id: "490000077E" });
  });

  it("throws a friendly TflError on 404", async () => {
    const fetchFn = vi.fn().mockResolvedValue(errResponse(404));
    await expect(tflRequest("/StopPoint/Sms/00000", {}, fetchFn))
      .rejects.toMatchObject({ name: "TflError", status: 404 });
  });

  it("reports offline when fetch itself fails", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(tflRequest("/StopPoint/Sms/71244", {}, fetchFn))
      .rejects.toThrow("offline");
  });
});

describe("getStopByCode", () => {
  it("looks the code up via the SMS endpoint", async () => {
    const fetchFn = vi.fn().mockResolvedValue(okResponse({ naptanId: "490000077E" }));
    await getStopByCode("71244", fetchFn);
    expect(decodeURIComponent(fetchFn.mock.calls[0][0])).toContain("path=/StopPoint/Sms/71244");
  });

  it("names the code in the not-found message", async () => {
    const fetchFn = vi.fn().mockResolvedValue(errResponse(404));
    await expect(getStopByCode("00000", fetchFn)).rejects.toThrow(
      "No bus stop found with code 00000."
    );
  });

  it("treats an empty response as not found", async () => {
    const fetchFn = vi.fn().mockResolvedValue(okResponse(null));
    await expect(getStopByCode("00000", fetchFn)).rejects.toMatchObject({ status: 404 });
  });

  it("passes other errors through unchanged", async () => {
    const fetchFn = vi.fn().mockResolvedValue(errResponse(503));
    await expect(getStopByCode("71244", fetchFn)).rejects.toThrow("TfL isn't responding");
  });
});

describe("getArrivals", () => {
  it("requests arrivals for the stop id", async () => {
    const fetchFn = vi.fn().mockResolvedValue(okResponse([]));
    await getArrivals("490000077E", fetchFn);
    expect(decodeURIComponent(fetchFn.mock.calls[0][0])).toContain(
      "path=/StopPoint/490000077E/Arrivals"
    );
  });
});

describe("proxy allowlist", () => {
  it.each([
    "/StopPoint/Sms/71244",
    "/StopPoint/490000077E/Arrivals",
    "/Line/230/Route/Sequence/outbound",
    "/Line/230/Arrivals/490000077E",
  ])("allows %s", (path) => expect(isAllowedPath(path)).toBe(true));

  it.each([
    "/AccidentStats/2019",
    "/StopPoint/Sms/7124",          // only 4 digits
    "/StopPoint/../Journey",        // path tricks
    "https://evil.example.com",
    undefined,
  ])("blocks %s", (path) => expect(isAllowedPath(path)).toBe(false));
});