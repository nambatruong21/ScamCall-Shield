/* ScamCall Shield - internationalization (Dev Guide 5.8).
 * t(key, params) interpolates {placeholders}. setLang() persists the choice and
 * notifies listeners so the current view can re-render WITHOUT a reload and
 * without losing state. apply(root) localizes [data-i18n] / [data-i18n-ph] /
 * [data-i18n-aria] attributes.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var STORE_KEY = "scs_lang";
  var listeners = [];
  var lang = "vi";

  function dict() { return (g.SCS_LOCALES && g.SCS_LOCALES[lang]) || {}; }

  function detectInitial() {
    var saved = null;
    try { saved = g.localStorage.getItem(STORE_KEY); } catch (e) {}
    if (saved === "vi" || saved === "en") return saved;
    var nav = (g.navigator && (g.navigator.language || (g.navigator.languages && g.navigator.languages[0]))) || "vi";
    return /^en/i.test(nav) ? "en" : "vi";
  }

  function t(key, params) {
    var s = dict()[key];
    if (s == null) s = (g.SCS_LOCALES && g.SCS_LOCALES.vi && g.SCS_LOCALES.vi[key]) || key;
    if (params) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        return params[k] != null ? String(params[k]) : m;
      });
    }
    return s;
  }

  function getLang() { return lang; }
  function bcp47() { return lang === "en" ? "en-US" : "vi-VN"; }

  function setLang(next, opts) {
    if (next !== "vi" && next !== "en") return;
    if (next === lang && !(opts && opts.force)) return;
    lang = next;
    try { g.localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    if (g.document && g.document.documentElement) g.document.documentElement.setAttribute("lang", lang);
    apply(g.document);
    listeners.forEach(function (fn) { try { fn(lang); } catch (e) {} });
  }

  function onChange(fn) { if (typeof fn === "function") listeners.push(fn); }

  /* Localize static markup. Element text/placeholder/aria via data-* attrs. */
  function apply(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
    root.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    root.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
    });
  }

  function init() { lang = detectInitial(); if (g.document && g.document.documentElement) g.document.documentElement.setAttribute("lang", lang); }

  g.SCS.i18n = {
    t: t, getLang: getLang, setLang: setLang, onChange: onChange,
    apply: apply, init: init, bcp47: bcp47, STORE_KEY: STORE_KEY
  };
})(typeof window !== "undefined" ? window : globalThis);
