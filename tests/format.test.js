// ai generated test file for format.js

import { describe, it, expect } from "vitest";
import {
  parseStopCode,
  formatDue,
  sortArrivals,
  getStopDetails,
  formatStopMeta,
} from "../src/format.js";

describe("parseStopCode", () => {
  it("accepts 5 digits", () => {
    expect(parseStopCode("71244")).toEqual({ ok: true, code: "71244" });
  });

  it("ignores spaces", () => {
    expect(parseStopCode(" 71 244 ")).toEqual({ ok: true, code: "71244" });
  });

  it.each(["", "   ", undefined])("asks for a code when empty (%j)", (input) => {
    expect(parseStopCode(input).error).toBe("Please enter the 5-digit code from the bus stop sign.");
  });

  it.each(["7124", "712445", "71a44", "abcde"])("rejects %s", (input) => {
    expect(parseStopCode(input)).toEqual({
      ok: false,
      error: "Bus stop codes are 5 numbers, e.g., 12345",
    });
  });
});

describe("formatDue", () => {
  it.each([
    [0, "Due"],
    [59, "Due"],
    [60, "1 min"],
    [119, "1 min"],
    [240, "4 min"],
    [1500, "25 min"],
  ])("%i seconds -> %s", (seconds, expected) => {
    expect(formatDue(seconds)).toBe(expected);
  });

  it("handles missing data", () => {
    expect(formatDue(undefined)).toBe("-");
  });
});

describe("sortArrivals", () => {
  it("orders soonest first without changing the original", () => {
    const input = [{ timeToStation: 300 }, { timeToStation: 30 }, { timeToStation: 120 }];
    expect(sortArrivals(input).map((a) => a.timeToStation)).toEqual([30, 120, 300]);
    expect(input[0].timeToStation).toBe(300);
  });
});

describe("getStopDetails", () => {
  const stop = {
    naptanId: "490000077E",
    commonName: "Kennington Station",
    stopLetter: "K",
    additionalProperties: [{ key: "Towards", value: "Elephant & Castle" }],
    lines: [{ name: "415" }, { name: "N133" }],
  };

  it("reads id, name, letter, towards and routes from the stop", () => {
    expect(getStopDetails(stop)).toEqual({
      id: "490000077E",
      name: "Kennington Station",
      letter: "K",
      towards: "Elephant & Castle",
      routes: ["415", "N133"],
    });
  });

  it("drops arrow placeholders and falls back to arrival data", () => {
    const bare = { id: "490X", commonName: "Somewhere", stopLetter: "->W" };
    const arrivals = [{ platformName: "P", towards: "Stratford" }];
    expect(getStopDetails(bare, arrivals)).toMatchObject({
      id: "490X",
      letter: "P",
      towards: "Stratford",
    });
  });

  it("treats the text 'null' as no letter", () => {
    expect(getStopDetails({ stopLetter: "null" }).letter).toBeNull();
  });
});

describe("formatStopMeta", () => {
  it("joins the parts that exist", () => {
    expect(formatStopMeta({ letter: "K", towards: "Oval" })).toBe("Stop K - towards Oval");
    expect(formatStopMeta({ letter: null, towards: "Oval" })).toBe("towards Oval");
    expect(formatStopMeta({ letter: null, towards: null })).toBe("");
  });
});