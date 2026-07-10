import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml, fmtNum, fmtInt } from "../utils";

describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    assert.equal(escapeHtml("a&b"), "a&amp;b");
  });
  it("escapes less-than", () => {
    assert.equal(escapeHtml("a<b"), "a&lt;b");
  });
  it("escapes greater-than", () => {
    assert.equal(escapeHtml("a>b"), "a&gt;b");
  });
  it("escapes double quote", () => {
    assert.equal(escapeHtml('a"b'), "a&quot;b");
  });
  it("escapes single quote", () => {
    assert.equal(escapeHtml("a'b"), "a&#039;b");
  });
  it("escapes all special chars together", () => {
    assert.equal(
      escapeHtml('<script>alert("xss")</script>'),
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });
  it("passes through plain text unchanged", () => {
    assert.equal(escapeHtml("hello world"), "hello world");
  });
  it("converts non-string input to string", () => {
    assert.equal(escapeHtml(123 as any), "123");
  });
  it("escapes ampersand before other chars to avoid double-escaping", () => {
    // & must be replaced first so that the & in &lt; isn't re-escaped
    assert.equal(escapeHtml("&<"), "&amp;&lt;");
  });
  it("handles empty string", () => {
    assert.equal(escapeHtml(""), "");
  });
  it("handles string with only special characters", () => {
    assert.equal(escapeHtml(`<>&"'`), "&lt;&gt;&amp;&quot;&#039;");
  });
});

describe("fmtNum", () => {
  it("formats numbers >= 100 with no decimals", () => {
    assert.equal(fmtNum(100), "100");
  });
  it("formats large numbers >= 100 with no decimals (truncates fractional)", () => {
    assert.equal(fmtNum(123.456), "123");
  });
  it("formats numbers >= 10 with one decimal", () => {
    assert.equal(fmtNum(50), "50.0");
  });
  it("formats exactly 10 with one decimal", () => {
    assert.equal(fmtNum(10), "10.0");
  });
  it("formats numbers >= 1 with two decimals", () => {
    assert.equal(fmtNum(5), "5.00");
  });
  it("formats exactly 1 with two decimals", () => {
    assert.equal(fmtNum(1), "1.00");
  });
  it("formats numbers < 1 with three decimals", () => {
    assert.equal(fmtNum(0.5), "0.500");
  });
  it("formats zero with three decimals", () => {
    assert.equal(fmtNum(0), "0.000");
  });
  it("formats 99.99 at the >= 10 tier with one decimal", () => {
    assert.equal(fmtNum(99.99), "100.0");
  });
});

describe("fmtInt", () => {
  it("formats millions with M suffix", () => {
    assert.equal(fmtInt(1_500_000), "1.5M");
  });
  it("formats exactly one million with M suffix", () => {
    assert.equal(fmtInt(1_000_000), "1.0M");
  });
  it("formats thousands with K suffix", () => {
    assert.equal(fmtInt(12_500), "12.5K");
  });
  it("formats exactly one thousand with K suffix", () => {
    assert.equal(fmtInt(1_000), "1.0K");
  });
  it("formats numbers below 1000 without suffix", () => {
    assert.equal(fmtInt(999), "999");
  });
  it("formats zero without suffix", () => {
    assert.equal(fmtInt(0), "0");
  });
  it("formats large millions with one decimal", () => {
    assert.equal(fmtInt(2_340_000), "2.3M");
  });
});
