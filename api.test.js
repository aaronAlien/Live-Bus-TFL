import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchStopCode, fetchLiveArrivals } from "./src/util/api.js";

// env mock
vi.mock("process.env", () => ({
  VITE_TFL_APP_ID: "test_app_id",
  VITE_TFL_APP_KEY: "test_app_key",
}));

// fetch func mock
global.fetch = vi.fn();

// reset every test
describe("TFL API functions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock console.error
    console.error = vi.fn();
    // Mock console.log
    console.log = vi.fn();
  });

  // fetchStopCode
  describe("fetchStopCode", () => {
    it("should throw error for invalid user inputs", async () => {
      await expect(fetchStopCode()).rejects.Throw(
        "Enter a valid bus top code. (5 numbers)"
      );
      await expect(fetchStopCode("")).rejects.Throw(
        "Enter a valid bus top code. (5 numbers)"
      );
      await expect(fetchStopCode("123")).rejects.Throw(
        "Enter a valid bus top code. (5 numbers)"
      );
    });

    // mock empty stop matches
    it("should return null if no stop is found", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ matches: [] }],
      });

      const result = await fetchStopCode("12345");

      expect(result).toBeNull();
    });

    // mock search response
    it("should fetch stop inofmration", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          matches: [{ id: "12345" }],
        }),
      });

      // mock stopInfo
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "12345",
          commonName: "Test Stop",
        }),
      });

      const result = await fetchStopCode("12345");

      expect(result).toEqual({
        id: "12345",
        commonName: "Test Stop",
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // errors
    it("should handle api errors", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchStopCode("12345")).rejects.toThrow(
        "Error searching for bus stop"
      );
    });

    describe("fetchLiveArrivals", () => {
      it("should throw an error for invalid user input", async () => {
        const mockBusArrivals = [
          { expectedArrival: "2025-04-14T12:20:00Z", lineId: "123" },
          { expectedArrival: "2025-04-14T12:10:00Z", lineId: "456" },
          { expectedArrival: "2025-04-14T12:15:00Z", lineId: "789" },
        ];

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockBusArrivals,
        });

        const result = await fetchLiveArrivals("12345");

        // should be sorted
        expect(result[0].lineId).toBe("456");
        expect(result[1].lineId).toBe("789");
        expect(result[2].lineId).toBe("123");

        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      it("should handle API errors", async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        await expect(fetchLiveArrivals("STOP123")).rejects.toThrow(
          "Error fetching live arrivals"
        );
      });
    });

    describe("API request errors", () => {
      it("should handles 404 errors", async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

        await expect(fetchStopCode("12345")).rejects.toThrow(
          "Resource not found."
        );
      });

      it("should handle authentication errors", async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        await expect(fetchStopCode("12345")).rejects.toThrow(
          "Authentication failed."
        );
      });
    });
  });
});
