/* ScamCall Shield - indicator extraction from text.
 * Pulls URLs, phone numbers, money amounts and OTP-like codes out of any
 * extracted text, and scores each URL with explainable reasons.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var URL_RX = /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+|\b[a-z0-9][a-z0-9-]{1,62}(?:\.[a-z0-9][a-z0-9-]{0,62})+\.(?:com|net|org|vn|info|biz|xyz|top|icu|club|online|site|shop|live|click|link|app|io|me|cc|tk|ml|ga|cf|gq|asia|pro|vip|win|bet|monster|rest|cyou|lol|ly|co|gl|to|gg|sh|gd|us|id)(?:\/[^\s<>"')\]]*)?/gi;
  var PHONE_RX = /(?:\+?84|0)(?:[\s.\-]?\d){8,10}\b/g;
  var AMOUNT_RX = /\b\d{1,3}(?:[.,]\d{3})+\s?(?:đ|d|vnd|vnđ)\b|\b\d+(?:[.,]\d+)?\s?(?:triệu|trieu|tỷ|ty|nghìn|nghin|ngàn|ngan|k)\b|\$\s?\d+(?:[.,]\d+)?/gi;
  var OTP_RX = /\b(?:otp|mã|ma|code|passcode)\D{0,12}(\d{4,8})\b/gi;

  var SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "s.id", "rebrand.ly", "shorturl.at", "tiny.cc", "lnkd.in"];
  var RISKY_TLDS = ["xyz", "top", "icu", "club", "online", "site", "click", "link", "tk", "ml", "ga", "cf", "gq", "monster", "rest", "cyou", "win", "bet", "vip", "lol", "shop", "live"];
  var BRAND_WORDS = ["vietcombank", "vietinbank", "techcombank", "agribank", "bidv", "sacombank", "mbbank", "vpbank", "acb", "tpbank", "momo", "zalopay", "vnpost", "ghtk", "ghn", "shopee", "lazada", "facebook", "paypal", "apple", "google", "amazon", "netflix", "viettel", "vinaphone", "mobifone", "evn"];
  var TRUSTED_HOSTS = ["facebook.com", "google.com", "youtube.com", "zalo.me", "shopee.vn", "lazada.vn", "tiki.vn", "momo.vn", "vnpost.vn", "ghn.vn", "ghtk.vn", "apple.com", "microsoft.com", "github.com", "wikipedia.org", "gov.vn", "edu.vn"];

  function hostOf(url) {
    var u = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    return u.split(/[\/?#]/)[0].toLowerCase();
  }

  function isTrusted(host) {
    for (var i = 0; i < TRUSTED_HOSTS.length; i++) {
      var t = TRUSTED_HOSTS[i];
      if (host === t || host.endsWith("." + t)) return true;
    }
    return false;
  }

  /** -> {url, host, score 0-100, reasons:[i18nKey], level} */
  function scoreUrl(raw) {
    var url = raw.trim().replace(/[.,;:!?)]+$/, "");
    var host = hostOf(url);
    var reasons = [], score = 0;
    function add(pts, key) { score = Math.max(score, pts); reasons.push(key); }

    if (isTrusted(host)) {
      return { url: url, host: host, score: 8, reasons: ["url.reason.known"], level: "low" };
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) add(75, "url.reason.ip");
    if (host.indexOf("xn--") !== -1) add(72, "url.reason.punycode");
    if (url.indexOf("@") !== -1) add(70, "url.reason.at");
    for (var i = 0; i < SHORTENERS.length; i++) if (host === SHORTENERS[i]) add(60, "url.reason.shortener");
    var tld = host.split(".").pop();
    if (RISKY_TLDS.indexOf(tld) !== -1) add(58, "url.reason.tld");
    for (var b = 0; b < BRAND_WORDS.length; b++) {
      if (host.indexOf(BRAND_WORDS[b]) !== -1 && !isTrusted(host)) { add(68, "url.reason.lookalike"); break; }
    }
    if (host.split(".").length >= 4) add(38, "url.reason.subdomains");
    if (/^http:\/\//i.test(url)) add(Math.max(score, 28), "url.reason.http");
    if (host.indexOf("-") !== -1 && score >= 50) reasons.push("url.reason.hyphen");
    if (!reasons.length) { score = 20; reasons.push("url.reason.unknown"); }

    var level = score >= 65 ? "high" : score >= 40 ? "medium" : "low";
    return { url: url, host: host, score: score, reasons: reasons, level: level };
  }

  function uniq(arr) {
    var seen = Object.create(null), out = [];
    for (var i = 0; i < arr.length; i++) { var k = arr[i].toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push(arr[i]); } }
    return out;
  }

  function extract(text) {
    text = String(text || "");
    var urls = uniq(text.match(URL_RX) || []).map(scoreUrl);
    var phones = uniq((text.match(PHONE_RX) || []).map(function (p) { return p.replace(/[\s.\-]/g, ""); }))
      .filter(function (p) { return p.replace(/\D/g, "").length >= 9 && p.replace(/\D/g, "").length <= 12; });
    var amounts = uniq(text.match(AMOUNT_RX) || []);
    var otps = [];
    var m; OTP_RX.lastIndex = 0;
    while ((m = OTP_RX.exec(text)) !== null) otps.push(m[1]);
    return { urls: urls, phones: phones, amounts: amounts, otpCodes: uniq(otps) };
  }

  g.SCS.extract = { run: extract, scoreUrl: scoreUrl, hostOf: hostOf };
})(typeof window !== "undefined" ? window : globalThis);
