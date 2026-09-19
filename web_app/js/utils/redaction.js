/* ScamCall Shield - sensitive-data masking before save/export (Dev Guide 12.2).
 * Masks OTP-like codes, card/account numbers and phone numbers; keeps just
 * enough context for a report to stay meaningful.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};
  function maskDigits(s, keepLast) {
    var d = s.replace(/\D/g, "");
    var keep = keepLast || 0;
    var shown = keep > 0 ? d.slice(-keep) : "";
    return "\u2022".repeat(Math.max(3, d.length - keep)) + shown;
  }
  function redact(text) {
    return String(text || "")
      // 13-19 digit card-like numbers (possibly spaced)
      .replace(/\b(?:\d[ -]?){13,19}\b/g, function (m) { return maskDigits(m, 4); })
      // OTP / verification codes following a keyword
      .replace(/\b(otp|mã|ma|code|passcode|pin)(\D{0,12})(\d{4,8})\b/gi,
        function (_, k, mid) { return k + mid + "\u2022\u2022\u2022\u2022\u2022\u2022"; })
      // phone numbers
      .replace(/(?:\+?84|0)(?:[\s.\-]?\d){8,10}\b/g, function (m) { return maskDigits(m, 3); })
      // 8-16 digit account-like runs
      .replace(/\b\d{8,16}\b/g, function (m) { return maskDigits(m, 2); });
  }
  g.SCS.redaction = { redact: redact, maskDigits: maskDigits };
})(typeof window !== "undefined" ? window : globalThis);
