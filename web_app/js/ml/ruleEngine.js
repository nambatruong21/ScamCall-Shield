/* ScamCall Shield - manipulation-tactic rule engine.
 * Scans input text against BOTH Vietnamese and English pattern sets
 * (input language is independent of UI language). Matching is
 * case-insensitive and diacritic-insensitive via a same-length character
 * fold, so evidence offsets stay valid for highlighting.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var FOLD_CACHE = Object.create(null);
  function foldChar(ch) {
    var f = FOLD_CACHE[ch];
    if (f !== undefined) return f;
    if (ch === "\u0111") f = "d";            // đ
    else if (ch === "\u0110") f = "d";       // Đ
    else {
      var d = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      f = d.length ? d[0] : ch;
    }
    FOLD_CACHE[ch] = f;
    return f;
  }
  /** Same-length fold: "Chuyển Tiền" -> "chuyen tien" (indices preserved). */
  function fold(s) {
    var out = "";
    for (var i = 0; i < s.length; i++) out += foldChar(s[i].toLowerCase());
    return out;
  }

  function allRules() {
    var R = g.SCS_RULES || {};
    return [].concat(R.vi || [], R.en || []);
  }

  /* Protective phrasing typical of awareness messages and legitimate OTP
   * notices. Each unique hit dampens the rule score (capped), reducing
   * false positives on warnings ABOUT scams. Folded, diacritic-free. */
  var PROTECTIVE = [
    "khong bao gio yeu cau", "khong chia se ma", "dung chia se ma",
    "tuyet doi khong chia se", "qua kenh chinh thuc", "tren app chinh thuc",
    "gia danh", "lua dao", "canh giac", "can than gium",
    "never share", "we never ask", "do not share this code", "stay alert",
    "official channels", "official app", "pretending to be", "scammers", "be careful everyone",
    "ke ca nhan vien", "co hieu luc trong", "valid for", "if this wasn't you", "neu khong phai ban"
  ];

  function findAll(haystack, needle) {
    var idx = 0, out = [];
    while ((idx = haystack.indexOf(needle, idx)) !== -1) {
      out.push(idx);
      idx += needle.length;
    }
    return out;
  }

  function wordBoundaryOk(folded, start, end) {
    var WC = /[a-z0-9_]/;
    var before = start > 0 ? folded[start - 1] : "";
    var after = end < folded.length ? folded[end] : "";
    return !(WC.test(before)) && !(WC.test(after));
  }

  /**
   * scan(text) -> {
   *   matches: [{start, end, text, cat, ruleId, w}],   // de-overlapped, sorted
   *   categories: {cat: {count, w, samples[]}},
   *   score: 0-100
   * }
   */
  function scan(text) {
    text = String(text || "");
    var folded = fold(text);
    var raw = [];
    var rules = allRules();

    for (var r = 0; r < rules.length; r++) {
      var rule = rules[r];
      for (var p = 0; p < rule.p.length; p++) {
        var pat = fold(rule.p[p]);
        if (pat.length < 2) continue;
        var hits = findAll(folded, pat);
        for (var h = 0; h < hits.length; h++) {
          var s = hits[h], e = s + pat.length;
          if (!wordBoundaryOk(folded, s, e)) continue;
          raw.push({ start: s, end: e, text: text.slice(s, e), cat: rule.cat, ruleId: rule.id, w: rule.w });
        }
      }
    }

    // De-overlap: prefer higher weight, then longer span.
    raw.sort(function (a, b) { return (b.w - a.w) || ((b.end - b.start) - (a.end - a.start)) || (a.start - b.start); });
    var kept = [];
    for (var i = 0; i < raw.length; i++) {
      var m = raw[i], clash = false;
      for (var j = 0; j < kept.length; j++) {
        if (m.start < kept[j].end && kept[j].start < m.end) { clash = true; break; }
      }
      if (!clash) kept.push(m);
    }
    kept.sort(function (a, b) { return a.start - b.start; });

    // Aggregate per category with diminishing returns per extra hit.
    var categories = Object.create(null), score = 0;
    for (i = 0; i < kept.length; i++) {
      var c = kept[i].cat;
      if (!categories[c]) categories[c] = { count: 0, w: kept[i].w, samples: [] };
      categories[c].count++;
      if (categories[c].samples.length < 3) categories[c].samples.push(kept[i].text);
    }
    for (var cat in categories) {
      var info = categories[cat];
      var extra = Math.min(info.count - 1, 2);
      score += info.w * (1 + 0.3 * extra);
    }

    var protective = 0;
    for (i = 0; i < PROTECTIVE.length; i++) {
      if (folded.indexOf(PROTECTIVE[i]) !== -1) protective++;
    }
    score -= Math.min(protective, 2) * 12;
    score = Math.max(0, Math.min(100, Math.round(score)));

    return { matches: kept, categories: categories, score: score, protective: protective };
  }

  g.SCS.rules = { scan: scan, fold: fold };
})(typeof window !== "undefined" ? window : globalThis);
