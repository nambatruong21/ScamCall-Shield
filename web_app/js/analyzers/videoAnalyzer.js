/* ScamCall Shield - video analyzer (Dev Guide 5.6, P1).
 * Samples up to N keyframes from a short video, decodes QR codes and OCRs each
 * frame, stopping early once a suspicious URL/QR is found. All client-side; a
 * manual transcript box complements frame text. Reuses one Tesseract worker.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  var FRAME_W = 960;

  function loadVideo(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      v.playsInline = true;
      v.onloadedmetadata = function () { resolve({ video: v, url: url, duration: v.duration }); };
      v.onerror = function () { URL.revokeObjectURL(url); reject(new Error("video load failed")); };
      v.src = url;
    });
  }

  function seekTo(video, t) {
    return new Promise(function (resolve) {
      function done() { video.removeEventListener("seeked", done); resolve(); }
      video.addEventListener("seeked", done);
      try { video.currentTime = Math.min(t, Math.max(0, video.duration - 0.05)); } catch (e) { resolve(); }
    });
  }

  function grabFrame(video, canvas) {
    var scale = Math.min(1, FRAME_W / (video.videoWidth || FRAME_W));
    var w = Math.round((video.videoWidth || FRAME_W) * scale);
    var h = Math.round((video.videoHeight || (FRAME_W * 0.56)) * scale);
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }

  function looksSuspicious(text, qr) {
    if (qr && qr.length) return true;
    var found = g.SCS.extract.run(text || "");
    return found.urls.some(function (u) { return u.level === "high" || u.level === "medium"; });
  }

  /**
   * scan(file, { maxFrames, onProgress(i,n,thumbDataUrl), onText }) ->
   *   Promise<{ text, qrValues, frameCount, ocrConfidence, thumbnails[], earlyStopped }>
   */
  function scan(file, opts) {
    opts = opts || {};
    var maxFrames = opts.maxFrames || g.SCS.validators.LIMITS.ocrFramesMax;
    var onProgress = opts.onProgress || function () {};

    return loadVideo(file).then(function (ctx) {
      var video = ctx.video, duration = ctx.duration || 0;
      var n = Math.max(1, Math.min(maxFrames, Math.floor(duration / 4) || 1));
      var step = duration > 0 ? duration / (n + 1) : 0;
      var canvas = document.createElement("canvas");

      var collectedText = [], qrValues = [], thumbs = [], confs = [];
      var earlyStopped = false;
      var worker = null;
      var useTesseract = !!g.Tesseract;

      function ensureWorker() {
        if (!useTesseract) return Promise.resolve(null);
        if (worker) return Promise.resolve(worker);
        if (g.Tesseract.createWorker) {
          var p = g.Tesseract.createWorker("vie+eng");
          // createWorker may return a worker or a promise depending on version
          return Promise.resolve(p).then(function (w) { worker = w; return w; })
            .catch(function () { useTesseract = false; return null; });
        }
        return Promise.resolve(null);
      }

      function ocrFrame(cnv) {
        if (!useTesseract) return Promise.resolve({ text: "", confidence: null });
        return ensureWorker().then(function (w) {
          if (w && w.recognize) {
            return w.recognize(cnv).then(function (r) {
              var d = r && r.data ? r.data : {};
              return { text: (d.text || "").trim(), confidence: d.confidence };
            }).catch(function () { return { text: "", confidence: null }; });
          }
          // fallback to top-level recognize
          var paths = g.SCS_TESS || {};
          var topOpts = {};
          if (paths.workerPath) topOpts.workerPath = paths.workerPath;
          if (paths.corePath) topOpts.corePath = paths.corePath;
          if (paths.langPath) topOpts.langPath = paths.langPath;
          return g.Tesseract.recognize(cnv, "vie+eng", topOpts).then(function (r) {
            var d = r && r.data ? r.data : {};
            return { text: (d.text || "").trim(), confidence: d.confidence };
          }).catch(function () { return { text: "", confidence: null }; });
        });
      }

      var chain = Promise.resolve();
      var produced = 0;
      for (var i = 1; i <= n; i++) {
        (function (idx) {
          chain = chain.then(function () {
            if (earlyStopped) return;
            return seekTo(video, step * idx).then(function () {
              var imgData = grabFrame(video, canvas);
              var thumb = canvas.toDataURL("image/jpeg", 0.6);
              thumbs.push(thumb);
              // QR first (cheap)
              var qr = [];
              if (g.jsQR) {
                try {
                  var code = g.jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: "attemptBoth" });
                  if (code && code.data) qr.push(code.data);
                } catch (e) {}
              }
              qr.forEach(function (q) { if (qrValues.indexOf(q) === -1) qrValues.push(q); });
              return ocrFrame(canvas).then(function (res) {
                produced++;
                if (res.text) collectedText.push(res.text);
                if (typeof res.confidence === "number") confs.push(res.confidence);
                onProgress(produced, n, thumb);
                if (looksSuspicious(res.text, qr)) earlyStopped = true;
              });
            });
          });
        })(i);
      }

      return chain.then(function () {
        if (worker && worker.terminate) { try { worker.terminate(); } catch (e) {} }
        URL.revokeObjectURL(ctx.url);
        var avgConf = confs.length ? Math.round(confs.reduce(function (a, b) { return a + b; }, 0) / confs.length) : null;
        return {
          text: collectedText.join("\n"),
          qrValues: qrValues,
          frameCount: produced,
          ocrConfidence: avgConf,
          thumbnails: thumbs,
          earlyStopped: earlyStopped,
          duration: duration
        };
      });
    });
  }

  g.SCS.video = { scan: scan, loadVideo: loadVideo, FRAME_W: FRAME_W };
})(typeof window !== "undefined" ? window : globalThis);
