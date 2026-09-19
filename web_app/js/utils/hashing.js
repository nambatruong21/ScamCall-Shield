/* ScamCall Shield - SHA-256 via Web Crypto (Dev Guide 5.5). */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};
  function toHex(buf) {
    var v = new Uint8Array(buf), s = "";
    for (var i = 0; i < v.length; i++) s += v[i].toString(16).padStart(2, "0");
    return s;
  }
  g.SCS.hashing = {
    /** ArrayBuffer -> Promise<hex string>. Never uploads anything. */
    sha256: function (buf) {
      var subtle = (g.crypto && g.crypto.subtle) ||
                   (typeof require === "function" ? require("crypto").webcrypto.subtle : null);
      if (!subtle) return Promise.reject(new Error("WebCrypto unavailable"));
      return subtle.digest("SHA-256", buf).then(toHex);
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
