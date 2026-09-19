/* ScamCall Shield - file reputation adapter (Dev Guide 9.3).
 * Interface for optional hash-based reputation (e.g. VirusTotal). The contest
 * build never calls the network: it computes the SHA-256 locally and exposes a
 * link to the VirusTotal search UI so the user decides. No key is committed.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var sessionKey = null;

  var adapter = {
    /** ArrayBuffer -> Promise<hex> (local Web Crypto). */
    computeSha256: function (buf) { return g.SCS.hashing.sha256(buf); },
    setSessionKey: function (k) { sessionKey = k || null; },
    hasKey: function () { return !!sessionKey; },
    /** A user-clickable link to the VirusTotal search page (no API). */
    searchUrl: function (hash) {
      return "https://www.virustotal.com/gui/search/" + encodeURIComponent(hash || "");
    },
    /** Strict mode: disabled; returns a notice instead of calling out. */
    lookupHash: function (/* hash */) {
      if (!sessionKey) return Promise.resolve({ disabled: true, reason: "contest_strict" });
      return Promise.resolve({ disabled: true, reason: "not_implemented_in_contest_build" });
    }
  };

  g.SCS.fileReputationAdapter = adapter;
})(typeof window !== "undefined" ? window : globalThis);
