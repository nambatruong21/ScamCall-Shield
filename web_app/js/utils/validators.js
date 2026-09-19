/* ScamCall Shield - input validation tables & magic-byte sniffing. */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var LIMITS = {
    text: 10000,                 // chars (TXT-01)
    imageBytes: 8 * 1024 * 1024,
    videoBytes: 30 * 1024 * 1024,
    videoSeconds: 60,
    audioSeconds: 60,
    fileBytes: 100 * 1024 * 1024,
    ocrFramesMax: 10
  };

  var RISKY_EXT = ["exe", "scr", "bat", "cmd", "com", "pif", "msi", "jar", "js", "jse", "vbs", "vbe", "wsf", "ps1", "hta", "lnk", "apk", "dll", "cpl", "reg", "iso", "img"];
  var DOUBLE_EXT_RX = /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|txt|csv|mp4|mp3|zip|rar)\.([a-z0-9]{2,4})$/i;
  var MACRO_EXT = ["docm", "xlsm", "pptm", "dotm", "xltm"];

  var EXT_MIME = {
    pdf: ["application/pdf"], png: ["image/png"], jpg: ["image/jpeg"], jpeg: ["image/jpeg"],
    gif: ["image/gif"], webp: ["image/webp"], mp4: ["video/mp4"], webm: ["video/webm"],
    mp3: ["audio/mpeg"], zip: ["application/zip", "application/x-zip-compressed"],
    docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    txt: ["text/plain"], csv: ["text/csv", "application/vnd.ms-excel"], svg: ["image/svg+xml"],
    html: ["text/html"], doc: ["application/msword"], xls: ["application/vnd.ms-excel"]
  };

  function extOf(name) {
    var m = /\.([a-z0-9]{1,8})$/i.exec(String(name || ""));
    return m ? m[1].toLowerCase() : "";
  }

  /** bytes: Uint8Array (first 4KB is enough) -> {kind, label} */
  function sniff(bytes) {
    function startsWith(sig, off) {
      off = off || 0;
      if (bytes.length < off + sig.length) return false;
      for (var i = 0; i < sig.length; i++) if (bytes[off + i] !== sig[i]) return false;
      return true;
    }
    function ascii(n, off) {
      var s = "", end = Math.min(bytes.length, (off || 0) + n);
      for (var i = off || 0; i < end; i++) s += String.fromCharCode(bytes[i]);
      return s;
    }
    if (!bytes || !bytes.length) return { kind: "empty", label: "empty" };
    if (startsWith([0x25, 0x50, 0x44, 0x46])) return { kind: "pdf", label: "PDF" };
    if (startsWith([0x50, 0x4b, 0x03, 0x04]) || startsWith([0x50, 0x4b, 0x05, 0x06])) return { kind: "zip", label: "ZIP container" };
    if (startsWith([0xd0, 0xcf, 0x11, 0xe0])) return { kind: "ole", label: "Legacy Office (OLE)" };
    if (startsWith([0x4d, 0x5a])) return { kind: "pe", label: "Windows executable (PE)" };
    if (startsWith([0x7f, 0x45, 0x4c, 0x46])) return { kind: "elf", label: "Linux executable (ELF)" };
    if (startsWith([0x89, 0x50, 0x4e, 0x47])) return { kind: "png", label: "PNG image" };
    if (startsWith([0xff, 0xd8, 0xff])) return { kind: "jpg", label: "JPEG image" };
    if (startsWith([0x47, 0x49, 0x46, 0x38])) return { kind: "gif", label: "GIF image" };
    if (startsWith([0x52, 0x49, 0x46, 0x46]) && ascii(4, 8) === "WEBP") return { kind: "webp", label: "WEBP image" };
    if (startsWith([0x52, 0x61, 0x72, 0x21])) return { kind: "rar", label: "RAR archive" };
    if (startsWith([0x37, 0x7a, 0xbc, 0xaf])) return { kind: "7z", label: "7-Zip archive" };
    if (startsWith([0x1f, 0x8b])) return { kind: "gz", label: "GZIP archive" };
    if (ascii(4, 4) === "ftyp") return { kind: "mp4", label: "MP4/MOV media" };
    if (startsWith([0x1a, 0x45, 0xdf, 0xa3])) return { kind: "webm", label: "WebM/MKV media" };
    if (startsWith([0x49, 0x44, 0x33]) || startsWith([0xff, 0xfb])) return { kind: "mp3", label: "MP3 audio" };
    var head = ascii(512).toLowerCase();
    if (head.indexOf("<svg") !== -1) return { kind: "svg", label: "SVG (may contain script)" };
    if (head.indexOf("<!doctype html") !== -1 || head.indexOf("<html") !== -1) return { kind: "html", label: "HTML document" };
    if (head.slice(0, 2) === "#!") return { kind: "script", label: "Script file" };
    var printable = 0, n = Math.min(bytes.length, 1024);
    for (var i = 0; i < n; i++) { var b = bytes[i]; if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127) || b >= 128) printable++; }
    if (printable / n > 0.92) return { kind: "text", label: "Plain text" };
    return { kind: "binary", label: "Unknown binary" };
  }

  var EXT_KIND = { pdf: "pdf", zip: "zip", docx: "zip", xlsx: "zip", pptx: "zip", docm: "zip", xlsm: "zip", pptm: "zip", png: "png", jpg: "jpg", jpeg: "jpg", gif: "gif", webp: "webp", mp4: "mp4", mov: "mp4", webm: "webm", mp3: "mp3", rar: "rar", "7z": "7z", gz: "gz", txt: "text", csv: "text", md: "text", json: "text", log: "text", html: "html", htm: "html", svg: "svg", doc: "ole", xls: "ole", ppt: "ole" };

  g.SCS.validators = {
    LIMITS: LIMITS, RISKY_EXT: RISKY_EXT, MACRO_EXT: MACRO_EXT,
    DOUBLE_EXT_RX: DOUBLE_EXT_RX, EXT_MIME: EXT_MIME, EXT_KIND: EXT_KIND,
    extOf: extOf, sniff: sniff,
    fmtBytes: function (n) {
      if (n < 1024) return n + " B";
      if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
      return (n / 1048576).toFixed(1) + " MB";
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
