/* ScamCall Shield - phone number analyzer (Dev Guide 5.4).
 * Local structure validation via libphonenumber-js (window.libphonenumber).
 * Crucially: a valid FORMAT is never reported as "safe" — only as
 * "format valid". Reputation is a clearly-labelled DEMO dataset.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  /* VN mobile prefix -> carrier hint (post-2018 10-digit plan). Indicative
   * only: numbers can be ported while keeping the prefix. */
  var VN_CARRIER = [
    { c: "Viettel", p: ["032", "033", "034", "035", "036", "037", "038", "039", "086", "096", "097", "098"] },
    { c: "VinaPhone", p: ["081", "082", "083", "084", "085", "088", "091", "094"] },
    { c: "MobiFone", p: ["070", "076", "077", "078", "079", "089", "090", "093"] },
    { c: "Vietnamobile", p: ["052", "056", "058", "092"] },
    { c: "Gmobile", p: ["059", "099"] },
    { c: "iTel", p: ["087"] }
  ];

  function vnCarrier(national) {
    var d = national.replace(/\D/g, "");
    if (d.length === 9 && d[0] !== "0") d = "0" + d;
    var p3 = d.slice(0, 3);
    for (var i = 0; i < VN_CARRIER.length; i++) {
      if (VN_CARRIER[i].p.indexOf(p3) !== -1) return VN_CARRIER[i].c;
    }
    return null;
  }

  /* Heuristic line-type when libphonenumber metadata lacks getType().
   * Uses the national digits; conservative, region-aware for VN. */
  function guessType(e164, national, region) {
    var natl = String(national || "").replace(/\D/g, "");
    if (natl.length === 9 && natl[0] !== "0") natl = "0" + natl;
    var intl = String(e164 || "").replace(/[^\d]/g, "");
    if (/^1900/.test(natl) || /^84?1900/.test(intl)) return "PREMIUM_RATE";
    if (/^1800/.test(natl) || /^84?1800/.test(intl)) return "TOLL_FREE";
    if ((region === "VN" || /^84/.test(intl))) {
      if (/^0(3|5|7|8|9)\d{8}$/.test(natl)) return "MOBILE";
      if (/^02\d{8,9}$/.test(natl)) return "FIXED_LINE";
    }
    return "unknown";
  }

  /* Fallback when libphonenumber failed to load: basic VN regex. */
  function fallback(raw, region) {
    var d = String(raw).replace(/[^\d+]/g, "");
    var nat = d.replace(/^\+?84/, "0");
    var valid = /^0(3|5|7|8|9)\d{8}$/.test(nat) || /^02\d{8,9}$/.test(nat);
    var premium = /^1900\d{4,6}$/.test(d.replace(/^\+?84/, ""));
    return {
      ok: valid || premium,
      e164: valid ? "+84" + nat.slice(1) : (premium ? d : null),
      national: nat,
      region: region || "VN",
      type: premium ? "PREMIUM_RATE" : (valid ? "FIXED_LINE_OR_MOBILE" : "unknown"),
      valid: valid, possible: valid || premium,
      carrier: valid ? vnCarrier(nat) : null,
      premium: premium,
      lib: false
    };
  }

  function analyzeStructure(raw, region) {
    region = region || "VN";
    var lib = g.libphonenumber;
    if (!lib || !lib.parsePhoneNumberFromString) return fallback(raw, region);
    var pn;
    try { pn = lib.parsePhoneNumberFromString(String(raw), region); } catch (e) { pn = null; }
    if (!pn) {
      // still report possibility if structurally plausible
      var poss = false;
      try { poss = lib.isPossiblePhoneNumber(String(raw), region); } catch (e2) {}
      return { ok: false, e164: null, national: String(raw), region: region,
        type: "unknown", valid: false, possible: poss, carrier: null, premium: false, lib: true };
    }
    var type = pn.getType ? (pn.getType() || "unknown") : "unknown";
    var national = pn.formatNational ? pn.formatNational() : String(raw);
    if (type === "unknown") type = guessType(pn.number, national, pn.country || region);
    return {
      ok: true,
      e164: pn.number,
      national: national,
      international: pn.formatInternational ? pn.formatInternational() : pn.number,
      region: pn.country || region,
      type: type,
      valid: pn.isValid ? pn.isValid() : false,
      possible: pn.isPossible ? pn.isPossible() : true,
      carrier: (pn.country === "VN") ? vnCarrier(national) : null,
      premium: type === "PREMIUM_RATE",
      lib: true
    };
  }

  /* DEMO reputation lookup. Returns null or {labelVi, labelEn, count}. */
  function reputation(e164) {
    var reports = g.SCS_DEMO && g.SCS_DEMO.phoneReports;
    if (!reports || !e164) return null;
    var arr = Array.isArray(reports) ? reports : Object.keys(reports).map(function (k) {
      var v = reports[k]; return { e164: k, label: (v && v.label) || v, count: (v && v.count) || 0 };
    });
    var digits = String(e164).replace(/\D/g, "");
    for (var i = 0; i < arr.length; i++) {
      var ed = String(arr[i].e164 || "").replace(/\D/g, "");
      if (!ed) continue;
      if (ed === digits ||
          (ed.length >= 7 && digits.indexOf(ed) === 0) ||
          (digits.length >= 7 && ed.indexOf(digits) === 0)) {
        return { labelVi: arr[i].label, labelEn: arr[i].label, count: arr[i].count || 0 };
      }
    }
    return null;
  }

  /**
   * analyze(raw, region) -> phoneMeta
   *   { input, e164, national, region, type, valid, possible, carrier,
   *     premium, reputation, riskScore, lib }
   */
  function analyze(raw, region) {
    var s = analyzeStructure(raw, region);
    var rep = reputation(s.e164);
    var risk = 0;
    if (rep) risk = Math.max(risk, 70);
    if (s.premium) risk = Math.max(risk, 35);
    if (s.ok && !s.valid) risk = Math.max(risk, 20);
    s.reputation = rep;
    s.riskScore = risk;
    s.input = String(raw);
    return s;
  }

  g.SCS.phone = { analyze: analyze, vnCarrier: vnCarrier, reputation: reputation };
})(typeof window !== "undefined" ? window : globalThis);
