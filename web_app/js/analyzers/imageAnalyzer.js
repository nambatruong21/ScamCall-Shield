/* ScamCall Shield - image analyzer (Dev Guide 5.2).
 * Loads an image into a canvas, optionally lets the user drag-select a region,
 * runs OCR (Tesseract.js, vie+eng) and QR decoding (jsQR) entirely client-side.
 * The extracted text is editable before analysis (OCR can be wrong).
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var MAX_DIM = 1600; // downscale large images before OCR for speed

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
      img.src = url;
    });
  }

  /* Draw image fit into canvas at a capped resolution; return scale info. */
  function drawToCanvas(img, canvas) {
    var scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
    var w = Math.round(img.naturalWidth * scale);
    var h = Math.round(img.naturalHeight * scale);
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    return { ctx: ctx, w: w, h: h, scale: scale };
  }

  /* Extract ImageData for full canvas or a sub-rectangle (canvas coords). */
  function getImageData(ctx, w, h, rect) {
    if (rect && rect.w > 4 && rect.h > 4) {
      return ctx.getImageData(rect.x, rect.y, rect.w, rect.h);
    }
    return ctx.getImageData(0, 0, w, h);
  }

  function decodeQR(imageData) {
    if (!g.jsQR) return [];
    try {
      var code = g.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
      return code && code.data ? [code.data] : [];
    } catch (e) { return []; }
  }

  /* OCR a canvas (or sub-rect) -> {text, confidence}. onProgress(0..1). */
  function ocr(canvas, rect, onProgress) {
    if (!g.Tesseract) return Promise.reject(new Error("Tesseract unavailable"));
    var source = canvas;
    if (rect && rect.w > 4 && rect.h > 4) {
      var c = document.createElement("canvas");
      c.width = rect.w; c.height = rect.h;
      c.getContext("2d").drawImage(canvas, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
      source = c;
    }
    var opts = {
      logger: function (m) {
        if (m && m.status === "recognizing text" && onProgress) onProgress(m.progress || 0);
      }
    };
    // Tesseract worker/core paths are wired by app.js via window.SCS_TESS.
    var paths = g.SCS_TESS || {};
    if (paths.workerPath) opts.workerPath = paths.workerPath;
    if (paths.corePath) opts.corePath = paths.corePath;
    if (paths.langPath) opts.langPath = paths.langPath;
    return g.Tesseract.recognize(source, "vie+eng", opts).then(function (res) {
      var d = res && res.data ? res.data : {};
      return { text: (d.text || "").trim(), confidence: typeof d.confidence === "number" ? d.confidence : null };
    });
  }

  g.SCS.image = {
    loadImage: loadImage,
    drawToCanvas: drawToCanvas,
    getImageData: getImageData,
    decodeQR: decodeQR,
    ocr: ocr,
    MAX_DIM: MAX_DIM
  };
})(typeof window !== "undefined" ? window : globalThis);
