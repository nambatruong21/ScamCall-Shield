/* ScamCall Shield - privacy-preserving usage analytics */
(function (g) {
  "use strict";

  g.SCS = g.SCS || {};

  var ENDPOINT = "/api/analytics";
  var ID_KEY = "scs_analytics_id";

  function getAnonymousId() {
    try {
      var existing = g.localStorage.getItem(ID_KEY);
      if (existing) return existing;

      var id;

      if (
        g.crypto &&
        typeof g.crypto.randomUUID === "function"
      ) {
        id = g.crypto.randomUUID();
      } else {
        id =
          "anon_" +
          Date.now().toString(36) +
          Math.random().toString(36).slice(2);
      }

      g.localStorage.setItem(ID_KEY, id);

      return id;
    } catch (e) {
      return null;
    }
  }

  async function send(eventType, data) {
    data = data || {};

    var payload = {
      event_type: eventType,

      anonymous_id: getAnonymousId(),

      analysis_id: data.analysisId || null,
      input_type: data.inputType || null,
      language: data.language || null,

      risk_level: data.riskLevel || null,
      risk_score:
        typeof data.riskScore === "number"
          ? data.riskScore
          : null,

      scam_type: data.scamType || null,

      transformer_used:
        !!data.transformerUsed,

      transformer_boost:
        Number(data.transformerBoost || 0),

      feedback_value:
        data.feedbackValue || null,

      outcome:
        data.outcome || null
    };

    try {
      var response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(payload),
        keepalive: true
      });

      if (!response.ok) {
        console.warn(
          "[ScamCall Shield] Analytics rejected:",
          response.status
        );
      }

      return response.ok;

    } catch (err) {
      // Analytics failure must never break scam analysis.
      console.warn(
        "[ScamCall Shield] Analytics unavailable"
      );

      return false;
    }
  }

  g.SCS.analytics = {
    send: send,
    getAnonymousId: getAnonymousId
  };

})(typeof window !== "undefined" ? window : globalThis);