/* ScamCall Shield - rendering layer.
 * Pure DOM construction via SCS.dom.el (no innerHTML for user content).
 * Exposes reusable renderers consumed by app.js. All copy comes from i18n.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};
  var D = g.SCS.dom, I = g.SCS.i18n;
  var el = function () { return D.el.apply(null, arguments); };
  var t = function (k, p) { return I.t(k, p); };

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msgKey, params) {
    var host = g.document.getElementById("scs-toast");
    if (!host) { host = el("div", { id: "scs-toast", class: "scs-toast", role: "status", "aria-live": "polite" }); g.document.body.appendChild(host); }
    var msg = /[\s.]/.test(msgKey) && !I.t(msgKey) ? msgKey : (I.t(msgKey) === msgKey && /\s/.test(msgKey) ? msgKey : t(msgKey, params));
    D.clear(host);
    host.appendChild(el("div", { class: "scs-toast__msg", text: msg }));
    host.classList.add("is-shown");
    if (toastTimer) g.clearTimeout(toastTimer);
    toastTimer = g.setTimeout(function () { host.classList.remove("is-shown"); }, 2600);
  }

  /* ---------- clipboard ---------- */
  function copy(text) {
    if (g.navigator && g.navigator.clipboard && g.navigator.clipboard.writeText) {
      return g.navigator.clipboard.writeText(text).then(function () { toast("toast.copied"); }, function () { fallbackCopy(text); });
    }
    fallbackCopy(text); return Promise.resolve();
  }
  function fallbackCopy(text) {
    try {
      var ta = el("textarea", { class: "scs-sronly" }); ta.value = text;
      g.document.body.appendChild(ta); ta.select(); g.document.execCommand("copy");
      g.document.body.removeChild(ta); toast("toast.copied");
    } catch (e) {}
  }

  /* ---------- semicircle gauge (SVG) ---------- */
  var LEVEL_VAR = { low: "--scs-level-low", medium: "--scs-level-medium", high: "--scs-level-high", critical: "--scs-level-critical" };
  function polar(cx, cy, r, deg) {
    var a = deg * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  function arc(cx, cy, r, startDeg, endDeg) {
    var s = polar(cx, cy, r, startDeg), e = polar(cx, cy, r, endDeg);
    var large = ((endDeg - startDeg) % 360) > 180 ? 1 : 0;
    var R = function (n) { return Math.round(n * 100) / 100; };
    return "M " + R(s.x) + " " + R(s.y) + " A " + r + " " + r + " 0 " + large + " 1 " + R(e.x) + " " + R(e.y);
  }
  function svgEl(tag, attrs) {
    var n = g.document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  /** gauge(score 0-100, level) -> <svg> */
  function gauge(score, level) {
    var W = 260, H = 150, cx = W / 2, cy = 130, r = 104, sw = 18;
    var frac = Math.max(0, Math.min(100, score)) / 100;
    var color = "var(" + (LEVEL_VAR[level] || "--scs-level-medium") + ")";
    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, class: "scs-gauge", role: "img", "aria-label": t("result.score") + ": " + score + "/100" });
    svg.appendChild(svgEl("path", { d: arc(cx, cy, r, 180, 360), fill: "none", stroke: "var(--scs-gauge-track)", "stroke-width": sw, "stroke-linecap": "round" }));
    if (frac > 0.001) {
      svg.appendChild(svgEl("path", { d: arc(cx, cy, r, 180, 180 + 180 * frac), fill: "none", stroke: color, "stroke-width": sw, "stroke-linecap": "round", class: "scs-gauge__value" }));
    }
    var num = svgEl("text", { x: cx, y: cy - 14, "text-anchor": "middle", class: "scs-gauge__num" });
    num.textContent = String(score);
    svg.appendChild(num);
    var den = svgEl("text", { x: cx, y: cy + 8, "text-anchor": "middle", class: "scs-gauge__den" });
    den.textContent = "/100";
    svg.appendChild(den);
    return svg;
  }

  /* ---------- evidence highlighting ---------- */
  /** renderHighlights(text, matches[{start,end,cat}]) -> element (safe). */
  function renderHighlights(text, matches) {
    var box = el("div", { class: "scs-evidence__text", lang: "auto" });
    if (!text) { box.appendChild(el("span", { class: "scs-muted", text: t("evidence.empty") })); return box; }
    var ms = (matches || []).slice().sort(function (a, b) { return a.start - b.start; });
    var pos = 0;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.start < pos) continue; // safety against overlap
      if (m.start > pos) box.appendChild(g.document.createTextNode(text.slice(pos, m.start)));
      var label = t("cat." + m.cat), desc = t("cat." + m.cat + ".d");
      box.appendChild(el("mark", {
        class: "scs-hl scs-hl--" + m.cat, tabindex: "0",
        "data-cat": m.cat, "aria-label": label + ": " + desc, title: label
      }, text.slice(m.start, m.end)));
      pos = m.end;
    }
    if (pos < text.length) box.appendChild(g.document.createTextNode(text.slice(pos)));
    return box;
  }

  /* ---------- flag (tactic) cards ---------- */
  var CAT_ICON = {
    urgency: "\u23F1", secrecy: "\uD83E\uDD2B", credential: "\uD83D\uDD11", payment: "\uD83D\uDCB8",
    authority: "\uD83C\uDFDB", fear: "\u26A0", remote_app: "\uD83D\uDCF1", reward: "\uD83C\uDF81",
    link_lure: "\uD83D\uDD17", info_request: "\uD83E\uDEAA", too_good: "\u2728", impersonation: "\uD83D\uDC65"
  };
  function flagCards(categories) {
    var cats = Object.keys(categories || {});
    var wrap = el("div", { class: "scs-flags" });
    if (!cats.length) { wrap.appendChild(el("p", { class: "scs-muted", text: t("evidence.empty") })); return wrap; }
    cats.sort(function (a, b) { return categories[b].w - categories[a].w; });
    cats.forEach(function (c) {
      wrap.appendChild(el("div", { class: "scs-flag scs-flag--" + c },
        el("span", { class: "scs-flag__icon", "aria-hidden": "true", text: CAT_ICON[c] || "\u26A0" }),
        el("div", { class: "scs-flag__body" },
          el("div", { class: "scs-flag__title", text: t("cat." + c) }),
          el("div", { class: "scs-flag__desc", text: t("cat." + c + ".d") })
        )
      ));
    });
    return wrap;
  }

  /* ---------- scam type chips with confidence bars ---------- */
  function typeChips(scamTypes) {
    var wrap = el("div", { class: "scs-types" });
    (scamTypes || []).forEach(function (st) {
      var pct = Math.round(st.confidence * 100);
      wrap.appendChild(el("div", { class: "scs-type" },
        el("div", { class: "scs-type__head" },
          el("span", { class: "scs-type__name", text: t("type." + st.id) }),
          el("span", { class: "scs-type__pct scs-mono", text: pct + "%" })
        ),
        el("div", { class: "scs-bar" }, el("span", { class: "scs-bar__fill", style: { width: pct + "%" } }))
      ));
    });
    return wrap;
  }

  /* ---------- extracted indicators (URLs etc.) ---------- */
  function indicatorBlock(result) {
    var ex = result.extracted || {};
    var wrap = el("div", { class: "scs-ind" });
    var any = false;

    if (ex.urls && ex.urls.length) {
      any = true;
      var list = el("ul", { class: "scs-url-list" });
      ex.urls.forEach(function (u) {
        var reasons = (u.reasons || []).map(function (rk) { return t(rk); }).join(" · ");
        list.appendChild(el("li", { class: "scs-url scs-url--" + u.level },
          el("div", { class: "scs-url__top" },
            el("span", { class: "scs-url__host scs-mono", text: u.host || u.url }),
            el("span", { class: "scs-badge scs-badge--" + u.level, text: t("level." + u.level) })
          ),
          el("div", { class: "scs-url__reasons", text: reasons })
        ));
      });
      wrap.appendChild(el("div", { class: "scs-ind__group" }, el("h4", { class: "scs-ind__h", text: t("ind.urls") }), list));
    }
    function chips(label, arr, mono) {
      if (!arr || !arr.length) return;
      any = true;
      var c = el("div", { class: "scs-chips" });
      arr.forEach(function (x) { c.appendChild(el("span", { class: "scs-chip" + (mono ? " scs-mono" : ""), text: x })); });
      wrap.appendChild(el("div", { class: "scs-ind__group" }, el("h4", { class: "scs-ind__h", text: label }), c));
    }
    chips(t("ind.phones"), ex.phoneNumbers, true);
    chips(t("ind.amounts"), ex.amounts, true);
    chips(t("ind.qr"), ex.qrValues, false);
    if (ex.otpCodes && ex.otpCodes.length) chips(t("ind.otp"), ex.otpCodes.map(function () { return "\u2022\u2022\u2022\u2022\u2022\u2022"; }), true);

    if (!any) wrap.appendChild(el("p", { class: "scs-muted", text: t("ind.none") }));
    return wrap;
  }

  /* ---------- action plan (ordered) ---------- */
  function renderActions(actionKeys, container) {
    D.clear(container);
    var ol = el("ol", { class: "scs-actions__list" });
    (actionKeys || []).forEach(function (k) {
      var urgent = k.indexOf("urgent.") === 0;
      ol.appendChild(el("li", { class: "scs-action" + (urgent ? " scs-action--urgent" : "") },
        el("span", { class: "scs-action__text", text: t(k) })
      ));
    });
    container.appendChild(ol);
  }

  /* ---------- file meta card ---------- */
  function fileCard(fileMeta) {
    var V = g.SCS.validators;
    var wrap = el("div", { class: "scs-file" });
    function row(label, val, mono) {
      return el("div", { class: "scs-file__row" },
        el("span", { class: "scs-file__k", text: label }),
        el("span", { class: "scs-file__v" + (mono ? " scs-mono" : ""), text: val })
      );
    }
    wrap.appendChild(row(t("file.meta.name"), fileMeta.name));
    wrap.appendChild(row(t("file.meta.size"), V.fmtBytes(fileMeta.size)));
    if (fileMeta.mime) wrap.appendChild(row(t("file.meta.mime"), fileMeta.mime, true));
    wrap.appendChild(row(t("file.meta.ext"), "." + (fileMeta.extension || "?"), true));
    if (fileMeta.magic) wrap.appendChild(row(t("file.meta.magic"), fileMeta.magic));
    if (fileMeta.sha256) {
      wrap.appendChild(el("div", { class: "scs-file__row scs-file__row--hash" },
        el("span", { class: "scs-file__k", text: t("file.hash") }),
        el("span", { class: "scs-file__v scs-mono scs-file__hash", text: fileMeta.sha256 })
      ));
    }
    // indicators
    var ind = el("div", { class: "scs-file__ind" });
    if (fileMeta.indicators && fileMeta.indicators.length) {
      ind.appendChild(el("h4", { class: "scs-ind__h", text: t("file.ind.title") }));
      var ul = el("ul", { class: "scs-fileind" });
      fileMeta.indicators.forEach(function (i2) {
        ul.appendChild(el("li", { class: "scs-fileind__item scs-fileind--" + i2.severity },
          el("span", { class: "scs-badge scs-badge--sev-" + i2.severity, text: i2.severity }),
          el("span", { text: t(i2.key, i2.params || {}) })
        ));
      });
      ind.appendChild(ul);
    } else {
      ind.appendChild(el("p", { class: "scs-muted", text: t("file.ind.none") }));
    }
    wrap.appendChild(ind);
    if (fileMeta.sha256) {
      var url = g.SCS.fileReputationAdapter.searchUrl(fileMeta.sha256);
      wrap.appendChild(el("a", { class: "scs-link-out", href: url, target: "_blank", rel: "noopener noreferrer", text: t("file.vt.open") }));
    }
    wrap.appendChild(el("p", { class: "scs-note", text: t("file.note.rename") }));
    return wrap;
  }

  /* ---------- phone result card ---------- */
  function phoneCard(meta) {
    var wrap = el("div", { class: "scs-phone" });
    function row(label, val, mono, cls) {
      return el("div", { class: "scs-file__row" },
        el("span", { class: "scs-file__k", text: label }),
        el("span", { class: "scs-file__v" + (mono ? " scs-mono" : "") + (cls ? " " + cls : ""), text: val })
      );
    }
    var validTxt = meta.valid ? t("phone.valid.yes") : t("phone.valid.no");
    wrap.appendChild(el("div", { class: "scs-phone__verdict scs-phone--" + (meta.valid ? "ok" : "bad") },
      el("span", { class: "scs-phone__badge", text: validTxt })
    ));
    if (meta.e164) wrap.appendChild(row(t("phone.e164"), meta.e164, true));
    if (meta.national) wrap.appendChild(row(t("phone.national"), meta.national, true));
    if (meta.region) wrap.appendChild(row(t("phone.country.res"), meta.region));
    wrap.appendChild(row(t("phone.type"), t("phone.type." + (meta.type || "unknown"))));
    wrap.appendChild(row(t("phone.possible.yes").split("|")[0] || t("phone.possible.yes"),
      meta.possible ? t("phone.possible.yes") : t("phone.possible.no")));
    if (meta.carrier) {
      wrap.appendChild(row(t("phone.carrier.hint"), meta.carrier));
      wrap.appendChild(el("p", { class: "scs-note", text: t("phone.carrier.note") }));
    }
    if (meta.premium) wrap.appendChild(el("p", { class: "scs-warn-note", text: t("phone.premium.warn") }));
    if (!meta.valid) wrap.appendChild(el("p", { class: "scs-note", text: t("phone.invalid.help") }));

    // reputation (demo)
    var rep = el("div", { class: "scs-phone__rep" });
    rep.appendChild(el("div", { class: "scs-rep__head" },
      el("h4", { class: "scs-ind__h", text: t("phone.rep.title") }),
      el("span", { class: "scs-badge scs-badge--demo", text: t("phone.rep.demo") })
    ));
    if (meta.reputation) {
      var lbl = I.getLang() === "en" ? meta.reputation.labelEn : meta.reputation.labelVi;
      rep.appendChild(el("p", { class: "scs-rep__hit", text: t("phone.rep.hit", { label: lbl, n: meta.reputation.count }) }));
    } else {
      rep.appendChild(el("p", { class: "scs-muted", text: t("phone.rep.none") }));
    }
    wrap.appendChild(rep);
    wrap.appendChild(el("p", { class: "scs-note scs-note--strong", text: t("phone.never.note") }));
    return wrap;
  }

  /* ---------- score breakdown ---------- */
  function whyBlock(components) {
    var c = components || {};
    var w = c.weights || { ml: 0.45, rules: 0.35, indicators: 0.15, context: 0.05 };
    var rows = [
      { key: "why.ml", val: c.ml, wt: w.ml },
      { key: "why.rules", val: c.rules, wt: w.rules },
      { key: "why.ind", val: c.indicators, wt: w.indicators },
      { key: "why.ctx", val: c.context, wt: w.context }
    ];
    if (
      c.transformerAvailable &&
      typeof c.transformer === "number"
    ) {
      rows.push({
        key: "why.transformer",
        val: c.transformer,
        shadow: true
      });
    }
    var wrap = el("div", { class: "scs-why" });
    rows.forEach(function (r) {
      var v = Math.max(0, Math.min(100, r.val || 0));
      wrap.appendChild(el("div", { class: "scs-why__row" },
        el("div", { class: "scs-why__label" },
          el("span", { text: t(r.key) }),
          el("span", { class: "scs-why__wt scs-mono", text: r.shadow ? t("why.shadow") : t("why.weight", { w: Math.round(r.wt * 100) }) })
        ),
        el("div", { class: "scs-bar scs-bar--thin" }, el("span", { class: "scs-bar__fill", style: { width: v + "%" } })),
        el("span", { class: "scs-why__val scs-mono", text: String(v) })
      ));
    });
    if (!c.mlAvailable) wrap.appendChild(el("p", { class: "scs-note", text: t("why.noml") }));
    return wrap;
  }

  /* ---------- processing overlay (4 steps) ---------- */
  var STEP_KEYS = ["steps.extract", "steps.scan", "steps.classify", "steps.advise"];
  function createProcessing(container) {
    D.clear(container);
    var items = STEP_KEYS.map(function (k) {
      var dot = el("span", { class: "scs-step__dot", "aria-hidden": "true" });
      var li = el("li", { class: "scs-step" }, dot, el("span", { class: "scs-step__label", text: t(k) }));
      return { li: li, dot: dot };
    });
    var list = el("ul", { class: "scs-steps" });
    items.forEach(function (it) { list.appendChild(it.li); });
    container.appendChild(el("div", { class: "scs-processing" },
      el("div", { class: "scs-processing__spinner", "aria-hidden": "true" }),
      list
    ));
    function setStep(idx) {
      items.forEach(function (it, i) {
        it.li.classList.toggle("is-active", i === idx);
        it.li.classList.toggle("is-done", i < idx);
      });
    }
    function done() { items.forEach(function (it) { it.li.classList.remove("is-active"); it.li.classList.add("is-done"); }); }
    setStep(0);
    return { setStep: setStep, done: done };
  }

  g.SCS.ui = {
    toast: toast, copy: copy, gauge: gauge,
    renderHighlights: renderHighlights, flagCards: flagCards, typeChips: typeChips,
    indicatorBlock: indicatorBlock, renderActions: renderActions,
    fileCard: fileCard, phoneCard: phoneCard, whyBlock: whyBlock,
    createProcessing: createProcessing,
    levelVar: LEVEL_VAR
  };
})(typeof window !== "undefined" ? window : globalThis);
