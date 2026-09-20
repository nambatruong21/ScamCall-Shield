/* ScamCall Shield - score fusion (Dev Guide 6.3).
 *   finalScore = clamp(0.45*ml + 0.35*rules + 0.15*indicators + 0.05*context, 0, 100)
 * Scam-type shown to the user fuses the ML classifier with domain-context
 * affinity so the label stays sensible even on short inputs.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var WEIGHTS = { ml: 0.45, rules: 0.35, indicators: 0.15, context: 0.05 };

  /* Domain context vocab (folded, diacritic-free; matched on folded text). */
  var CONTEXT = {
    bank_phishing:   ["ngan hang", "the tin dung", "internet banking", "tai khoan", "the atm", "otp", "cvv", "so the", "bank", "card", "banking", "refund", "hoan tien", "sinh trac hoc", "han muc"],
    fake_authority:  ["cong an", "canh sat", "vien kiem sat", "toa an", "thue", "dien luc", "trieu tap", "lenh bat", "police", "court", "tax", "arrest", "warrant", "immigration", "customs", "officer", "dang kiem", "phat nguoi"],
    job_scholarship: ["tuyen", "viec lam", "viec nhe", "cong tac vien", "ctv", "luong", "hoc bong", "thuc tap", "ung tuyen", "job", "salary", "hire", "scholarship", "internship", "chot don", "nhiem vu", "task", "data entry", "dat coc"],
    delivery:        ["buu kien", "buu cuc", "don hang", "shipper", "giao hang", "kho", "hai quan", "van chuyen", "phat lai", "parcel", "courier", "delivery", "customs fee", "shipment", "package", "cod", "thong quan"],
    investment:      ["dau tu", "loi nhuan", "san", "chung khoan", "tien so", "co tuc", "ky quy", "copy trade", "doc lenh", "profit", "trading", "crypto", "token", "invest", "returns", "signal", "margin", "buyback", "lai"],
    account_takeover:["doi so", "muon tien", "facebook", "zalo", "email", "tai khoan bi", "khoi phuc mat khau", "ma xac nhan", "new number", "lost my wallet", "recover your account", "two factor", "2fa", "vi pham ban quyen", "copyright", "nhan ho", "doc cho em"],
    other:           ["trung thuong", "trung giai", "qua tang", "tri an", "sim", "thue bao", "vi dien tu", "chuyen nham", "prize", "won", "gift", "wallet", "cashback", "lottery", "draw", "data mien phi", "gia han"]
  };

  function contextAffinity(foldedText) {
    var aff = {}, total = 0, t, i, hits;
    for (t in CONTEXT) {
      hits = 0;
      for (i = 0; i < CONTEXT[t].length; i++) {
        if (foldedText.indexOf(CONTEXT[t][i]) !== -1) hits++;
      }
      aff[t] = hits;
      total += hits;
    }
    if (total > 0) for (t in aff) aff[t] /= total;
    return { aff: aff, strength: Math.min(1, total / 4) };
  }

  /* Tactic categories also nudge type affinity (explainable mapping). */
  var CAT_TYPE = {
    authority: { fake_authority: 0.7, bank_phishing: 0.15, other: 0.15 },
    remote_app: { fake_authority: 0.5, bank_phishing: 0.3, account_takeover: 0.2 },
    credential: { bank_phishing: 0.45, account_takeover: 0.3, other: 0.25 },
    reward: { other: 0.4, investment: 0.3, job_scholarship: 0.3 },
    too_good: { job_scholarship: 0.5, investment: 0.5 },
    impersonation: { account_takeover: 0.85, other: 0.15 }
  };

  function riskLevel(score) {
    if (score >= 75) return "critical";
    if (score >= 50) return "high";
    if (score >= 25) return "medium";
    return "low";
  }
  function applyTransformerBoost(baseScore, transformerScore) {
  var base = Number(baseScore);
  var transformer = Number(transformerScore);

  if (!isFinite(base)) base = 0;
  if (!isFinite(transformer)) transformer = 0;

  base = Math.max(0, Math.min(100, base));
  transformer = Math.max(0, Math.min(100, transformer));

  // Transformer is only a corroborating signal.
  // It can raise an already-suspicious score, but never lower it.
  if (base < 50 || transformer < 80) {
    return {
      score: Math.round(base),
      boost: 0
    };
  }

  // Medium-risk cases get at most +5.
  // High/critical candidates get at most +10.
  // Transformer only corroborates cases that are already high-risk.
  var maxBoost = 10;

  var boost = Math.round(
    ((transformer - 80) / 20) * maxBoost
  );

  boost = Math.max(0, Math.min(maxBoost, boost));

  return {
    score: Math.min(100, Math.round(base + boost)),
    boost: boost
  };
}

  /**
   * fuse(text, ruleResult, indicatorScore) -> AnalysisResult core
   *   ruleResult: output of SCS.rules.scan(text)
   *   indicatorScore: 0-100 from URLs/QR/file/phone signals
   */
  function fuse(text, ruleResult, indicatorScore) {
    var folded = g.SCS.rules.fold(String(text || ""));
    var ctx = contextAffinity(folded);

    var mlProbRaw = g.SCS.model.available() ? g.SCS.model.predictBinary(text) : null;
    var mlPart = mlProbRaw === null ? ruleResult.score : mlProbRaw * 100; // graceful fallback
    var ctxPart = 0;
    if ((ruleResult.categories.payment || ruleResult.categories.credential || ruleResult.categories.remote_app) && ctx.strength > 0) {
      ctxPart = Math.round(ctx.strength * 100);
    }

    var finalScore = WEIGHTS.ml * mlPart + WEIGHTS.rules * ruleResult.score +
                     WEIGHTS.indicators * (indicatorScore || 0) + WEIGHTS.context * ctxPart;
    finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

    // ---- scam type fusion: 0.65 * ML softmax + 0.35 * (context + tactics) ----
    var mlTypes = g.SCS.model.available() ? g.SCS.model.predictTypes(text) : null;
    var blend = {}, t;
    var labels = mlTypes ? mlTypes.map(function (x) { return x.id; }) : Object.keys(CONTEXT);
    for (var i = 0; i < labels.length; i++) blend[labels[i]] = 0;
    if (mlTypes) for (i = 0; i < mlTypes.length; i++) blend[mlTypes[i].id] += 0.65 * mlTypes[i].p;

    var heur = {}; var hSum = 0;
    for (t in CONTEXT) heur[t] = ctx.aff[t] || 0;
    for (var cat in ruleResult.categories) {
      var map = CAT_TYPE[cat];
      if (!map) continue;
      for (t in map) heur[t] = (heur[t] || 0) + map[t] * 0.5;
    }
    for (t in heur) hSum += heur[t];
    if (hSum > 0) for (t in heur) blend[t] = (blend[t] || 0) + 0.35 * (heur[t] / hSum);
    else if (mlTypes) for (i = 0; i < mlTypes.length; i++) blend[mlTypes[i].id] += 0.35 * mlTypes[i].p;

    var types = Object.keys(blend).map(function (id) { return { id: id, confidence: blend[id] }; });
    types.sort(function (a, b) { return b.confidence - a.confidence; });
    types = types.slice(0, 3).filter(function (x) { return x.confidence >= 0.10; });

    return {
      overallScore: finalScore,
      riskLevel: riskLevel(finalScore),
      scamTypes: finalScore >= 25 ? types : [],
      components: {
        ml: Math.round(mlPart), rules: ruleResult.score,
        indicators: Math.round(indicatorScore || 0), context: ctxPart,
        weights: WEIGHTS, mlAvailable: mlProbRaw !== null
      }
    };
  }

  g.SCS.fusion = { fuse: fuse, riskLevel: riskLevel, applyTransformerBoost: applyTransformerBoost, WEIGHTS: WEIGHTS };
})(typeof window !== "undefined" ? window : globalThis);
