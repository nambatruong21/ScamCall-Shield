/* ScamCall Shield - Vietnamese phishing Transformer classifier
 * Runs XLM-R ONNX directly in the browser using Transformers.js.
 */
(function (g) {
  "use strict";

  g.SCS = g.SCS || {};

  var MODEL_ID =
    "addidas/scamcall-shield-phishing-xlm-r-onnx";

  var HF_LIB =
    "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

  var classifierPromise = null;

  async function loadClassifier() {
    if (!classifierPromise) {
      classifierPromise = import(HF_LIB)
        .then(async function (hf) {
          hf.env.allowLocalModels = false;

          return hf.pipeline(
            "text-classification",
            MODEL_ID,
            {
              dtype: "q8"
            }
          );
        })
        .catch(function (err) {
          classifierPromise = null;
          throw err;
        });
    }

    return classifierPromise;
  }

  function findScore(results, wantedLabels) {
    for (var i = 0; i < results.length; i++) {
      var label = String(results[i].label || "").toUpperCase();

      if (wantedLabels.indexOf(label) !== -1) {
        return Number(results[i].score);
      }
    }

    return null;
  }

  async function predictScam(text) {
    text = String(text || "").trim();

    if (!text) {
      return {
        available: false,
        scamProbability: null,
        safeProbability: null,
        error: "empty_text"
      };
    }

    try {
      var classifier = await loadClassifier();

      var results = await classifier(
        text,
        {
          top_k: null
        }
      );

      var scamProbability = findScore(
        results,
        ["LABEL_1", "1", "PHISHING", "SCAM"]
      );

      var safeProbability = findScore(
        results,
        ["LABEL_0", "0", "SAFE", "LEGITIMATE"]
      );

      return {
        available: true,
        scamProbability: scamProbability,
        safeProbability: safeProbability,
        model: MODEL_ID,
        raw: results
      };

    } catch (err) {
      console.error(
        "[ScamCall Shield] Transformer error:",
        err
      );

      return {
        available: false,
        scamProbability: null,
        safeProbability: null,
        error: String(
          err && err.message
            ? err.message
            : err
        )
      };
    }
  }

  g.SCS.transformer = {
    predictScam: predictScam,
    load: loadClassifier,
    modelId: MODEL_ID
  };

})(typeof window !== "undefined" ? window : globalThis);