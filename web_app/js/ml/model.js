/* ScamCall Shield - Logistic Regression inference (browser).
 * Consumes the artifact in data/model/model.js (window.SCS_MODEL):
 *   binary: prob = sigmoid(x . coef + intercept)
 *   types : softmax over per-class scores (multinomial LR)
 * x is the sparse TF-IDF vector from vectorizer.js.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  function dot(sparse, dense) {
    var s = 0;
    for (var k in sparse) s += sparse[k] * dense[k];
    return s;
  }

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  function softmax(zs) {
    var max = -Infinity, i;
    for (i = 0; i < zs.length; i++) if (zs[i] > max) max = zs[i];
    var sum = 0, out = new Array(zs.length);
    for (i = 0; i < zs.length; i++) { out[i] = Math.exp(zs[i] - max); sum += out[i]; }
    for (i = 0; i < zs.length; i++) out[i] /= sum;
    return out;
  }

  var api = {
    available: function () { return !!g.SCS_MODEL; },
    meta: function () { return g.SCS_MODEL ? g.SCS_MODEL.meta : null; },
    info: function () {
      var m = g.SCS_MODEL;
      return m ? { version: m.version, trained_at: m.trained_at, algorithm: m.algorithm } : null;
    },

    /** P(scam) in [0,1]; null if the model artifact failed to load. */
    predictBinary: function (text) {
      var m = g.SCS_MODEL;
      if (!m) return null;
      var x = g.SCS.vectorizer.vectorize(text, m.vocab, m.idf);
      return sigmoid(dot(x, m.binary.coef) + m.binary.intercept);
    },

    /** Sorted [{id, p}] over scam types; null if unavailable. */
    predictTypes: function (text) {
      var m = g.SCS_MODEL;
      if (!m) return null;
      var x = g.SCS.vectorizer.vectorize(text, m.vocab, m.idf);
      var zs = [], i;
      for (i = 0; i < m.types.labels.length; i++) {
        zs.push(dot(x, m.types.coef[i]) + m.types.intercept[i]);
      }
      var ps = softmax(zs), out = [];
      for (i = 0; i < ps.length; i++) out.push({ id: m.types.labels[i], p: ps[i] });
      out.sort(function (a, b) { return b.p - a.p; });
      return out;
    }
  };

  g.SCS.model = api;
})(typeof window !== "undefined" ? window : globalThis);
