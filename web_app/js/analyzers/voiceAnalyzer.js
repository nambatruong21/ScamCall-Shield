/* ScamCall Shield - voice analyzer (Dev Guide 5.3).
 * Records a short clip (MediaRecorder, auto-stop), draws a live waveform, and
 * transcribes via the Web Speech API when available. A manual transcript box
 * is ALWAYS available as a fallback. Audio stays in memory only.
 * Also wraps SpeechSynthesis for the Family-Mode read-aloud feature.
 */
(function (g) {
  "use strict";
  g.SCS = g.SCS || {};

  function supportsRecording() {
    return !!(g.navigator && g.navigator.mediaDevices && g.navigator.mediaDevices.getUserMedia && g.MediaRecorder);
  }
  function SpeechRec() { return g.SpeechRecognition || g.webkitSpeechRecognition || null; }
  function supportsSTT() { return !!SpeechRec(); }

  /* Recorder object with start/stop, waveform draw, and auto-stop timer. */
  function createRecorder(opts) {
    opts = opts || {};
    var maxSec = opts.maxSeconds || 60;
    var onTick = opts.onTick || function () {};
    var onWave = opts.onWave || function () {};
    var onStop = opts.onStop || function () {};

    var stream = null, rec = null, chunks = [], audioCtx = null, analyser = null, rafId = null;
    var startTs = 0, timerId = null, objectUrl = null;

    function drawLoop() {
      if (!analyser) return;
      var buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(buf);
      onWave(buf);
      rafId = g.requestAnimationFrame(drawLoop);
    }

    function start() {
      return g.navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s;
        chunks = [];
        rec = new g.MediaRecorder(stream);
        rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          var blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          objectUrl = URL.createObjectURL(blob);
          onStop(blob, objectUrl);
        };
        try {
          audioCtx = new (g.AudioContext || g.webkitAudioContext)();
          var src = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 1024;
          src.connect(analyser);
          drawLoop();
        } catch (e) { /* waveform optional */ }
        rec.start();
        startTs = Date.now();
        timerId = g.setInterval(function () {
          var el = (Date.now() - startTs) / 1000;
          onTick(Math.min(el, maxSec));
          if (el >= maxSec) stop();
        }, 200);
      });
    }

    function stop() {
      if (timerId) { g.clearInterval(timerId); timerId = null; }
      if (rafId) { g.cancelAnimationFrame(rafId); rafId = null; }
      if (rec && rec.state !== "inactive") { try { rec.stop(); } catch (e) {} }
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; analyser = null; }
    }

    function dispose() {
      stop();
      if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
    }

    return { start: start, stop: stop, dispose: dispose };
  }

  /* Live speech-to-text. Returns a controller; pushes interim/final text. */
  function createTranscriber(opts) {
    opts = opts || {};
    var Rec = SpeechRec();
    if (!Rec) return null;
    var r = new Rec();
    r.lang = opts.lang || "vi-VN";
    r.continuous = true;
    r.interimResults = true;
    var onText = opts.onText || function () {};
    var finalText = "";
    r.onresult = function (ev) {
      var interim = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var res = ev.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interim += res[0].transcript;
      }
      onText(finalText, interim);
    };
    r.onerror = function (e) { if (opts.onError) opts.onError(e); };
    return {
      start: function () { try { r.start(); } catch (e) {} },
      stop: function () { try { r.stop(); } catch (e) {} },
      getFinal: function () { return finalText; }
    };
  }

  /* --- Text-to-speech (Family Mode read-aloud) --- */
  function speak(text, lang) {
    if (!g.speechSynthesis || !text) return false;
    try {
      g.speechSynthesis.cancel();
      var u = new g.SpeechSynthesisUtterance(text);
      u.lang = lang || "vi-VN";
      u.rate = 0.95;
      g.speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }
  function stopSpeaking() { if (g.speechSynthesis) try { g.speechSynthesis.cancel(); } catch (e) {} }

  g.SCS.voice = {
    supportsRecording: supportsRecording,
    supportsSTT: supportsSTT,
    createRecorder: createRecorder,
    createTranscriber: createTranscriber,
    speak: speak,
    stopSpeaking: stopSpeaking
  };
})(typeof window !== "undefined" ? window : globalThis);
