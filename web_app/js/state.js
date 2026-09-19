/* ScamCall Shield - app state & history store (Dev Guide 5.7, P1).
 * Holds transient UI state and an opt-in, on-device history (localStorage).
 * History entries store a REDACTED copy of the input (OTP/account/phone masked)
 * so a saved record never persists raw secrets.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var HIST_KEY = "scs_history";
  var FAMILY_KEY = "scs_family";
  var MAX_HISTORY = 50;

  var state = {
    currentView: "home",
    activeTab: "text",
    lastResult: null,
    statuses: { clicked: false, shared: false, paid: false },
    familyMode: false,
    saveToHistory: false
  };

  function readJSON(key, fallback) {
    try { var s = g.localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { g.localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  /* ---- history ---- */
  function list() {
    var arr = readJSON(HIST_KEY, []);
    return Array.isArray(arr) ? arr : [];
  }
  function save(result) {
    var arr = list();
    var redact = g.SCS.redaction ? g.SCS.redaction.redact : function (x) { return x; };
    var preview = redact(String(result.inputText || "")).slice(0, 280);
    arr.unshift({
      id: result.id,
      at: result.at,
      sourceType: result.sourceType,
      overallScore: result.overallScore,
      riskLevel: result.riskLevel,
      topType: result.topType,
      preview: preview,
      categories: Object.keys(result.flagCategories || {})
    });
    if (arr.length > MAX_HISTORY) arr = arr.slice(0, MAX_HISTORY);
    writeJSON(HIST_KEY, arr);
    return arr;
  }
  function get(id) { return list().filter(function (r) { return r.id === id; })[0] || null; }
  function deleteOne(id) {
    var arr = list().filter(function (r) { return r.id !== id; });
    writeJSON(HIST_KEY, arr);
    return arr;
  }
  function deleteAll() { try { g.localStorage.removeItem(HIST_KEY); } catch (e) {} return []; }

  /* ---- family mode persistence ---- */
  function loadFamily() {
    var v = false;
    try { v = g.localStorage.getItem(FAMILY_KEY) === "1"; } catch (e) {}
    state.familyMode = v;
    return v;
  }
  function setFamily(on) {
    state.familyMode = !!on;
    try { g.localStorage.setItem(FAMILY_KEY, on ? "1" : "0"); } catch (e) {}
  }

  g.SCS.state = {
    get: state,
    history: { list: list, save: save, get: get, deleteOne: deleteOne, deleteAll: deleteAll },
    loadFamily: loadFamily, setFamily: setFamily,
    HIST_KEY: HIST_KEY
  };
})(typeof window !== "undefined" ? window : globalThis);
