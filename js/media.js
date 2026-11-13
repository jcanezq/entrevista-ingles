// Voz, ruido tipo Meet y grabación. Todo corre en el navegador: nada se sube a
// ningún servidor. Las grabaciones viven en memoria hasta que el estudiante las
// descarga o cierra la página.

window.Media = (() => {
  // ---------- Voz (Web Speech API) ----------
  let voces = [];
  const cargarVoces = () => {
    if (!("speechSynthesis" in window)) return;
    voces = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
  };
  if ("speechSynthesis" in window) {
    cargarVoces();
    speechSynthesis.onvoiceschanged = cargarVoces;
  }

  const ACENTOS = { auto: "Variado (recomendado)", "en-US": "Estados Unidos", "en-GB": "Reino Unido", "en-AU": "Australia", "en-IN": "India" };

  function elegirVoz(acento) {
    if (!voces.length) cargarVoces();
    let pool = voces;
    if (acento && acento !== "auto") {
      const f = voces.filter(v => v.lang.replace("_", "-").toLowerCase().startsWith(acento.toLowerCase()));
      if (f.length) pool = f;
    }
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }

  function hablar(texto, { rate = 1, acento = "auto" } = {}) {
    return new Promise(resolve => {
      if (!("speechSynthesis" in window)) return resolve(null);
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      const voz = elegirVoz(acento);
      if (voz) { u.voice = voz; u.lang = voz.lang; } else { u.lang = "en-US"; }
      u.rate = rate;
      u.onend = () => resolve(voz);
      u.onerror = () => resolve(voz);
      speechSynthesis.speak(u);
    });
  }

  function callar() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  const hayVoz = () => "speechSynthesis" in window;

  // ---------- Ruido tipo videollamada (Web Audio) ----------
  // La voz del navegador no se puede pasar por un filtro, así que el "modo Meet"
  // suma ruido de fondo de banda telefónica mientras habla la pregunta.
  let ctx = null, fuente = null;
  function ruido(on, nivel = 0.06) {
    if (!on) {
      if (fuente) { try { fuente.stop(); } catch (e) { /* ya detenido */ } fuente = null; }
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === "suspended") ctx.resume();
    if (fuente) return;
    const seg = 2, n = ctx.sampleRate * seg;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let ult = 0;
    for (let i = 0; i < n; i++) { // ruido marrón: más grave y menos molesto que el blanco
      const b = Math.random() * 2 - 1;
      ult = (ult + 0.02 * b) / 1.02;
      d[i] = ult * 3.5;
    }
    fuente = ctx.createBufferSource();
    fuente.buffer = buf;
    fuente.loop = true;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "bandpass";
    filtro.frequency.value = 1200;
    filtro.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = nivel;
    fuente.connect(filtro).connect(gain).connect(ctx.destination);
    fuente.start();
  }

  // ---------- Grabación (MediaRecorder) ----------
  const TIPOS = {
    audio: ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg"],
    video: ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
  };
  const elegirTipo = clase => (window.MediaRecorder ? TIPOS[clase].find(t => MediaRecorder.isTypeSupported(t)) : undefined) || "";
  const hayGrabacion = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

  class Grabadora {
    constructor(clase = "audio") { this.clase = clase; this.stream = null; this.rec = null; this.trozos = []; }

    async abrir() {
      const pide = this.clase === "video"
        ? { audio: true, video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } }
        : { audio: true };
      this.stream = await navigator.mediaDevices.getUserMedia(pide);
      return this.stream;
    }

    async iniciar() {
      if (!this.stream) await this.abrir();
      this.trozos = [];
      const tipo = elegirTipo(this.clase);
      this.rec = new MediaRecorder(this.stream, tipo ? { mimeType: tipo } : undefined);
      this.rec.ondataavailable = e => { if (e.data && e.data.size) this.trozos.push(e.data); };
      this.rec.start(1000);
    }

    detener() {
      return new Promise(resolve => {
        if (!this.rec || this.rec.state === "inactive") return resolve(null);
        this.rec.onstop = () => {
          const tipo = this.rec.mimeType || (this.clase === "video" ? "video/webm" : "audio/webm");
          const blob = new Blob(this.trozos, { type: tipo });
          const ext = tipo.includes("mp4") ? (this.clase === "video" ? "mp4" : "m4a") : tipo.includes("ogg") ? "ogg" : "webm";
          resolve({ blob, url: URL.createObjectURL(blob), ext, tipo });
        };
        this.rec.stop();
      });
    }

    cerrar() {
      if (this.rec && this.rec.state !== "inactive") { try { this.rec.stop(); } catch (e) { /* nada */ } }
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  return { hablar, callar, hayVoz, ACENTOS, ruido, Grabadora, hayGrabacion, numVoces: () => voces.length };
})();
