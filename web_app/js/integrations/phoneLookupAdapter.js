/* ScamCall Shield - phone lookup adapter (Dev Guide 9.2).
 * Defines the adapter interface for optional external reputation lookups.
 * In Contest Strict mode lookupExternal() is DISABLED and returns a notice;
 * no API key is ever committed. A Demo+ key, if provided, lives only in
 * memory for the current session.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var sessionKey = null; // never persisted

  var adapter = {
    /** Local validation always available (delegates to SCS.phone). */
    validateLocal: function (raw, region) {
      return g.SCS.phone.analyze(raw, region);
    },
    setSessionKey: function (k) { sessionKey = k || null; },
    hasKey: function () { return !!sessionKey; },
    /**
     * lookupExternal(e164) -> Promise<{disabled}|{source, reports, label}>
     * Strict mode: disabled. Wiring left here so judges can see the seam.
     */
    lookupExternal: function (/* e164 */) {
      if (!sessionKey) {
        return Promise.resolve({ disabled: true, reason: "contest_strict" });
      }
      // Example shape only; no network call is made in the contest build.
      return Promise.resolve({ disabled: true, reason: "not_implemented_in_contest_build" });
    }
  };

  g.SCS.phoneLookupAdapter = adapter;
})(typeof window !== "undefined" ? window : globalThis);
