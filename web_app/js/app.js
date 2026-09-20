/* ScamCall Shield - application orchestrator.
 * Boots the SPA, wires the DOM (index.html) to the analyzers, the rule/ML
 * engine and the rendering layer (ui.js). No business logic lives here beyond
 * coordination; all heavy lifting is in the SCS.* modules.
 */
(function (g) {
  "use strict";
  var doc = g.document;
  var SCS = g.SCS;
  var I = SCS.i18n, UI = SCS.ui, D = SCS.dom, ST = SCS.state;
  var el = function () { return D.el.apply(null, arguments); };
  var t = function (k, p) { return I.t(k, p); };

  /* ---------- tiny helpers ---------- */
  function $(id) { return doc.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function on(node, ev, fn) { if (node) node.addEventListener(ev, fn); }
  function show(node, yes) { if (node) node.hidden = !yes; }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    downloadBlob(filename, blob);
  }
  function downloadBlob(filename, blob) {
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: filename });
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    g.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------- Tesseract offline paths (core+lang via CDN on first use) ---------- */
  g.SCS_TESS = {
    workerPath: "vendor/tesseract.worker.min.js"
    // corePath/langPath intentionally left to Tesseract defaults (CDN).
  };

  /* =====================================================================
   * THEME
   * ===================================================================*/
  var THEME_KEY = "scs_theme";
  function initTheme() {
    var saved = null;
    try { saved = g.localStorage.getItem(THEME_KEY); } catch (e) {}
    var theme = saved || ((g.matchMedia && g.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
    applyTheme(theme);
    on($("scs-theme-toggle"), "click", function () {
      var next = doc.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { g.localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }
  function applyTheme(theme) {
    doc.documentElement.setAttribute("data-theme", theme);
    var btn = $("scs-theme-toggle");
    if (btn) btn.setAttribute("aria-label", t(theme === "dark" ? "theme.toLight" : "theme.toDark"));
  }

  /* =====================================================================
   * FAMILY MODE
   * ===================================================================*/
  function initFamily() {
    var on0 = ST.loadFamily();
    applyFamily(on0);
    on($("scs-family-toggle"), "click", function () {
      var next = !doc.documentElement.classList.contains("scs-family");
      ST.setFamily(next);
      applyFamily(next);
    });
  }
  function applyFamily(yes) {
    doc.documentElement.classList.toggle("scs-family", !!yes);
    var btn = $("scs-family-toggle");
    if (btn) btn.setAttribute("aria-pressed", yes ? "true" : "false");
    // re-render result so action count / read-aloud reflect family mode
    if (ST.get.lastResult) renderResult(ST.get.lastResult);
  }

  /* =====================================================================
   * LANGUAGE
   * ===================================================================*/
  function initLang() {
    I.init();
    I.apply(doc);
    markLang(I.getLang());
    qsa(".scs-lang__btn").forEach(function (b) {
      on(b, "click", function () { I.setLang(b.getAttribute("data-lang")); });
    });
    I.onChange(function (lang) {
      markLang(lang);
      applyTheme(doc.documentElement.getAttribute("data-theme")); // refresh aria
      rerenderDynamic();
    });
  }
  function markLang(lang) {
    qsa(".scs-lang__btn").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
  }

  /* =====================================================================
   * ROUTER
   * ===================================================================*/
  var ROUTES = ["home", "analyze", "learn", "history", "about"];
  function currentRoute() {
    var h = (g.location.hash || "").replace(/^#\/?/, "");
    return ROUTES.indexOf(h) !== -1 ? h : "home";
  }
  function initRouter() {
    on(g, "hashchange", route);
    route();
  }
  function route() {
    var r = currentRoute();
    qsa(".scs-view").forEach(function (v) { v.hidden = v.getAttribute("data-view") !== r; });
    qsa(".scs-nav a[data-route]").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-route") === r);
    });
    if (r === "learn") renderLearn();
    if (r === "history") renderHistory();
    if (r === "about") renderAbout();
    g.scrollTo(0, 0);
  }
  function go(route) { g.location.hash = "#/" + route; }

  /* =====================================================================
   * TABS
   * ===================================================================*/
  function initTabs() {
    qsa(".scs-tab").forEach(function (tab) {
      on(tab, "click", function () { activateTab(tab.getAttribute("data-tab")); });
    });
  }
  function activateTab(name) {
    ST.get.activeTab = name;
    qsa(".scs-tab").forEach(function (tab) {
      var active = tab.getAttribute("data-tab") === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    qsa(".scs-panel").forEach(function (p) {
      var active = p.getAttribute("data-panel") === name;
      p.classList.toggle("is-active", active);
      p.hidden = !active;
    });
  }

  /* =====================================================================
   * PROCESSING + RESULT
   * ===================================================================*/
  function showProcessing() {
    var result = $("scs-result"), proc = $("scs-processing");
    show(result, false); D.clear(result);
    D.clear(proc); show(proc, true);
    return UI.createProcessing(proc);
  }

  function runAnalysis(input) {
    var proc = $("scs-processing");
    var ctrl = showProcessing();
    return new Promise(function (resolve) {
      var i = 0;
      (function tick() {
        if (i <= 3) { ctrl.setStep(i); i++; g.setTimeout(tick, 380); }
        else { ctrl.done(); g.setTimeout(resolve, 180); }
      })();
    }).then(async function () {
      var res = await SCS.engine.analyzeWithTransformer(input);

      show(proc, false);
      ST.get.lastResult = res;
      ST.get.statuses = { clicked: false, shared: false, paid: false };
      renderResult(res);
      return res;
    });
  }

  function sectionH(textKey) { return el("h3", { class: "scs-result__h", text: t(textKey) }); }

  function renderResult(result) {
    var host = $("scs-result");
    if (!host) return;
    D.clear(host);
    var fam = doc.documentElement.classList.contains("scs-family");

    var card = el("div", { class: "scs-result-card scs-result--" + result.riskLevel });

    /* top: gauge + verdict */
    card.appendChild(el("div", { class: "scs-result__top" },
      el("div", { class: "scs-result__gauge" }, UI.gauge(result.overallScore, result.riskLevel)),
      el("div", { class: "scs-result__verdict" },
        el("div", { class: "scs-result__level", text: t("level." + result.riskLevel) }),
        el("p", { class: "scs-result__leveld", text: t("level." + result.riskLevel + ".d") })
      )
    ));

    /* scam types */
    if (result.scamTypes && result.scamTypes.length) {
      card.appendChild(el("section", { class: "scs-result__sec" },
        sectionH("result.types"), UI.typeChips(result.scamTypes)));
    }

    /* evidence highlights */
    if (result.inputText && result.inputText.trim()) {
      card.appendChild(el("section", { class: "scs-result__sec" },
        sectionH("evidence.title"),
        el("p", { class: "scs-hint", text: t("evidence.hint") }),
        el("div", { class: "scs-evidence" }, UI.renderHighlights(result.inputText, result.redFlags))
      ));
    }

    /* manipulation flags */
    var flagSec = el("section", { class: "scs-result__sec" }, sectionH("flags.title"), UI.flagCards(result.flagCategories));
    if (result.components && result.components.rules != null) {
      // protective note if rule engine saw protective phrases
      // (recompute quick scan to know count would be heavy; rely on rules score hint only)
    }
    card.appendChild(flagSec);

    /* file / phone specifics */
    if (result.fileMeta) card.appendChild(el("section", { class: "scs-result__sec" }, sectionH("file.ind.title"), UI.fileCard(result.fileMeta)));
    if (result.phoneMeta) card.appendChild(el("section", { class: "scs-result__sec" }, sectionH("phone.title"), UI.phoneCard(result.phoneMeta)));

    /* extracted indicators */
    card.appendChild(el("section", { class: "scs-result__sec" }, sectionH("ind.title"), UI.indicatorBlock(result)));

    /* status toggles (what did you already do) */
    var actionsBox = el("div", { class: "scs-actions" });
    function repaintActions() {
      var keys = SCS.engine.actionsFor(result.topType, result.riskLevel, ST.get.statuses);
      if (fam) keys = keys.slice(0, 5);
      UI.renderActions(keys, actionsBox);
    }
    var statusWrap = el("div", { class: "scs-status" });
    [["clicked", "status.clicked"], ["shared", "status.shared"], ["paid", "status.paid"]].forEach(function (pair) {
      var cb = el("input", { type: "checkbox" });
      on(cb, "change", function () { ST.get.statuses[pair[0]] = cb.checked; repaintActions(); });
      statusWrap.appendChild(el("label", { class: "scs-status__item" }, cb, el("span", { text: t(pair[1]) })));
    });
    card.appendChild(el("section", { class: "scs-result__sec" },
      sectionH("status.title"),
      el("p", { class: "scs-hint", text: t("status.hint") }),
      statusWrap
    ));

    /* action plan */
    card.appendChild(el("section", { class: "scs-result__sec" }, sectionH("actions.title"), actionsBox));
    repaintActions();

    /* safe reply */
    if (result.safeReplyKey) {
      var replyText = t(result.safeReplyKey);
      var box = el("div", { class: "scs-reply", role: "button", tabindex: "0", title: t("common.copy") },
        el("span", { class: "scs-reply__text", text: replyText }),
        el("span", { class: "scs-reply__copy", "aria-hidden": "true", text: "\u2398" })
      );
      on(box, "click", function () { UI.copy(replyText); });
      on(box, "keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); UI.copy(replyText); } });
      card.appendChild(el("section", { class: "scs-result__sec" }, sectionH("reply.title"), box));
    }

    /* score breakdown */
    card.appendChild(el("section", { class: "scs-result__sec" }, sectionH("why.title"), UI.whyBlock(result.components)));

    /* export / actions bar */
    var bar = el("div", { class: "scs-result__bar" });
    if (fam && g.speechSynthesis) {
      var reading = false;
      var readBtn = el("button", { type: "button", class: "scs-btn scs-btn--secondary" }, el("span", { text: t("result.read") }));
      on(readBtn, "click", function () {
        if (reading) { SCS.voice.stopSpeaking(); reading = false; readBtn.firstChild.textContent = t("result.read"); return; }
        SCS.voice.speak(readAloudText(result), I.bcp47());
        reading = true; readBtn.firstChild.textContent = t("result.read.stop");
      });
      bar.appendChild(readBtn);
    }
    bar.appendChild(btn("scs-btn--ghost", "result.export.txt", function () { exportTxt(result); }));
    bar.appendChild(btn("scs-btn--ghost", "result.export.json", function () { exportJson(result); }));
    bar.appendChild(btn("scs-btn--ghost", "result.save", function () { saveHistory(result); UI.toast("result.saved"); }));
    bar.appendChild(btn("scs-btn--primary", "result.another", function () {
      show(host, false); D.clear(host);
      var tabs = doc.querySelector(".scs-tabs"); if (tabs && tabs.scrollIntoView) tabs.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    card.appendChild(el("div", { class: "scs-result__sec" }, bar,
      el("p", { class: "scs-note", text: t("result.redacted.note") })));

    /* disclaimer */
    card.appendChild(el("p", { class: "scs-disclaimer", text: t("result.disclaimer") }));

    host.appendChild(card);
    show(host, true);
    if (host.scrollIntoView) host.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function btn(variant, key, fn) {
    var b = el("button", { type: "button", class: "scs-btn " + variant, text: t(key) });
    on(b, "click", fn);
    return b;
  }

  function readAloudText(r) {
    var parts = [t("level." + r.riskLevel) + ". " + t("level." + r.riskLevel + ".d")];
    var keys = SCS.engine.actionsFor(r.topType, r.riskLevel, r.statuses || {}).slice(0, 4);
    keys.forEach(function (k) { parts.push(t(k)); });
    return parts.join(". ");
  }

  /* ---------- export ---------- */
  function redact(s) { return SCS.redaction ? SCS.redaction.redact(s || "") : (s || ""); }

  function exportTxt(r) {
    var L = [];
    L.push("ScamCall Shield — " + t("result.title"));
    L.push("====================================");
    L.push(t("result.score") + ": " + r.overallScore + "/100 — " + t("level." + r.riskLevel));
    if (r.scamTypes && r.scamTypes.length) {
      L.push(t("result.types") + ": " + r.scamTypes.map(function (s) { return t("type." + s.id) + " (" + Math.round(s.confidence * 100) + "%)"; }).join(", "));
    }
    var cats = Object.keys(r.flagCategories || {});
    if (cats.length) L.push(t("flags.title") + ": " + cats.map(function (c) { return t("cat." + c); }).join(", "));
    var ex = r.extracted || {};
    if (ex.urls && ex.urls.length) L.push(t("ind.urls") + ": " + ex.urls.map(function (u) { return u.host + " [" + t("level." + u.level) + "]"; }).join(", "));
    if (ex.phoneNumbers && ex.phoneNumbers.length) L.push(t("ind.phones") + ": " + ex.phoneNumbers.map(function (p) { return redact(p); }).join(", "));
    if (ex.amounts && ex.amounts.length) L.push(t("ind.amounts") + ": " + ex.amounts.join(", "));
    if (r.fileMeta && r.fileMeta.sha256) L.push("SHA-256: " + r.fileMeta.sha256);
    L.push("");
    L.push(t("actions.title") + ":");
    SCS.engine.actionsFor(r.topType, r.riskLevel, {}).forEach(function (k, i) { L.push("  " + (i + 1) + ". " + t(k)); });
    L.push("");
    if (r.inputText && r.inputText.trim()) {
      L.push("--- " + t("result.redacted.note") + " ---");
      L.push(redact(r.inputText));
      L.push("");
    }
    L.push(t("result.disclaimer"));
    download("scamcall-report-" + r.id + ".txt", L.join("\n"));
    UI.toast("toast.exported");
  }

  function exportJson(r) {
    var clone = {
      id: r.id, at: r.at, sourceType: r.sourceType,
      overallScore: r.overallScore, riskLevel: r.riskLevel,
      scamTypes: r.scamTypes, topType: r.topType,
      flagCategories: Object.keys(r.flagCategories || {}),
      components: r.components,
      extracted: {
        urls: (r.extracted.urls || []).map(function (u) { return { host: u.host, level: u.level, score: u.score, reasons: u.reasons }; }),
        phoneNumbers: (r.extracted.phoneNumbers || []).map(redact),
        amounts: r.extracted.amounts,
        otpCodes: (r.extracted.otpCodes || []).map(function () { return "******"; }),
        qrValues: r.extracted.qrValues,
        fileHash: r.extracted.fileHash
      },
      fileMeta: r.fileMeta ? { name: r.fileMeta.name, size: r.fileMeta.size, extension: r.fileMeta.extension, magic: r.fileMeta.magic, sha256: r.fileMeta.sha256, riskScore: r.fileMeta.riskScore, indicators: r.fileMeta.indicators } : null,
      phoneMeta: r.phoneMeta ? { e164: r.phoneMeta.e164 ? redact(r.phoneMeta.e164) : null, region: r.phoneMeta.region, type: r.phoneMeta.type, valid: r.phoneMeta.valid, riskScore: r.phoneMeta.riskScore } : null,
      actions: SCS.engine.actionsFor(r.topType, r.riskLevel, {}).map(function (k) { return t(k); }),
      inputTextRedacted: redact(r.inputText),
      limitations: (r.limitations || []).map(function (k) { return t(k); })
    };
    download("scamcall-report-" + r.id + ".json", JSON.stringify(clone, null, 2), "application/json");
    UI.toast("toast.exported");
  }

  function saveHistory(r) { try { ST.history.save(r); } catch (e) {} }
  function saveIfConsent(r) { var c = $("scs-consent"); if (c && c.checked) saveHistory(r); }

  /* =====================================================================
   * TEXT FLOW
   * ===================================================================*/
  function initText() {
    var ta = $("scs-text"), count = $("scs-text-count");
    on(ta, "input", function () { if (count) count.textContent = String(ta.value.length); });
    on($("scs-text-clear"), "click", function () { ta.value = ""; if (count) count.textContent = "0"; ta.focus(); });
    on($("scs-text-analyze"), "click", function () {
      var text = (ta.value || "").trim();
      if (!text) { UI.toast("toast.needText"); ta.focus(); return; }
      runAnalysis({ sourceType: "text", rawText: text, locale: I.getLang() }).then(saveIfConsent);
    });

    // samples
    var host = $("scs-text-samples");
    if (host) {
      D.clear(host);
      var lang = I.getLang();
      var samples = (g.SCS_DEMO && g.SCS_DEMO.text && g.SCS_DEMO.text[lang]) || [];
      samples.forEach(function (s) {
        host.appendChild(btnGhostSm(s.label, function () {
          ta.value = s.value; if (count) count.textContent = String(s.value.length);
          UI.toast("demo.loaded"); ta.focus();
        }));
      });
    }
  }
  function btnGhostSm(label, fn) {
    var b = el("button", { type: "button", class: "scs-chip-btn", text: label });
    on(b, "click", fn); return b;
  }

  /* =====================================================================
   * VOICE FLOW
   * ===================================================================*/
  var recorder = null, transcriber = null, recording = false;
  function initVoice() {
    var status = $("scs-voice-status"), ta = $("scs-voice-transcript");
    var canvas = $("scs-voice-wave"), timer = $("scs-voice-timer");
    var recBtn = $("scs-voice-record"), recLabel = $("scs-voice-record-label");

    if (!SCS.voice.supportsRecording()) {
      if (recBtn) recBtn.disabled = true;
      if (status) status.textContent = t("voice.mic.denied");
    }
    if (!SCS.voice.supportsSTT() && status && SCS.voice.supportsRecording()) {
      status.textContent = t("voice.stt.unsupported");
    }

    on(recBtn, "click", function () {
      if (recording) { stopRec(); return; }
      startRec(canvas, timer, status, ta, recBtn, recLabel);
    });
    on($("scs-voice-analyze"), "click", function () {
      var text = (ta.value || "").trim();
      if (!text) { UI.toast("toast.needText"); ta.focus(); return; }
      runAnalysis({ sourceType: "voice", rawText: text, locale: I.getLang() }).then(saveIfConsent);
    });
  }
  function startRec(canvas, timer, status, ta, recBtn, recLabel) {
    var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
    recorder = SCS.voice.createRecorder({
      maxSeconds: SCS.validators.LIMITS.audioSeconds,
      onTick: function (sec) { if (timer) timer.textContent = sec.toFixed(1) + "s"; },
      onWave: function (buf) { drawWave(ctx, canvas, buf); },
      onStop: function () { /* audio kept in memory only; nothing persisted */ }
    });
    recorder.start().then(function () {
      recording = true;
      if (recBtn) recBtn.classList.add("is-recording");
      if (recLabel) recLabel.textContent = t("voice.stop");
      if (status) status.textContent = SCS.voice.supportsSTT() ? t("voice.stt.active") : t("voice.listening");
      if (SCS.voice.supportsSTT()) {
        transcriber = SCS.voice.createTranscriber({
          lang: I.bcp47(),
          onText: function (final, interim) { ta.value = (final + (interim ? " " + interim : "")).trim(); }
        });
        if (transcriber) transcriber.start();
      }
    }).catch(function () {
      recording = false;
      if (status) status.textContent = t("voice.mic.denied");
      UI.toast("toast.micFail");
    });
  }
  function stopRec() {
    recording = false;
    if (recorder) recorder.stop();
    if (transcriber) { transcriber.stop(); transcriber = null; }
    var recBtn = $("scs-voice-record"), recLabel = $("scs-voice-record-label"), status = $("scs-voice-status");
    if (recBtn) recBtn.classList.remove("is-recording");
    if (recLabel) recLabel.textContent = t("voice.record");
    if (status) status.textContent = "";
  }
  function drawWave(ctx, canvas, buf) {
    if (!ctx) return;
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 2;
    var style = getComputedStyle(doc.documentElement).getPropertyValue("--scs-info") || "#2F80ED";
    ctx.strokeStyle = style.trim() || "#2F80ED";
    ctx.beginPath();
    var slice = w / buf.length;
    for (var i = 0; i < buf.length; i++) {
      var v = buf[i] / 128.0, y = v * h / 2;
      var x = i * slice;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /* =====================================================================
   * IMAGE FLOW
   * ===================================================================*/
  var imgState = null; // {canvas, ctx, w, h, rect, qrValues}
  function initImage() {
    var drop = $("scs-image-drop"), input = $("scs-image-input");
    wireDrop(drop, input, "image/", function (file) { loadImageFile(file); });

    on($("scs-image-crop-reset"), "click", function () {
      if (imgState) imgState.rect = null;
      var box = $("scs-image-cropbox"); if (box) box.hidden = true;
    });
    on($("scs-image-ocr"), "click", runOCR);
    on($("scs-image-analyze"), "click", function () {
      var text = ($("scs-image-text").value || "").trim();
      if (!text && (!imgState || !imgState.qrValues.length)) { UI.toast("toast.needText"); return; }
      runAnalysis({
        sourceType: "image", extractedText: text,
        qrValues: imgState ? imgState.qrValues : [],
        mediaMeta: { ocrConfidence: imgState ? imgState.conf : null },
        locale: I.getLang()
      }).then(saveIfConsent);
    });
  }
  function loadImageFile(file) {
    if (file.size > SCS.validators.LIMITS.imageBytes) { UI.toast("toast.tooBig", { max: SCS.validators.fmtBytes(SCS.validators.LIMITS.imageBytes) }); return; }
    SCS.image.loadImage(file).then(function (r) {
      var canvas = $("scs-image-canvas");
      var info = SCS.image.drawToCanvas(r.img, canvas);
      imgState = { canvas: canvas, ctx: info.ctx, w: info.w, h: info.h, rect: null, qrValues: [], conf: null };
      URL.revokeObjectURL(r.url);
      show($("scs-image-stage"), true);
      setupCrop(canvas);
      // immediate QR pass on full image
      try {
        var data = SCS.image.getImageData(info.ctx, info.w, info.h, null);
        var qr = SCS.image.decodeQR(data);
        applyQR(qr);
      } catch (e) {}
    }).catch(function () { UI.toast("toast.badImage"); });
  }
  function applyQR(qr) {
    if (!imgState) return;
    qr.forEach(function (q) { if (imgState.qrValues.indexOf(q) === -1) imgState.qrValues.push(q); });
    var node = $("scs-image-qr");
    if (node) {
      if (imgState.qrValues.length) { node.hidden = false; node.textContent = t("image.qr.found", { n: imgState.qrValues.length }); }
      else { node.hidden = false; node.textContent = t("image.qr.none"); }
    }
  }
  function setupCrop(canvas) {
    var wrap = $("scs-image-canvas-wrap"), box = $("scs-image-cropbox");
    if (!wrap || !box) return;
    var dragging = false, sx = 0, sy = 0;
    function toCanvas(ev) {
      var rect = canvas.getBoundingClientRect();
      var scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
      var cx = (ev.clientX != null ? ev.clientX : (ev.touches && ev.touches[0].clientX)) - rect.left;
      var cy = (ev.clientY != null ? ev.clientY : (ev.touches && ev.touches[0].clientY)) - rect.top;
      return { x: cx, y: cy, px: cx * scaleX, py: cy * scaleY, scaleX: scaleX, scaleY: scaleY, rect: rect };
    }
    function down(ev) {
      ev.preventDefault();
      var p = toCanvas(ev); dragging = true; sx = p.x; sy = p.y;
      box.hidden = false;
      box.style.left = sx + "px"; box.style.top = sy + "px"; box.style.width = "0px"; box.style.height = "0px";
    }
    function move(ev) {
      if (!dragging) return;
      var p = toCanvas(ev);
      var x = Math.min(sx, p.x), y = Math.min(sy, p.y), w = Math.abs(p.x - sx), h = Math.abs(p.y - sy);
      box.style.left = x + "px"; box.style.top = y + "px"; box.style.width = w + "px"; box.style.height = h + "px";
      var sX = canvas.width / p.rect.width, sY = canvas.height / p.rect.height;
      imgState.rect = { x: Math.round(x * sX), y: Math.round(y * sY), w: Math.round(w * sX), h: Math.round(h * sY) };
    }
    function up() { dragging = false; }
    // avoid double-binding
    if (wrap._scsCrop) return;
    wrap._scsCrop = true;
    on(wrap, "mousedown", down); on(wrap, "mousemove", move); on(g, "mouseup", up);
    on(wrap, "touchstart", down); on(wrap, "touchmove", move); on(g, "touchend", up);
  }
  function runOCR() {
    if (!imgState) { UI.toast("toast.badImage"); return; }
    if (!g.Tesseract) { UI.toast("toast.ocrFail"); return; }
    var prog = $("scs-image-ocr-progress"), confNode = $("scs-image-conf");
    show(prog, true); prog.textContent = t("image.ocr.progress", { pct: 0 });
    // QR on selected region too
    try {
      var data = SCS.image.getImageData(imgState.ctx, imgState.w, imgState.h, imgState.rect);
      applyQR(SCS.image.decodeQR(data));
    } catch (e) {}
    SCS.image.ocr(imgState.canvas, imgState.rect, function (p) {
      prog.textContent = t("image.ocr.progress", { pct: Math.round(p * 100) });
    }).then(function (res) {
      show(prog, false);
      $("scs-image-text").value = res.text || "";
      imgState.conf = res.confidence;
      if (res.confidence != null) {
        show(confNode, true);
        confNode.textContent = t("image.ocr.conf", { pct: Math.round(res.confidence) });
        confNode.classList.toggle("scs-warn-note", res.confidence < 60);
      }
      if (res.confidence != null && res.confidence < 60) UI.toast("image.ocr.low");
    }).catch(function () {
      show(prog, false);
      UI.toast("toast.ocrFail");
    });
  }

  /* =====================================================================
   * VIDEO FLOW
   * ===================================================================*/
  var vidState = null; // {file, scan:{text,qrValues,...}}
  function initVideo() {
    var drop = $("scs-video-drop"), input = $("scs-video-input");
    wireDrop(drop, input, "video/", function (file) { loadVideoFile(file); });
    on($("scs-video-scan"), "click", scanVideo);
    on($("scs-video-analyze"), "click", function () {
      var transcript = ($("scs-video-transcript").value || "").trim();
      var scanned = vidState && vidState.scan ? vidState.scan.text : "";
      var text = (scanned + "\n" + transcript).trim();
      var qr = vidState && vidState.scan ? vidState.scan.qrValues : [];
      if (!text && (!qr || !qr.length)) { UI.toast("toast.needText"); return; }
      runAnalysis({
        sourceType: "video", extractedText: text, qrValues: qr,
        mediaMeta: vidState && vidState.scan ? { duration: vidState.scan.duration, frameCount: vidState.scan.frameCount, ocrConfidence: vidState.scan.ocrConfidence } : null,
        locale: I.getLang()
      }).then(saveIfConsent);
    });
  }
  function loadVideoFile(file) {
    if (file.size > SCS.validators.LIMITS.videoBytes) { UI.toast("toast.tooBig", { max: SCS.validators.fmtBytes(SCS.validators.LIMITS.videoBytes) }); return; }
    SCS.video.loadVideo(file).then(function (ctx) {
      URL.revokeObjectURL(ctx.url);
      if (ctx.duration > SCS.validators.LIMITS.videoSeconds + 0.5) {
        UI.toast("video.tooLong", { sec: SCS.validators.LIMITS.videoSeconds });
        return;
      }
      vidState = { file: file, scan: null };
      show($("scs-video-stage"), true);
      var meta = $("scs-video-meta");
      if (meta) meta.textContent = t("video.meta", { dur: Math.round(ctx.duration), size: SCS.validators.fmtBytes(file.size) });
      D.clear($("scs-video-thumbs"));
    }).catch(function () { UI.toast("toast.videoMeta"); });
  }
  function scanVideo() {
    if (!vidState) return;
    var prog = $("scs-video-progress"), thumbs = $("scs-video-thumbs");
    D.clear(thumbs); show(prog, true); prog.textContent = t("video.frame", { i: 0, n: "?" });
    SCS.video.scan(vidState.file, {
      maxFrames: SCS.validators.LIMITS.ocrFramesMax,
      onProgress: function (i, n, thumb) {
        prog.textContent = t("video.frame", { i: i, n: n });
        var im = el("img", { class: "scs-thumb", src: thumb, alt: "frame " + i });
        thumbs.appendChild(im);
      }
    }).then(function (res) {
      vidState.scan = res;
      show(prog, true);
      prog.textContent = t("video.frames.done", { n: res.frameCount }) + (res.earlyStopped ? " · " + t("video.early") : "");
    }).catch(function () {
      show(prog, false);
      UI.toast("toast.ocrFail");
    });
  }

  /* =====================================================================
   * FILE FLOW
   * ===================================================================*/
  function initFile() {
    var drop = $("scs-file-drop"), input = $("scs-file-input");
    wireDrop(drop, input, "", function (file) { scanFile(file); });
    on($("scs-file-demo"), "click", function () {
      var files = SCS.fileScanner.demoFiles();
      files.forEach(function (f) { downloadBlob(f.name, f.blob); });
      var st = $("scs-file-status"); if (st) st.textContent = t("file.demo.made");
      UI.toast("file.demo.made");
    });
  }
  function scanFile(file) {
    if (file.size > SCS.validators.LIMITS.fileBytes) { UI.toast("toast.tooBig", { max: SCS.validators.fmtBytes(SCS.validators.LIMITS.fileBytes) }); return; }
    var st = $("scs-file-status"); if (st) st.textContent = t("file.scanning");
    SCS.fileScanner.scan(file).then(function (fileMeta) {
      if (st) st.textContent = "";
      runAnalysis({ sourceType: "file", fileMeta: fileMeta, extractedText: "", locale: I.getLang() }).then(saveIfConsent);
    }).catch(function () {
      if (st) st.textContent = t("common.error");
    });
  }

  /* =====================================================================
   * PHONE FLOW
   * ===================================================================*/
  function initPhone() {
    on($("scs-phone-check"), "click", function () {
      var raw = ($("scs-phone-input").value || "").trim();
      if (!raw) { UI.toast("toast.needText"); return; }
      var region = $("scs-phone-country").value || "VN";
      var meta = SCS.phone.analyze(raw, region);
      var msg = ($("scs-phone-msg").value || "").trim();
      runAnalysis({ sourceType: "phone", rawText: msg, phoneMeta: meta, locale: I.getLang() }).then(saveIfConsent);
    });
  }

  /* ---------- shared drop/file input wiring ---------- */
  function wireDrop(drop, input, acceptPrefix, handler) {
    if (!drop || !input) return;
    on(drop, "click", function () { input.click(); });
    on(drop, "keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    on(input, "change", function () { if (input.files && input.files[0]) handler(input.files[0]); });
    ["dragenter", "dragover"].forEach(function (ev) {
      on(drop, ev, function (e) { e.preventDefault(); drop.classList.add("is-drag"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      on(drop, ev, function (e) { e.preventDefault(); drop.classList.remove("is-drag"); });
    });
    on(drop, "drop", function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f && (!acceptPrefix || (f.type || "").indexOf(acceptPrefix) === 0 || acceptPrefix === "")) handler(f);
    });
  }

  /* =====================================================================
   * LEARN (game + glossary + tips)
   * ===================================================================*/
  var quizIdx = 0, quizScore = 0, quizAnswered = false;
  function renderLearn() {
    renderGame();
    renderGlossary();
    renderTips();
  }
  function quizItems() { return (g.SCS_DEMO && g.SCS_DEMO.quiz) || []; }
  function renderGame() {
    var host = $("scs-game"); if (!host) return;
    D.clear(host);
    var items = quizItems();
    if (!items.length) return;
    if (quizIdx >= items.length) { renderGameDone(host, items.length); return; }
    var item = items[quizIdx];
    var lang = I.getLang();
    var text = lang === "en" && item.en ? item.en : item.text;

    host.appendChild(el("div", { class: "scs-game__bar" },
      el("span", { class: "scs-game__q", text: t("game.q", { i: quizIdx + 1, n: items.length }) }),
      el("span", { class: "scs-game__score scs-mono", text: quizScore + "/" + items.length })
    ));
    host.appendChild(el("p", { class: "scs-game__text", text: text }));

    var feedback = el("div", { class: "scs-game__feedback", "aria-live": "polite" });
    var choices = el("div", { class: "scs-game__choices" });
    function choose(saidScam) {
      if (quizAnswered) return;
      quizAnswered = true;
      var correct = saidScam === item.isScam;
      if (correct) quizScore++;
      choices.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
      var why = item.isScam ? t("game.why", { flags: (item.flags || []).map(function (f) { return t("cat." + f); }).join(", ") }) : t("game.whysafe");
      feedback.appendChild(el("div", { class: "scs-game__verdict " + (correct ? "is-correct" : "is-wrong"), text: correct ? t("game.correct") : t("game.wrong") }));
      feedback.appendChild(el("p", { class: "scs-game__why", text: why }));
      var next = el("button", { type: "button", class: "scs-btn scs-btn--primary scs-btn--sm", text: quizIdx + 1 < items.length ? t("game.next") : t("game.done") });
      on(next, "click", function () { quizIdx++; quizAnswered = false; renderGame(); });
      feedback.appendChild(next);
    }
    choices.appendChild(gameChoice("scs-game__btn--scam", "game.scam", function () { choose(true); }));
    choices.appendChild(gameChoice("scs-game__btn--safe", "game.safe", function () { choose(false); }));
    host.appendChild(choices);
    host.appendChild(feedback);
  }
  function gameChoice(cls, key, fn) {
    var b = el("button", { type: "button", class: "scs-game__btn " + cls, text: t(key) });
    on(b, "click", fn); return b;
  }
  function renderGameDone(host, n) {
    host.appendChild(el("div", { class: "scs-game__done" },
      el("p", { class: "scs-game__done-title", text: t("game.done") }),
      el("p", { class: "scs-game__score-final", text: t("game.score", { s: quizScore, n: n }) }),
      (function () {
        var b = el("button", { type: "button", class: "scs-btn scs-btn--primary scs-btn--sm", text: t("game.replay") });
        on(b, "click", function () { quizIdx = 0; quizScore = 0; quizAnswered = false; renderGame(); });
        return b;
      })()
    ));
  }
  function renderGlossary() {
    var host = $("scs-glossary"); if (!host) return;
    D.clear(host);
    ((g.SCS_DEMO && g.SCS_DEMO.glossary) || []).forEach(function (gi) {
      host.appendChild(el("div", { class: "scs-gloss" },
        el("div", { class: "scs-gloss__term", text: gi.term }),
        el("div", { class: "scs-gloss__desc", text: t(gi.k + ".d") })
      ));
    });
  }
  function renderTips() {
    var host = $("scs-tips"); if (!host) return;
    D.clear(host);
    [["tips.student", ["tips.student.1", "tips.student.2", "tips.student.3"]],
     ["tips.parent", ["tips.parent.1", "tips.parent.2", "tips.parent.3"]],
     ["tips.shop", ["tips.shop.1", "tips.shop.2", "tips.shop.3"]]].forEach(function (grp) {
      var ul = el("ul", { class: "scs-tip__list" });
      grp[1].forEach(function (k) { ul.appendChild(el("li", { text: t(k) })); });
      host.appendChild(el("div", { class: "scs-tip" }, el("h4", { class: "scs-tip__h", text: t(grp[0]) }), ul));
    });
  }

  /* =====================================================================
   * HISTORY
   * ===================================================================*/
  function initHistory() {
    on($("scs-history-clear"), "click", function () {
      if (g.confirm(t("history.confirmAll"))) { ST.history.deleteAll(); renderHistory(); UI.toast("toast.deleted"); }
    });
  }
  function renderHistory() {
    var host = $("scs-history"); if (!host) return;
    D.clear(host);
    var list = ST.history.list();
    if (!list.length) { host.appendChild(el("p", { class: "scs-muted", text: t("history.empty") })); return; }
    host.appendChild(el("p", { class: "scs-history__count scs-muted", text: t("history.count", { n: list.length }) }));
    list.forEach(function (rec) {
      var date = new Date(rec.at);
      var card = el("div", { class: "scs-hist scs-hist--" + rec.riskLevel },
        el("div", { class: "scs-hist__top" },
          el("span", { class: "scs-hist__score scs-mono", text: rec.overallScore + "/100" }),
          el("span", { class: "scs-badge scs-badge--" + rec.riskLevel, text: t("level." + rec.riskLevel) }),
          el("span", { class: "scs-hist__src", text: t("tab." + (rec.sourceType === "phone" ? "phone" : rec.sourceType === "file" ? "file" : rec.sourceType === "image" ? "image" : rec.sourceType === "video" ? "video" : rec.sourceType === "voice" ? "voice" : "text")) }),
          el("span", { class: "scs-hist__date scs-muted", text: date.toLocaleString() })
        ),
        el("p", { class: "scs-hist__preview", text: rec.preview || "" }),
        el("div", { class: "scs-hist__actions" },
          (function () {
            var del = el("button", { type: "button", class: "scs-btn scs-btn--ghost scs-btn--sm", text: t("history.delete") });
            on(del, "click", function () { ST.history.deleteOne(rec.id); renderHistory(); UI.toast("toast.deleted"); });
            return del;
          })()
        )
      );
      host.appendChild(card);
    });
  }

  /* =====================================================================
   * ABOUT (model card)
   * ===================================================================*/
  function pct(x) { var v = x * 100; return (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1)) + "%"; }
  function dec2(x) { return (Math.round(x * 100) / 100).toFixed(2); }
  function aboutCard(titleKey, body) {
    return el("div", { class: "scs-about__card" }, el("h3", { class: "scs-about__h", text: t(titleKey) }), body);
  }
  function renderAbout() {
    var host = $("scs-about"); if (!host) return;
    D.clear(host);
    var m = g.SCS_MODEL && g.SCS_MODEL.meta ? g.SCS_MODEL.meta : null;
    var ds = m ? m.dataset : { total: "?", scam: "?", safe: "?", vi: "?", en: "?" };
    var mt = m ? m.metrics : null;

    host.appendChild(aboutCard("about.purpose.t", el("p", { text: t("about.purpose.d") })));
    host.appendChild(aboutCard("about.algo.t", el("p", { text: t("about.algo.d") })));
    host.appendChild(aboutCard("about.transformer.t", el("p", { text: t("about.transformer.d") })));
    host.appendChild(aboutCard("about.data.t", el("p", { text: t("about.data.d", { total: ds.total, scam: ds.scam, safe: ds.safe, vi: ds.vi, en: ds.en }) })));

    var metricsBody = el("div", { class: "scs-metrics" });
    if (mt) {
      metricsBody.appendChild(el("p", { class: "scs-metric", text: t("about.metrics.bin", { p: pct(mt.binary.precision), r: pct(mt.binary.recall), f: pct(mt.binary.f1), a: pct(mt.binary.accuracy) }) }));
      metricsBody.appendChild(el("p", { class: "scs-metric", text: t("about.metrics.type", { f: dec2(mt.type.macro_f1), a: pct(mt.type.accuracy) }) }));
    }
    metricsBody.appendChild(el("p", { class: "scs-note", text: t("about.metrics.note") }));
    host.appendChild(aboutCard("about.metrics.t", metricsBody));

    host.appendChild(aboutCard("about.limits.t", listOf(["about.limits.1", "about.limits.2", "about.limits.3", "about.limits.4"])));
    host.appendChild(aboutCard("about.privacy.t", listOf(["about.privacy.1", "about.privacy.2", "about.privacy.3", "about.privacy.4"])));

    host.appendChild(aboutCard("about.mode.t", el("p", { text: t("ext.off.note") })));

    if (g.SCS_MODEL) {
      host.appendChild(el("p", { class: "scs-about__ver scs-mono", text: t("about.version", { v: g.SCS_MODEL.version, d: g.SCS_MODEL.trained_at, f: (m ? m.features : "?") }) }));
    }
  }
  function listOf(keys) {
    var ul = el("ul", { class: "scs-about__list" });
    keys.forEach(function (k) { ul.appendChild(el("li", { text: t(k) })); });
    return ul;
  }

  /* =====================================================================
   * DYNAMIC RE-RENDER on language change
   * ===================================================================*/
  function rerenderDynamic() {
    // refresh sample buttons (labels are language-specific)
    initTextSamples();
    var r = currentRoute();
    if (r === "learn") renderLearn();
    if (r === "history") renderHistory();
    if (r === "about") renderAbout();
    if (ST.get.lastResult) renderResult(ST.get.lastResult);
  }
  function initTextSamples() {
    var host = $("scs-text-samples"); if (!host) return;
    D.clear(host);
    var ta = $("scs-text"), count = $("scs-text-count");
    var lang = I.getLang();
    var samples = (g.SCS_DEMO && g.SCS_DEMO.text && g.SCS_DEMO.text[lang]) || [];
    samples.forEach(function (s) {
      host.appendChild(btnGhostSm(s.label, function () {
        ta.value = s.value; if (count) count.textContent = String(s.value.length);
        UI.toast("demo.loaded"); ta.focus();
      }));
    });
  }

  /* =====================================================================
   * HERO demo
   * ===================================================================*/
  function initHero() {
    on($("scs-hero-demo"), "click", function () {
      go("analyze");
      activateTab("text");
      var lang = I.getLang();
      var samples = (g.SCS_DEMO && g.SCS_DEMO.text && g.SCS_DEMO.text[lang]) || [];
      if (samples.length) {
        var ta = $("scs-text"), count = $("scs-text-count");
        ta.value = samples[0].value; if (count) count.textContent = String(samples[0].value.length);
        UI.toast("demo.loaded");
      }
    });
  }

  /* =====================================================================
   * BOOT
   * ===================================================================*/
  function boot() {
    if (!SCS || !SCS.engine) { g.console && console.error("SCS modules not loaded"); return; }
    initLang();
    initTheme();
    initFamily();
    initTabs();
    activateTab("text");
    initText();
    initVoice();
    initImage();
    initVideo();
    initFile();
    initPhone();
    initHistory();
    initHero();
    initRouter();
    if (!SCS.model.available()) g.console && console.warn("ML model artifact missing; using rule-based fallback.");
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
