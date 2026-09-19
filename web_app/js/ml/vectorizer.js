/* ScamCall Shield - TF-IDF vectorizer (browser re-implementation).
 * Mirrors scikit-learn TfidfVectorizer used in ml_training/train_export.py:
 *   - preprocess: NFC normalize + lowercase
 *   - tokens: maximal runs of [letter|digit|_] with length >= 2
 *     (equivalent to Python token_pattern r"(?u)\b\w\w+\b")
 *   - n-grams: 1-2, bigrams joined with a single space
 *   - tf-idf: raw count * idf (smooth_idf), then L2 normalization
 * Parity with sklearn is verified by tests/parity.test.js.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var TOKEN_RX = /[\p{L}\p{N}_]{2,}/gu;

  function tokenize(text) {
    if (!text) return [];
    var norm = String(text).normalize("NFC").toLowerCase();
    return norm.match(TOKEN_RX) || [];
  }

  function ngrams(tokens) {
    var out = tokens.slice();
    for (var i = 0; i < tokens.length - 1; i++) {
      out.push(tokens[i] + " " + tokens[i + 1]);
    }
    return out;
  }

  /** Returns sparse vector {featureIndex: tfidfValue} (L2-normalized). */
  function vectorize(text, vocab, idf) {
    var grams = ngrams(tokenize(text));
    var counts = Object.create(null);
    for (var i = 0; i < grams.length; i++) {
      var idx = vocab[grams[i]];
      if (idx !== undefined) counts[idx] = (counts[idx] || 0) + 1;
    }
    var sq = 0, k;
    for (k in counts) {
      counts[k] = counts[k] * idf[k];
      sq += counts[k] * counts[k];
    }
    if (sq > 0) {
      var inv = 1 / Math.sqrt(sq);
      for (k in counts) counts[k] *= inv;
    }
    return counts;
  }

  g.SCS.vectorizer = { tokenize: tokenize, ngrams: ngrams, vectorize: vectorize };
})(typeof window !== "undefined" ? window : globalThis);
