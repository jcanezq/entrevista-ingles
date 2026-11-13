// Vistas y navegación. El contenido sale de js/data.js (BANCO) y la voz y la
// grabación de js/media.js (Media).

(() => {
  const B = window.BANCO;
  const M = window.Media;
  const app = document.getElementById("app");

  // ---------- utilidades ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const azar = arr => arr[Math.floor(Math.random() * arr.length)];
  const mezclar = arr => arr.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const mmss = s => `${Math.floor(Math.max(s, 0) / 60)}:${String(Math.max(s, 0) % 60).padStart(2, "0")}`;
  const bloque = id => B.bloques.find(b => b.id === id);
  const todas = () => B.bloques.flatMap(b => b.preguntas.map(p => ({ ...p, bloque: b.id })));
  const buscar = id => todas().find(p => p.id === id);
  const imagenesListas = () => B.imagenes.filter(i => i.archivo);
  const hoy = () => new Date().toISOString().slice(0, 10);

  const store = {
    get(k, def) { try { const v = localStorage.getItem("ei." + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem("ei." + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: la web sigue funcionando */ } }
  };
  const ajustes = () => Object.assign({ rate: 1, meet: false, acento: "auto" }, store.get("ajustes", {}));
  const registrar = e => { const p = store.get("progreso", []); p.push({ t: Date.now(), ...e }); store.set("progreso", p.slice(-500)); };

  // Todo lo que una vista deja corriendo (temporizadores, cámara, voz) se apaga al salir.
  let limpiezas = [];
  const alSalir = fn => limpiezas.push(fn);
  function limpiar() {
    limpiezas.forEach(f => { try { f(); } catch (e) { /* nada */ } });
    limpiezas = [];
    M.callar();
    M.ruido(false);
  }

  async function decir(texto) {
    const a = ajustes();
    if (a.meet) M.ruido(true);
    const voz = await M.hablar(texto, { rate: a.rate, acento: a.acento });
    M.ruido(false);
    return voz;
  }

  function cuenta(seg, onTick) {
    let id, cortar;
    const p = new Promise(res => {
      let r = seg;
      onTick(r);
      id = setInterval(() => { r--; onTick(r); if (r <= 0) { clearInterval(id); res(true); } }, 1000);
      cortar = () => { clearInterval(id); res(false); };
    });
    alSalir(() => clearInterval(id));
    return { p, cortar };
  }

  const btnEscuchar = (texto, etiqueta = "▶ Escuchar") =>
    `<button class="btn sec" data-decir="${esc(texto)}">${etiqueta}</button>`;

  // Cualquier botón con data-decir lee su texto en voz alta.
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-decir]");
    if (b) decir(b.dataset.decir);
  });

  // ---------- piezas reutilizables ----------

  // Cuenta de preparación y grabación. Devuelve la grabación, o null si no se pudo grabar.
  async function grabarRespuesta(zona, { prep, max, guia = "" }) {
    let grab = null, error = null;
    if (M.hayGrabacion()) {
      grab = new M.Grabadora("audio");
      alSalir(() => grab.cerrar());
      try { await grab.abrir(); } catch (e) { error = e; grab = null; }
    } else {
      error = new Error("Este navegador no permite grabar.");
    }

    zona.innerHTML = `
      <div class="cuenta">
        <p class="etiqueta">Prepárate</p>
        <p class="numero" id="num">${prep}</p>
        ${guia}
        <button class="btn" id="ya">Empezar a hablar ya</button>
      </div>`;
    const c1 = cuenta(prep, r => { const n = zona.querySelector("#num"); if (n) n.textContent = r; });
    zona.querySelector("#ya").onclick = () => c1.cortar();
    await c1.p;

    if (!grab) {
      zona.innerHTML = `<div class="aviso">No se pudo usar el micrófono (${esc(error ? error.message : "")}). Responde en voz alta igual y autoevalúate. Para grabar, abre la web con https o desde localhost y da permiso al micrófono.</div>
        <button class="btn" id="fin">Ya respondí</button>`;
      await new Promise(r => { zona.querySelector("#fin").onclick = r; });
      return null;
    }

    await grab.iniciar();
    zona.innerHTML = `
      <div class="cuenta grabando">
        <p class="etiqueta"><span class="punto"></span> Grabando</p>
        <p class="numero" id="num">${mmss(max)}</p>
        <div class="barra"><div id="relleno"></div></div>
        ${guia}
        <button class="btn" id="fin">Terminé</button>
      </div>`;
    const c2 = cuenta(max, r => {
      const n = zona.querySelector("#num"), f = zona.querySelector("#relleno");
      if (n) n.textContent = mmss(r);
      if (f) f.style.width = `${((max - r) / max) * 100}%`;
    });
    zona.querySelector("#fin").onclick = () => c2.cortar();
    await c2.p;
    const res = await grab.detener();
    grab.cerrar();
    return res;
  }

  function reproductor(res, nombre, clase = "audio") {
    if (!res) return "";
    const media = clase === "video"
      ? `<video controls playsinline src="${res.url}"></video>`
      : `<audio controls src="${res.url}"></audio>`;
    return `<div class="tarjeta">
      <h3>Tu respuesta</h3>
      ${media}
      <p><a class="btn sec" href="${res.url}" download="${esc(nombre)}.${res.ext}">Descargar</a></p>
      <p class="nota">La grabación no se sube a ningún lado. Si quieres retroalimentación de tu guía, descárgala y envíasela.</p>
    </div>`;
  }

  // Autoevaluación con los 5 criterios. Llama a onGuardar(puntajes|null).
  function autoeval(zona, onGuardar) {
    const pts = {};
    zona.innerHTML = `<div class="tarjeta">
      <h3>Autoevalúate escuchando tu grabación</h3>
      ${B.criterios.map(c => `
        <div class="criterio">
          <p><strong>${esc(c.nombre)}</strong><br><span class="nota">${esc(c.ayuda)}</span></p>
          <div class="escala" data-c="${c.id}">
            ${[1, 2, 3, 4].map(n => `<button data-n="${n}">${n}</button>`).join("")}
          </div>
        </div>`).join("")}
      <p class="nota">1 débil · 2 regular · 3 bien · 4 muy bien</p>
      <div class="fila"><button class="btn" id="guardar" disabled>Guardar y ver respuestas modelo</button>
      <button class="btn sec" id="saltar">Saltar</button></div>
    </div>`;
    zona.querySelectorAll(".escala").forEach(esc_ => {
      esc_.addEventListener("click", e => {
        const b = e.target.closest("button"); if (!b) return;
        esc_.querySelectorAll("button").forEach(x => x.classList.toggle("sel", x === b));
        pts[esc_.dataset.c] = Number(b.dataset.n);
        zona.querySelector("#guardar").disabled = Object.keys(pts).length < B.criterios.length;
      });
    });
    zona.querySelector("#guardar").onclick = () => onGuardar(pts);
    zona.querySelector("#saltar").onclick = () => onGuardar(null);
  }

  function modelos(p) {
    return `<div class="tarjeta">
      <h3>Compara con las respuestas modelo</h3>
      <div class="nivel bajo"><span>Nivel bajo</span><p>${esc(p.niveles.bajo)}</p></div>
      <div class="nivel medio"><span>Nivel medio</span><p>${esc(p.niveles.medio)}</p></div>
      <div class="nivel alto"><span>Nivel alto</span><p>${esc(p.niveles.alto)}</p>${btnEscuchar(p.niveles.alto, "▶ Escuchar el modelo alto")}</div>
      <div class="ojo"><strong>Ojo:</strong> ${esc(p.ojo)}</div>
      <p class="nota">No memorices el modelo: toma de él una estructura o un conector y úsalo con tu propia historia.</p>
    </div>
    ${repreguntas(p.sigue)}`;
  }

  function repreguntas(lista) {
    if (!lista || !lista.length) return "";
    return `<div class="tarjeta">
      <h3>Repreguntas probables</h3>
      <p class="nota">Escúchalas sin leer y responde en voz alta, 20–30 segundos cada una.</p>
      <ul class="lista">${lista.map(s => `<li>${btnEscuchar(s, "▶")} <span class="oculto-txt">${esc(s)}</span></li>`).join("")}</ul>
      <button class="btn sec" data-mostrar>Mostrar el texto</button>
    </div>`;
  }

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-mostrar]");
    if (b) { b.closest(".tarjeta").classList.add("ver-txt"); b.remove(); }
  });

  // ---------- vistas ----------
  const vistas = {};

  vistas.inicio = () => {
    const prog = store.get("progreso", []);
    const tarjetas = [
      ["oido", "Oído Meet", "Entiende la pregunta sin leerla, con acentos y ruido de llamada.", "Listening"],
      ["responder", "Responde", "Bloques 1 y 2: preguntas personales y experiencias, grabando tu respuesta.", "Speaking"],
      ["imagenes", "Imágenes", "Bloque 3: describe y especula sobre una foto en un minuto.", "Speaking"],
      ["opinion", "Opinión", "Bloque 4: argumenta en 90 segundos.", "Speaking"],
      ["simulacro", "Simulacro", "La entrevista completa, con cámara, de principio a fin.", "~10 min"],
      ["frases", "Frases y errores", "Lo que te saca de apuros y lo que no debes decir.", "Consulta"],
      ["dia", "El día de la entrevista", "Lista de cotejo para Meet.", "Consulta"],
      ["progreso", "Mi progreso", "Cuánto practicaste y cómo vas por criterio.", `${prog.length} registros`]
    ];
    app.innerHTML = `
      <section class="hero">
        <h1>Prepárate para la entrevista</h1>
        <p>Sesiones de 10–15 minutos para tus ratos libres. Usa audífonos y busca un lugar tranquilo.</p>
      </section>
      <div class="rejilla">
        ${tarjetas.map(([r, t, d, tag]) => `<a class="modulo" href="#/${r}"><span class="tag">${esc(tag)}</span><h2>${esc(t)}</h2><p>${esc(d)}</p></a>`).join("")}
      </div>
      <section class="tarjeta">
        <h2>Cómo es la entrevista</h2>
        <p>El entrevistador avanza de bloque mientras respondas bien. Los bloques 3 y 4 son los que ubican en los ciclos altos.</p>
        <table class="tabla">
          <thead><tr><th>Bloque</th><th>Qué mide</th></tr></thead>
          <tbody>${B.bloques.map(b => `<tr><td>${b.id}. ${esc(b.nombre)}</td><td>${esc(b.mide)}</td></tr>`).join("")}</tbody>
        </table>
      </section>
      <section class="tarjeta">
        <h2>La fórmula R-A-R-P</h2>
        <p>Las preguntas son fáciles: lo que te ubica es <strong>cómo</strong> respondes. Apunta a 20–40 segundos por respuesta.</p>
        <ol class="rarp">${B.rarp.map(x => `<li><b>${x.letra}</b> <strong>${esc(x.nombre)}</strong>: ${esc(x.detalle)}</li>`).join("")}</ol>
      </section>
      <p class="nota centro"><a href="#/ajustes">Ajustes de voz y modo Meet</a></p>`;
  };

  vistas.ajustes = () => {
    const a = ajustes();
    app.innerHTML = `
      <h1>Ajustes de voz</h1>
      <section class="tarjeta">
        ${M.hayVoz() ? "" : `<div class="aviso">Este navegador no tiene voces. Usa Chrome o Edge.</div>`}
        <label>Acento<select id="acento">${Object.entries(M.ACENTOS).map(([k, v]) => `<option value="${k}" ${a.acento === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>
        <label>Velocidad<select id="rate">
          <option value="0.8" ${a.rate == 0.8 ? "selected" : ""}>Lenta</option>
          <option value="1" ${a.rate == 1 ? "selected" : ""}>Normal</option>
          <option value="1.15" ${a.rate == 1.15 ? "selected" : ""}>Rápida, como un nativo apurado</option>
        </select></label>
        <label class="check"><input type="checkbox" id="meet" ${a.meet ? "checked" : ""}> Modo Meet: ruido de fondo de llamada mientras hablan</label>
        <p class="nota">Voces en inglés disponibles en este dispositivo: ${M.numVoces()}. Si hay pocas, en Android instala más voces en Ajustes → Texto a voz.</p>
        <button class="btn sec" id="probar">▶ Probar</button>
      </section>`;
    const guardar = () => store.set("ajustes", { acento: app.querySelector("#acento").value, rate: Number(app.querySelector("#rate").value), meet: app.querySelector("#meet").checked });
    app.querySelectorAll("select, input").forEach(el => el.addEventListener("change", guardar));
    app.querySelector("#probar").onclick = () => decir("Hi! Can you tell me a little bit about yourself?");
  };

  vistas.oido = () => {
    let filtro = store.get("oidoBloque", "todos");
    let actual = null, veces = 0;
    app.innerHTML = `
      <h1>Oído Meet</h1>
      <p>Escucha la pregunta <strong>sin leerla</strong> y elige de qué trata. Así funciona el primer segundo de cada respuesta en Meet.</p>
      <section class="tarjeta">
        <label>Preguntas de<select id="filtro">
          <option value="todos">Todos los bloques</option>
          ${B.bloques.filter(b => b.preguntas.length).map(b => `<option value="${b.id}">Bloque ${b.id}: ${esc(b.nombre)}</option>`).join("")}
        </select></label>
        <p class="nota">Voz, velocidad y modo Meet: <a href="#/ajustes">ajustes</a>.</p>
      </section>
      <section id="zona"></section>`;
    const sel = app.querySelector("#filtro");
    sel.value = filtro;
    sel.onchange = () => { filtro = sel.value; store.set("oidoBloque", filtro); nueva(); };
    const zona = app.querySelector("#zona");

    function nueva() {
      const pool = todas().filter(p => filtro === "todos" || p.bloque === Number(filtro));
      let p; do { p = azar(pool); } while (pool.length > 1 && actual && p.id === actual.id);
      actual = p; veces = 0;
      const otros = mezclar(todas().filter(x => x.tema !== p.tema)).slice(0, 3).map(x => x.tema);
      const opciones = mezclar([p.tema, ...otros]);
      zona.innerHTML = `<div class="tarjeta">
        <div class="fila"><button class="btn" id="oir">▶ Escuchar la pregunta</button>
        <span class="nota" id="veces"></span></div>
        <h3>¿De qué te preguntaron?</h3>
        <div class="opciones">${opciones.map(o => `<button class="opcion" data-o="${esc(o)}">${esc(o)}</button>`).join("")}</div>
        <div id="resultado"></div>
      </div>`;
      zona.querySelector("#oir").onclick = async () => {
        veces++;
        zona.querySelector("#veces").textContent = veces > 1 ? `Escuchada ${veces} veces. Pedir que repitan está bien: "Sorry, could you repeat that?"` : "";
        zona.querySelector("#oir").textContent = "▶ Repetir";
        await decir(p.q);
      };
      zona.querySelectorAll(".opcion").forEach(b => b.onclick = () => {
        if (!veces) { zona.querySelector("#resultado").innerHTML = `<p class="aviso">Primero escucha la pregunta.</p>`; return; }
        const ok = b.dataset.o === p.tema;
        zona.querySelectorAll(".opcion").forEach(x => { x.disabled = true; if (x.dataset.o === p.tema) x.classList.add("bien"); });
        if (!ok) b.classList.add("mal");
        registrar({ modulo: "oido", id: p.id, ok, veces });
        zona.querySelector("#resultado").innerHTML = `
          <p class="${ok ? "exito" : "aviso"}">${ok ? "¡Bien!" : "No era eso."} La pregunta fue:</p>
          <p class="pregunta">${esc(p.q)}</p>
          ${repreguntas(p.sigue)}
          <div class="fila">
            <button class="btn" id="otra">Siguiente pregunta</button>
            <a class="btn sec" href="#/${p.bloque === 4 ? "opinion" : "responder"}/${p.id}">Responder esta pregunta</a>
          </div>`;
        zona.querySelector("#otra").onclick = nueva;
      });
    }
    nueva();
  };

  // Práctica de respuesta para los bloques 1, 2 y 4.
  function vistaPractica({ titulo, intro, bloques, modulo, ruta, guia }, idInicial) {
    let filtro = String(bloques[0]);
    let actual = null;
    app.innerHTML = `
      <h1>${esc(titulo)}</h1>
      <p>${intro}</p>
      ${bloques.length > 1 ? `<section class="tarjeta"><label>Bloque<select id="filtro">
        ${bloques.map(id => `<option value="${id}">Bloque ${id}: ${esc(bloque(id).nombre)}</option>`).join("")}
        <option value="todos">Mezclados</option></select></label></section>` : ""}
      <section id="zona"></section>`;
    const sel = app.querySelector("#filtro");
    if (sel) sel.onchange = () => { filtro = sel.value; nueva(); };
    const zona = app.querySelector("#zona");

    function nueva(id) {
      const pool = todas().filter(p => bloques.includes(p.bloque) && (filtro === "todos" || p.bloque === Number(filtro)));
      let p = id ? buscar(id) : null;
      if (!p) { do { p = azar(pool); } while (pool.length > 1 && actual && p.id === actual.id); }
      actual = p;
      if (sel) sel.value = bloques.length > 1 && id ? String(p.bloque) : sel.value;
      const b = bloque(p.bloque);
      const max = p.max || b.max;
      zona.innerHTML = `<div class="tarjeta">
        <p class="etiqueta">Bloque ${b.id} · tienes ${mmss(max)} para responder</p>
        <div class="fila">${btnEscuchar(p.q, "▶ Escuchar la pregunta")}
        <button class="btn sec" id="vertxt">Ver texto</button></div>
        <p class="pregunta oculta" id="txt">${esc(p.q)}</p>
        <div class="fila"><button class="btn" id="empezar">Empezar</button>
        <button class="btn sec" id="otra">Otra pregunta</button></div>
        <p class="nota">Escúchala primero sin leer. Cuando la entiendas, pulsa Empezar.</p>
      </div><div id="paso"></div>`;
      zona.querySelector("#vertxt").onclick = () => zona.querySelector("#txt").classList.remove("oculta");
      zona.querySelector("#otra").onclick = () => nueva();
      zona.querySelector("#empezar").onclick = async () => {
        zona.querySelector(".tarjeta").classList.add("compacta");
        const paso = zona.querySelector("#paso");
        const res = await grabarRespuesta(paso, { prep: b.prep, max, guia: guia || "" });
        paso.innerHTML = reproductor(res, `${hoy()}-${p.id}`) + `<div id="ev"></div>`;
        autoeval(paso.querySelector("#ev"), pts => {
          registrar({ modulo, id: p.id, pts });
          paso.querySelector("#ev").innerHTML = modelos(p) + `<div class="fila"><button class="btn" id="sig">Siguiente pregunta</button></div>`;
          paso.querySelector("#sig").onclick = () => { history.replaceState(null, "", `#/${ruta}`); nueva(); window.scrollTo(0, 0); };
        });
      };
    }
    nueva(idInicial);
  }

  vistas.responder = id => vistaPractica({
    titulo: "Responde",
    intro: "Escucha, prepárate unos segundos y responde grabando. Aplica R-A-R-P: responde, amplía, da una razón y cierra.",
    bloques: [1, 2],
    modulo: "responder",
    ruta: "responder",
    guia: `<p class="guia">Responde · Amplía · Razón o ejemplo · Puente</p>`
  }, id);

  vistas.opinion = id => vistaPractica({
    titulo: "Opinión",
    intro: "No evalúan cuánto sabes del tema, sino si puedes argumentar. Usa la estructura: postura con matiz, razón y ejemplo, el otro lado, y cierre.",
    bloques: [4],
    modulo: "opinion",
    ruta: "opinion",
    guia: `<ol class="guia"><li>Postura con matiz: <em>I'd say… although…</em></li><li>Razón y ejemplo: <em>For example,…</em></li><li>El otro lado: <em>On the other hand,… / That said,…</em></li><li>Cierre: <em>So overall, I think…</em></li></ol>`
  }, id);

  vistas.imagenes = () => {
    const lista = imagenesListas();
    if (!lista.length) {
      app.innerHTML = `<h1>Imágenes</h1>
        <div class="aviso">Todavía no hay fotos cargadas. Tu guía tiene que agregarlas: ver el README del proyecto.</div>
        <section class="tarjeta"><h2>Mientras tanto: la guía de 6 pasos</h2>${guiaImagen()}</section>
        <section class="tarjeta"><h2>Fotos previstas</h2><ul class="lista">${B.imagenes.map(i => `<li><span class="tag">${i.tipo}</span> ${esc(i.idea)}</li>`).join("")}</ul></section>`;
      return;
    }
    let ultima = null;
    app.innerHTML = `<h1>Imágenes</h1>
      <p>Tienes 10 segundos para mirar y un minuto para hablar. Recorre los pasos: panorama, detalles, acción, especular, lo inusual y un toque personal.</p>
      <section id="zona"></section>`;
    const zona = app.querySelector("#zona");
    function nueva() {
      let img; do { img = azar(lista); } while (lista.length > 1 && ultima && img.id === ultima.id);
      ultima = img;
      zona.innerHTML = `<div class="tarjeta">
        <img class="foto" src="img/${esc(img.archivo)}" alt="Foto para describir">
        <p class="pregunta">${esc(B.imagenPreguntas.inicio)}</p>
        <div class="fila"><button class="btn" id="empezar">Empezar</button><button class="btn sec" id="otra">Otra foto</button></div>
      </div><div id="paso"></div>`;
      zona.querySelector("#otra").onclick = nueva;
      zona.querySelector("#empezar").onclick = async () => {
        zona.querySelector("#empezar").disabled = true;
        decir(B.imagenPreguntas.inicio);
        const paso = zona.querySelector("#paso");
        const res = await grabarRespuesta(paso, { prep: bloque(3).prep, max: bloque(3).max, guia: `<details class="guia"><summary>Ver los 6 pasos</summary>${guiaImagen()}</details>` });
        const seguir = mezclar(B.imagenPreguntas.sigue).slice(0, 2);
        paso.innerHTML = reproductor(res, `${hoy()}-${img.id}`) + `<div id="ev"></div>`;
        autoeval(paso.querySelector("#ev"), pts => {
          registrar({ modulo: "imagenes", id: img.id, pts });
          paso.querySelector("#ev").innerHTML = `<div class="tarjeta"><h3>¿Recorriste los 6 pasos?</h3>${guiaImagen()}</div>
            ${repreguntas(seguir)}
            <div class="fila"><button class="btn" id="sig">Otra foto</button></div>`;
          paso.querySelector("#sig").onclick = () => { nueva(); window.scrollTo(0, 0); };
        });
      };
    }
    nueva();
  };

  function guiaImagen() {
    return `<ol class="pasos">${B.imagenPasos.map(p => `<li><strong>${esc(p.paso)}</strong><br><span class="nota">${p.frases.map(esc).join(" · ")}</span></li>`).join("")}</ol>`;
  }

  vistas.simulacro = () => {
    const puede = M.hayGrabacion();
    app.innerHTML = `<h1>Simulacro</h1>
      <section class="tarjeta">
        <p>La entrevista completa, en orden: personal, experiencias, ${imagenesListas().length ? "una imagen, " : ""}opinión. Unos 10 minutos.</p>
        <ul class="lista">
          <li>Se graba en video, como en Meet. El video no se sube a ningún lado.</li>
          <li>Usa audífonos. La pregunta se escucha una vez; puedes pedir que la repitan con el botón.</li>
          <li>A veces el entrevistador hará una repregunta antes de pasar a la siguiente.</li>
          <li>Cuando termines de responder, pulsa <strong>Siguiente</strong>.</li>
        </ul>
        ${puede ? "" : `<div class="aviso">Este navegador no permite grabar. Puedes hacer el simulacro igual, sin video.</div>`}
        <button class="btn" id="go">Empezar el simulacro</button>
      </section>`;
    app.querySelector("#go").onclick = correr;

    async function correr() {
      const b1 = bloque(1).preguntas, b2 = bloque(2).preguntas, b4 = bloque(4).preguntas;
      const otrasB1 = mezclar(b1.filter(p => !["p1", "p6"].includes(p.id))).slice(0, 2);
      const guion = [
        { ...b1.find(p => p.id === "p1"), bloque: 1 },
        { ...b1.find(p => p.id === "p6"), bloque: 1 },
        ...otrasB1.map(p => ({ ...p, bloque: 1 })),
        ...mezclar(b2).slice(0, 2).map(p => ({ ...p, bloque: 2 }))
      ];
      const imgs = imagenesListas();
      if (imgs.length) guion.push({ id: "img", bloque: 3, img: azar(imgs), q: B.imagenPreguntas.inicio, sigue: B.imagenPreguntas.sigue });
      guion.push(...mezclar(b4).slice(0, 2).map(p => ({ ...p, bloque: 4 })));

      let grab = null;
      if (puede) {
        grab = new M.Grabadora("video");
        alSalir(() => grab.cerrar());
        try { await grab.abrir(); await grab.iniciar(); } catch (e) { grab = null; }
      }
      app.innerHTML = `<h1>Simulacro</h1>
        ${grab ? `<video class="espejo" id="espejo" muted autoplay playsinline></video>` : ""}
        <section class="tarjeta" id="zona"></section>`;
      if (grab) app.querySelector("#espejo").srcObject = grab.stream;
      const zona = app.querySelector("#zona");

      for (let i = 0; i < guion.length; i++) {
        const p = guion[i];
        await new Promise(resolve => {
          let repregunto = false, seg = 0;
          const objetivo = (p.max || bloque(p.bloque).max);
          zona.innerHTML = `
            <p class="etiqueta">Pregunta ${i + 1} de ${guion.length} · Bloque ${p.bloque}: ${esc(bloque(p.bloque).nombre)}</p>
            ${p.img ? `<img class="foto" src="img/${esc(p.img.archivo)}" alt="Foto para describir">` : ""}
            <p class="pregunta oculta" id="txt">${esc(p.q)}</p>
            <p class="numero chico" id="reloj">0:00</p>
            <p class="nota">Apunta a ${p.bloque >= 3 ? "60–90" : "20–45"} segundos (máximo sugerido ${mmss(objetivo)}).</p>
            <div class="fila">
              <button class="btn sec" id="rep">Sorry, could you repeat that?</button>
              <button class="btn" id="sig">Siguiente</button>
            </div>`;
          const id = setInterval(() => { seg++; const r = zona.querySelector("#reloj"); if (r) r.textContent = mmss(seg); }, 1000);
          alSalir(() => clearInterval(id));
          let ultimaFrase = p.q;
          decir(p.q);
          zona.querySelector("#rep").onclick = () => decir(ultimaFrase);
          zona.querySelector("#sig").onclick = () => {
            if (!repregunto && p.sigue && p.sigue.length && Math.random() < 0.5) {
              repregunto = true; seg = 0;
              ultimaFrase = azar(p.sigue);
              zona.querySelector("#txt").textContent = ultimaFrase;
              zona.querySelector(".etiqueta").textContent += " · repregunta";
              decir(ultimaFrase);
              return;
            }
            clearInterval(id);
            M.callar();
            resolve();
          };
        });
      }

      const res = grab ? await grab.detener() : null;
      if (grab) grab.cerrar();
      app.innerHTML = `<h1>Simulacro terminado</h1>
        ${reproductor(res, `${hoy()}-simulacro`, "video")}
        <section class="tarjeta"><h3>Las preguntas que te hicieron</h3>
          <ol class="lista">${guion.map(p => `<li>${esc(p.q)}</li>`).join("")}</ol></section>
        <div id="ev"></div>`;
      autoeval(app.querySelector("#ev"), pts => {
        registrar({ modulo: "simulacro", id: "simulacro", pts });
        app.querySelector("#ev").innerHTML = `<div class="tarjeta"><p class="exito">Guardado.</p>
          <p>Mírate en el video como te vería el entrevistador: ¿miras a la cámara?, ¿hay silencios largos?, ¿extendiste las respuestas?</p>
          <div class="fila"><a class="btn" href="#/progreso">Ver mi progreso</a><a class="btn sec" href="#/">Inicio</a></div></div>`;
      });
    }
  };

  vistas.frases = () => {
    app.innerHTML = `<h1>Frases y errores</h1>
      ${B.frases.map(g => `<section class="tarjeta"><h2>${esc(g.grupo)}</h2><p class="nota">${esc(g.nota)}</p>
        <ul class="lista">${g.items.map(i => `<li>${btnEscuchar(i, "▶")} ${esc(i)}</li>`).join("")}</ul></section>`).join("")}
      <section class="tarjeta"><h2>Errores típicos del hispanohablante</h2>
        <table class="tabla"><thead><tr><th>No digas</th><th>Di</th></tr></thead>
        <tbody>${B.errores.map(([m, b]) => `<tr><td class="tachado">${esc(m)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody></table>
      </section>
      <section class="tarjeta"><h2>Pronunciación</h2><ul class="lista">${B.pronunciacion.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>`;
  };

  vistas.dia = () => {
    const hechos = store.get("dia", {});
    app.innerHTML = `<h1>El día de la entrevista</h1>
      <section class="tarjeta"><h2>Lista de cotejo para Meet</h2>
        ${B.meet.map((m, i) => `<label class="check"><input type="checkbox" data-i="${i}" ${hechos[i] ? "checked" : ""}> ${esc(m)}</label>`).join("")}
      </section>
      <section class="tarjeta"><h2>La noche anterior</h2><ul class="lista">
        <li>Repasa en voz alta tu "Tell me about yourself", sin leerlo.</li>
        <li>Haz un simulacro corto, no uno nuevo y difícil.</li>
        <li>Duerme bien: el cansancio se nota primero en el listening.</li>
      </ul></section>
      <section class="tarjeta"><h2>Durante la entrevista</h2><ul class="lista">
        <li>Si no entiendes, pide que repitan. No adivines la pregunta.</li>
        <li>Responde con R-A-R-P; nunca con una sola palabra.</li>
        <li>Si te equivocas, corrígete con naturalidad: <em>"Sorry, I mean…"</em></li>
        <li>Sonríe y mira a la cámara: la interacción también se evalúa.</li>
      </ul></section>`;
    app.querySelectorAll("input[type=checkbox]").forEach(c => c.onchange = () => { hechos[c.dataset.i] = c.checked; store.set("dia", hechos); });
  };

  vistas.progreso = () => {
    const prog = store.get("progreso", []);
    const nombres = { oido: "Oído Meet", responder: "Responde", imagenes: "Imágenes", opinion: "Opinión", simulacro: "Simulacros" };
    const cuenta_ = m => prog.filter(x => x.modulo === m).length;
    const oido = prog.filter(x => x.modulo === "oido");
    const conPts = prog.filter(x => x.pts);
    const prom = (lista, c) => lista.length ? (lista.reduce((s, x) => s + (x.pts[c] || 0), 0) / lista.length).toFixed(1) : "–";
    const primeros = conPts.slice(0, 5), ultimos = conPts.slice(-5);
    const dias = new Set(prog.map(x => new Date(x.t).toISOString().slice(0, 10))).size;
    const resumen = [
      `Mi práctica (${hoy()}): ${dias} días, ${prog.length} ejercicios.`,
      ...Object.entries(nombres).map(([k, v]) => `${v}: ${cuenta_(k)}`),
      oido.length ? `Listening: ${oido.filter(x => x.ok).length}/${oido.length} preguntas entendidas` : "",
      ...B.criterios.map(c => `${c.nombre}: ${prom(primeros, c.id)} → ${prom(ultimos, c.id)}`)
    ].filter(Boolean).join("\n");

    app.innerHTML = `<h1>Mi progreso</h1>
      ${prog.length ? "" : `<div class="aviso">Todavía no hay práctica registrada en este dispositivo.</div>`}
      <section class="tarjeta"><h2>Práctica</h2>
        <p>${dias} días con práctica · ${prog.length} ejercicios</p>
        <table class="tabla"><tbody>${Object.entries(nombres).map(([k, v]) => `<tr><td>${v}</td><td>${cuenta_(k)}</td></tr>`).join("")}</tbody></table>
        ${oido.length ? `<p>Listening: entendiste <strong>${oido.filter(x => x.ok).length} de ${oido.length}</strong> preguntas.</p>` : ""}
      </section>
      <section class="tarjeta"><h2>Autoevaluación por criterio</h2>
        <p class="nota">Promedio de tus 5 primeras autoevaluaciones frente a las 5 últimas (escala 1–4).</p>
        <table class="tabla"><thead><tr><th>Criterio</th><th>Al inicio</th><th>Ahora</th></tr></thead>
        <tbody>${B.criterios.map(c => `<tr><td>${esc(c.nombre)}</td><td>${prom(primeros, c.id)}</td><td>${prom(ultimos, c.id)}</td></tr>`).join("")}</tbody></table>
      </section>
      <section class="tarjeta"><h2>Enviar a tu guía</h2>
        <pre class="resumen" id="res">${esc(resumen)}</pre>
        <div class="fila"><button class="btn" id="copiar">Copiar resumen</button>
        <button class="btn peligro" id="borrar">Borrar mi progreso</button></div>
        <p class="nota">El progreso se guarda solo en este dispositivo y navegador.</p>
      </section>`;
    app.querySelector("#copiar").onclick = async () => {
      try { await navigator.clipboard.writeText(resumen); app.querySelector("#copiar").textContent = "Copiado"; }
      catch (e) { app.querySelector("#copiar").textContent = "Selecciona el texto y cópialo"; }
    };
    app.querySelector("#borrar").onclick = () => {
      if (confirm("¿Borrar todo tu progreso de este dispositivo? No se puede deshacer.")) { store.set("progreso", []); vistas.progreso(); }
    };
  };

  // ---------- navegación ----------
  function ruta() {
    limpiar();
    const [nombre, arg] = (location.hash.replace(/^#\/?/, "") || "inicio").split("/");
    const vista = vistas[nombre] || vistas.inicio;
    document.querySelectorAll("nav a").forEach(a => a.classList.toggle("activo", a.getAttribute("href") === `#/${nombre}`));
    vista(arg);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", ruta);
  ruta();
})();
