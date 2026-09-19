/* ScamCall Shield - static file risk scanner (Dev Guide 5.5).
 * The file is read in-browser as bytes and NEVER opened, executed, or
 * uploaded. Checks: magic-byte vs extension, double extensions, risky
 * extensions, PDF active-content tokens, Office macros (via JSZip),
 * SVG/HTML script risk, plus a SHA-256 for optional manual VirusTotal lookup.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var V = function () { return g.SCS.validators; };

  var SEV_SCORE = { critical: 90, high: 70, medium: 45, low: 15 };

  function decodeAscii(bytes) {
    var s = "", n = bytes.length;
    for (var i = 0; i < n; i++) { var b = bytes[i]; s += (b >= 32 && b < 127) ? String.fromCharCode(b) : " "; }
    return s;
  }

  function scanPdfTokens(bytes, indicators) {
    var txt = decodeAscii(bytes);
    if (/\/JavaScript\b/.test(txt) || /\/JS\b/.test(txt)) indicators.push({ key: "find.pdf_js", severity: "high" });
    if (/\/OpenAction\b/.test(txt) || /\/AA\b/.test(txt)) indicators.push({ key: "find.pdf_openaction", severity: "high" });
    if (/\/Launch\b/.test(txt)) indicators.push({ key: "find.pdf_launch", severity: "critical" });
    if (/\/EmbeddedFile\b/.test(txt)) indicators.push({ key: "find.pdf_embedded", severity: "medium" });
    if (/\/Encrypt\b/.test(txt)) indicators.push({ key: "find.pdf_encrypt", severity: "low" });
  }

  function scanZipOffice(buf, ext, indicators) {
    if (!g.JSZip) return Promise.resolve();
    return g.JSZip.loadAsync(buf).then(function (zip) {
      var names = Object.keys(zip.files);
      var hasMacro = names.some(function (n) { return /vbaProject\.bin$/i.test(n); });
      if (hasMacro) indicators.push({ key: "find.macro", severity: "high" });
      var ct = zip.files["[Content_Types].xml"];
      if (ct) {
        return ct.async("string").then(function (s) {
          if (/macroEnabled/i.test(s) && !hasMacro) indicators.push({ key: "find.macro", severity: "high" });
          var hasExternal = names.some(function (n) { return /externalLink/i.test(n) || /oleObject/i.test(n); });
          if (hasExternal) indicators.push({ key: "find.office_external", severity: "medium" });
        });
      }
      var ext2 = names.some(function (n) { return /externalLink/i.test(n) || /oleObject/i.test(n); });
      if (ext2) indicators.push({ key: "find.office_external", severity: "medium" });
    }).catch(function () { /* not a valid zip after all */ });
  }

  /** scan(file) -> Promise<fileMeta> */
  function scan(file) {
    var v = V();
    var ext = v.extOf(file.name);
    var indicators = [];
    var fileMeta = {
      name: file.name, size: file.size, mime: file.type || "",
      extension: ext, magic: null, sha256: null, indicators: indicators, riskScore: 0
    };

    // Read a bounded slice: head (4MB) is enough for magic + PDF tokens on
    // typical files; very large files only get head/tail inspected.
    var HEAD = 4 * 1024 * 1024;
    var needTail = file.size > HEAD;
    var headBlob = file.slice(0, Math.min(file.size, HEAD));

    return headBlob.arrayBuffer().then(function (headBuf) {
      var headBytes = new Uint8Array(headBuf);
      var sniff = v.sniff(headBytes);
      fileMeta.magic = sniff.label;

      // zero-byte
      if (file.size === 0) indicators.push({ key: "find.zero", severity: "medium" });

      // double extension
      if (v.DOUBLE_EXT_RX.test(file.name)) {
        var m = v.DOUBLE_EXT_RX.exec(file.name);
        indicators.push({ key: "find.double_ext", severity: "critical", params: { ext: "." + (m ? m[2] : ext) } });
      }
      // risky extension
      if (v.RISKY_EXT.indexOf(ext) !== -1) {
        indicators.push({ key: "find.risky_ext", severity: "high", params: { ext: "." + ext } });
      }
      // macro-enabled extensions by name
      if (v.MACRO_EXT.indexOf(ext) !== -1) {
        indicators.push({ key: "find.macro", severity: "high" });
      }
      // magic vs extension mismatch
      var expectKind = v.EXT_KIND[ext];
      if (expectKind && sniff.kind !== "empty" && sniff.kind !== expectKind) {
        var execLike = (sniff.kind === "pe" || sniff.kind === "elf");
        indicators.push({
          key: execLike ? "find.exec_magic" : "find.magic_mismatch",
          severity: execLike ? "critical" : "high",
          params: { magic: sniff.label, ext: "." + ext }
        });
      } else if (sniff.kind === "pe" || sniff.kind === "elf") {
        indicators.push({ key: "find.exec_magic", severity: "critical", params: { magic: sniff.label } });
      }
      // MIME vs extension
      var allowedMimes = v.EXT_MIME[ext];
      if (allowedMimes && file.type && allowedMimes.indexOf(file.type) === -1) {
        indicators.push({ key: "find.mime_mismatch", severity: "medium" });
      }
      // content-based: SVG / HTML / scripts
      if (sniff.kind === "svg") indicators.push({ key: "find.svg_script", severity: "medium" });
      if (sniff.kind === "html" && ext !== "html" && ext !== "htm") indicators.push({ key: "find.html_in_file", severity: "medium" });
      if (sniff.kind === "ole") indicators.push({ key: "find.ole_legacy", severity: "medium" });
      if (sniff.kind === "rar" || sniff.kind === "7z" || sniff.kind === "gz") indicators.push({ key: "find.archive", severity: "low" });
      if (needTail) indicators.push({ key: "find.huge", severity: "low" });

      // PDF active content
      var work = Promise.resolve();
      if (sniff.kind === "pdf") {
        if (needTail) {
          // also read tail for trailer-resident tokens
          work = file.slice(file.size - 1024 * 1024).arrayBuffer().then(function (tailBuf) {
            scanPdfTokens(headBytes, indicators);
            scanPdfTokens(new Uint8Array(tailBuf), indicators);
          });
        } else {
          scanPdfTokens(headBytes, indicators);
        }
      } else if (sniff.kind === "zip") {
        // Office OOXML / generic zip: inspect entries (use full buffer if small)
        if (!needTail) work = scanZipOffice(headBuf, ext, indicators);
        else indicators.push({ key: "find.archive", severity: "low" });
      }

      return work;
    }).then(function () {
      // SHA-256 over the WHOLE file (read fully only for hashing)
      return file.arrayBuffer().then(function (full) {
        return g.SCS.hashing.sha256(full).then(function (hex) {
          fileMeta.sha256 = hex;
        }).catch(function () { fileMeta.sha256 = null; });
      });
    }).then(function () {
      // de-dup indicators by key+severity, compute score
      var seen = Object.create(null), uniq = [];
      indicators.forEach(function (ind) {
        var k = ind.key + "|" + ind.severity;
        if (!seen[k]) { seen[k] = 1; uniq.push(ind); }
      });
      fileMeta.indicators = uniq;
      var score = 0;
      uniq.forEach(function (ind) { score = Math.max(score, SEV_SCORE[ind.severity] || 0); });
      fileMeta.riskScore = score;
      return fileMeta;
    });
  }

  /* Build two harmless demo files so users can see the scanner react. */
  function demoFiles() {
    // 1) invoice.pdf.exe — text content, but double-extension + (fake) PE-ish name
    var fakeExe = new Blob([
      "MZ This is a HARMLESS demo file for ScamCall Shield.\n",
      "It only contains text. The .pdf.exe name and MZ header are here to\n",
      "demonstrate the double-extension and executable-magic indicators.\n"
    ], { type: "application/octet-stream" });
    // 2) demo-active.pdf — minimal PDF text containing scary tokens (inert)
    var fakePdf = new Blob([
      "%PDF-1.4\n% Harmless ScamCall Shield demo. The tokens below are inert text.\n",
      "1 0 obj << /Type /Catalog /OpenAction << /S /JavaScript /JS (app.alert\\(1\\)) >> >> endobj\n",
      "trailer << /Root 1 0 R >>\n%%EOF\n"
    ], { type: "application/pdf" });
    return [
      { name: "invoice.pdf.exe", blob: fakeExe },
      { name: "demo-active.pdf", blob: fakePdf }
    ];
  }

  g.SCS.fileScanner = { scan: scan, demoFiles: demoFiles, SEV_SCORE: SEV_SCORE };
})(typeof window !== "undefined" ? window : globalThis);
