/* ScamCall Shield - shared analysis engine (Dev Guide 6.1-6.2).
 * Every analyzer (text, voice, image, video, file, phone) normalizes its
 * input into AnalysisInput and calls analyze(). Output follows Appendix A.
 *
 * Pipeline: extract indicators -> rule engine -> ML inference ->
 *           score fusion -> action plan -> AnalysisResult
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  /* Ordered response playbooks per predicted scam type (i18n keys).
   * Order is the safety sequence itself: Stop -> Don't give -> Verify ->
   * Keep evidence -> Report (Dev Guide 1.2 / 5.7). */
  var ACTION_SETS = {
    bank_phishing:   ["act.no_click", "act.no_otp", "act.open_official_app", "act.call_hotline_card", "act.keep_evidence", "act.report"],
    fake_authority:  ["act.hang_up", "act.no_transfer", "act.no_install", "act.verify_official", "act.tell_family", "act.report_police"],
    job_scholarship: ["act.no_fee_first", "act.check_domain", "act.contact_org_official", "act.no_id_photos", "act.keep_evidence", "act.report"],
    delivery:        ["act.no_link_pay", "act.check_order_app", "act.call_shop", "act.no_strange_qr", "act.keep_evidence", "act.report"],
    investment:      ["act.stop_deposit", "act.no_profit_promise", "act.check_license", "act.no_withdraw_fee", "act.keep_evidence", "act.report"],
    account_takeover:["act.call_old_number", "act.video_verify", "act.private_question", "act.no_transfer_unverified", "act.warn_contacts", "act.report"],
    other:           ["act.no_fee_prize", "act.no_otp", "act.verify_official", "act.block_number", "act.keep_evidence", "act.report"],
    file:            ["act.no_open_file", "act.delete_file", "act.ask_sender_other_channel", "act.scan_av", "act.keep_evidence", "act.report"],
    low:             ["act.low_calm", "act.low_verify_official", "act.low_no_rush", "act.low_keep"]
  };

  var SAFE_REPLY = {
    bank_phishing: "reply.bank", fake_authority: "reply.authority",
    job_scholarship: "reply.job", delivery: "reply.delivery",
    investment: "reply.investment", account_takeover: "reply.takeover", other: "reply.other"
  };

  /* Extra urgent steps when the user already acted (Result step 6). */
  var STATUS_ACTIONS = {
    clicked: ["urgent.disconnect_net", "urgent.change_passwords", "urgent.check_devices"],
    shared:  ["urgent.call_bank_lock", "urgent.change_passwords", "urgent.enable_2fa"],
    paid:    ["urgent.call_bank_recall", "urgent.report_police_now", "urgent.collect_evidence"]
  };

  function actionsFor(typeId, riskLevel, statuses) {
    var keys = [];
    statuses = statuses || {};
    if (statuses.clicked) keys = keys.concat(STATUS_ACTIONS.clicked);
    if (statuses.shared) keys = keys.concat(STATUS_ACTIONS.shared);
    if (statuses.paid) keys = keys.concat(STATUS_ACTIONS.paid);
    var base = (riskLevel === "low")
      ? ACTION_SETS.low
      : (ACTION_SETS[typeId] || ACTION_SETS.other);
    keys = keys.concat(base);
    var seen = Object.create(null);
    return keys.filter(function (k) { if (seen[k]) return false; seen[k] = 1; return true; });
  }

  /**
   * analyze(input) -> AnalysisResult
   * input: { sourceType, rawText, extractedText, qrValues[], extraUrls[],
   *          fileMeta{name,size,mime,extension,sha256,riskScore,indicators[]},
   *          mediaMeta{duration,frameCount,ocrConfidence}, phoneMeta{...},
   *          locale }
   */
  function analyze(input) {
    input = input || {};
    var text = String(input.extractedText || input.rawText || "");
    var extraction = g.SCS.extract.run(text);

    // QR payloads and analyzer-supplied URLs join the URL pool.
    var urls = extraction.urls.slice();
    var seen = Object.create(null);
    urls.forEach(function (u) { seen[u.url.toLowerCase()] = 1; });
    (input.qrValues || []).concat(input.extraUrls || []).forEach(function (v) {
      if (/^(https?:\/\/|www\.)/i.test(String(v))) {
        var s = g.SCS.extract.scoreUrl(String(v));
        if (!seen[s.url.toLowerCase()]) { seen[s.url.toLowerCase()] = 1; urls.push(s); }
      }
    });

    var ruleResult = g.SCS.rules.scan(text);

    var urlScore = 0;
    urls.forEach(function (u) { urlScore = Math.max(urlScore, u.score); });
    var qrScore = (input.qrValues && input.qrValues.length) ? Math.max(35, urlScore) : 0;
    var fileScore = input.fileMeta ? (input.fileMeta.riskScore || 0) : 0;
    var phoneScore = input.phoneMeta ? (input.phoneMeta.riskScore || 0) : 0;
    var indicatorScore = Math.max(urlScore, qrScore, fileScore, phoneScore);

    var fused = g.SCS.fusion.fuse(text, ruleResult, indicatorScore);

    // File-only inputs with no meaningful text: let file indicators speak.
    if (input.sourceType === "file" && text.length < 4 && input.fileMeta) {
      fused.overallScore = Math.max(fused.overallScore, Math.round(fileScore * 0.9));
      fused.riskLevel = g.SCS.fusion.riskLevel(fused.overallScore);
      if (fused.overallScore >= 25 && !fused.scamTypes.length) {
        fused.scamTypes = [{ id: "file", confidence: Math.min(0.95, fileScore / 100) }];
      }
    }

    var topType = fused.scamTypes.length ? fused.scamTypes[0].id : (fused.riskLevel === "low" ? "low" : "other");

    var limitations = [];
    if (input.sourceType === "image" || input.sourceType === "video") limitations.push("lim.ocr");
    if (input.sourceType === "voice") limitations.push("lim.stt");
    if (text && text.length < 40) limitations.push("lim.short");
    if (!fused.components.mlAvailable) limitations.push("lim.no_ml");
    limitations.push("lim.general");

    return {
      id: "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      at: new Date().toISOString(),
      sourceType: input.sourceType || "text",
      inputText: text,
      overallScore: fused.overallScore,
      riskLevel: fused.riskLevel,
      scamTypes: fused.scamTypes,
      topType: topType,
      redFlags: ruleResult.matches,
      flagCategories: ruleResult.categories,
      extracted: {
        urls: urls,
        phoneNumbers: extraction.phones,
        amounts: extraction.amounts,
        otpCodes: extraction.otpCodes,
        qrValues: input.qrValues || [],
        fileHash: input.fileMeta ? input.fileMeta.sha256 : null
      },
      fileMeta: input.fileMeta || null,
      mediaMeta: input.mediaMeta || null,
      phoneMeta: input.phoneMeta || null,
      components: fused.components,
      actions: actionsFor(topType, fused.riskLevel, {}),
      safeReplyKey: SAFE_REPLY[topType] || null,
      limitations: limitations,
      externalSources: []
    };
  }

  g.SCS.engine = { analyze: analyze, actionsFor: actionsFor, SAFE_REPLY: SAFE_REPLY };
})(typeof window !== "undefined" ? window : globalThis);
