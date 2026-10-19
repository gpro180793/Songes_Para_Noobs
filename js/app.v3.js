/* Songes para Noobs — lógica de la aplicación */
(function () {
  "use strict";

  var BOSSES = [];
  var BY_ID = {};
  var shortMode = false;

  var elSearch = document.getElementById("search-input");
  var elResults = document.getElementById("search-results");
  var elShort = document.getElementById("short-toggle");
  var viewHome = document.getElementById("view-home");
  var viewBoss = document.getElementById("view-boss");
  var bossContent = document.getElementById("boss-content");

  /* ---------- Utilidades ---------- */

  // Quita acentos y pasa a minúsculas para buscar sin tildes.
  function norm(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’`]/g, " ")
      .trim();
  }

  function esc(s) {
    return (s == null ? "" : String(s))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // El contenido original usa marcado tipo markdown:
  //   - líneas con "- "  -> listas
  //   <u>**texto**</u>   -> negrita + subrayado
  //   **texto**          -> negrita
  //   *texto*            -> cursiva
  // Se convierte a HTML seguro.
  function renderRich(text) {
    if (!text) return "";
    var lines = String(text).split(/\r?\n/).filter(function (l) { return l.trim() !== ""; });
    var html = lines.map(function (line) {
      var isBullet = /^\s*-\s+/.test(line);
      var body = line.replace(/^\s*-\s+/, "");
      body = esc(body);
      body = body.replace(/&lt;u&gt;\*\*(.+?)\*\*&lt;\/u&gt;/g, "<u><strong>$1</strong></u>");
      body = body.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      body = body.replace(/(^|[^*])\*([^*]+?)\*(?!\*)/g, "$1<em>$2</em>");
      return isBullet ? "<li>" + body + "</li>" : "<li class='no-bullet'>" + body + "</li>";
    });
    return "<ul>" + html.join("") + "</ul>";
  }

  function imgSrc(file) {
    return "assets/images/" + encodeURIComponent(file);
  }

  /* ---------- Carga de datos ---------- */

  // Los datos vienen incrustados en data/jefes.js (window.SONGES_DATA), cargado con
  // una etiqueta <script>. Así el sitio funciona también abriendo index.html
  // directamente (file://), donde fetch() de archivos locales está bloqueado.
  // Si por lo que sea no estuviera, se intenta fetch() como respaldo.
  function onDataReady(data) {
    BOSSES = data;
    data.forEach(function (b) { BY_ID[b.id] = b; });
    document.getElementById("footer-count").textContent =
      BOSSES.length + " jefes · datos de DoFensive (es)";
    buildIndex();
    var wanted = new URLSearchParams(location.search).get("boss");
    if (wanted && BY_ID[wanted]) showBoss(parseInt(wanted, 10));
  }

  function showLoadError(msg) {
    viewHome.innerHTML =
      '<div class="error-box"><strong>Se ha producido un error al cargar los datos.</strong><br>' +
      esc(msg) + "</div>";
  }

  /* ---------- Búsqueda ---------- */

  var INDEX = [];
  function buildIndex() {
    INDEX = BOSSES.map(function (b) {
      return {
        b: b,
        es: norm(b.nombre_es),
        fr: norm(b.nombre_fr),
        esRaw: norm(b.nombre_es).replace(/\s+/g, ""),
        frRaw: norm(b.nombre_fr).replace(/\s+/g, "")
      };
    });
  }

  function search(q) {
    var n = norm(q);
    if (!n) return [];
    var compact = n.replace(/\s+/g, "");
    var out = [];
    INDEX.forEach(function (it) {
      var score = -1;
      if (it.esRaw === compact || it.frRaw === compact) score = 0;
      else if (it.es.indexOf(n) === 0) score = 1;
      else if (it.fr.indexOf(n) === 0) score = 2;
      else if (it.es.indexOf(n) > -1) score = 3;
      else if (it.fr.indexOf(n) > -1) score = 4;
      if (score > -1) out.push({ it: it, score: score });
    });
    out.sort(function (a, b) {
      if (a.score !== b.score) return a.score - b.score;
      return (a.it.b.nombre_es || a.it.b.nombre_fr).localeCompare(b.it.b.nombre_es || b.it.b.nombre_fr);
    });
    return out.map(function (x) { return x.it.b; });
  }

  function renderResults(list) {
    if (!list.length) { elResults.innerHTML = ""; return; }
    elResults.innerHTML = list.slice(0, 40).map(function (b) {
      return '<div class="result-item" data-id="' + b.id + '">' +
        '<img src="' + imgSrc(b.imagen) + '" alt="" loading="lazy">' +
        "<div><div class='rn'>" + esc(b.nombre_es || b.nombre_fr) + "</div>" +
        (b.nombre_es && b.nombre_fr && b.nombre_es !== b.nombre_fr
          ? "<div class='rfr'>" + esc(b.nombre_fr) + "</div>" : "") +
        "</div></div>";
    }).join("");
  }

  elSearch.addEventListener("input", function () {
    renderResults(search(elSearch.value));
  });
  elSearch.addEventListener("focus", function () {
    if (elSearch.value) renderResults(search(elSearch.value));
  });
  elResults.addEventListener("click", function (e) {
    var item = e.target.closest(".result-item");
    if (item) showBoss(parseInt(item.dataset.id, 10));
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-container")) elResults.innerHTML = "";
  });

  elShort.addEventListener("change", function () {
    shortMode = elShort.checked;
    var cur = viewBoss.dataset.id;
    if (cur && viewBoss.classList.contains("hidden") === false) showBoss(parseInt(cur, 10));
  });

  /* ---------- Ficha del jefe ---------- */

  function barBlock(icon, title, value, cls) {
    var v = Math.max(0, Math.min(10, Number(value) || 0));
    return '<div class="bar-block">' +
      '<div class="bar-title"><img src="assets/icons/' + icon + '" alt=""> <span>' + title + "</span></div>" +
      '<div class="bar-track"><div class="bar-fill ' + cls +
      '" style="width:' + (v * 10) + '%"></div></div>' +
      '<div class="bar-value">' + v + "/10</div></div>";
  }

  function section(cls, icon, title, text) {
    if (!text) return "";
    return '<div class="section ' + cls + '">' +
      '<div class="section-head"><img src="assets/icons/' + icon + '" alt=""> ' + title + "</div>" +
      renderRich(text) + "</div>";
  }

  function showBoss(id) {
    var b = BY_ID[id];
    if (!b) return;

    var info = shortMode && b.informacion_corta ? b.informacion_corta : b.informacion;
    var meca = shortMode && b.mecanica_corta ? b.mecanica_corta : b.mecanica;
    var adv = shortMode && b.consejos_cortos ? b.consejos_cortos : b.consejos;

    var meta = [];
    if (b.familia) meta.push('<span class="label">Familia:</span> ' + esc(b.familia));
    if (b.raza) meta.push('<span class="label">Raza:</span> ' + esc(b.raza));
    var lvl = "";
    if (b.nivel_min && b.nivel_max && b.nivel_min !== b.nivel_max) lvl = b.nivel_min + " – " + b.nivel_max;
    else if (b.nivel_min) lvl = String(b.nivel_min);
    if (lvl) meta.push('<span class="label">Nivel:</span> ' + esc(lvl));
    if (b.nivel_sueno) meta.push('<span class="label">Nivel en Sueño:</span> ' + esc(b.nivel_sueno));
    if (b.mazmorras && b.mazmorras.length) meta.push('<span class="label">Mazmorra:</span> ' + esc(b.mazmorras.join(", ")));

    var diff = "";
    if (typeof b.dificultad === "number") {
      var stars = "";
      for (var i = 0; i < 10; i++) stars += i < b.dificultad ? "★" : "☆";
      diff = '<div class="boss-meta" style="margin-top:.4rem;"><span class="label">Dificultad:</span> ' +
        stars + " (" + b.dificultad + "/10)</div>";
    }

    var html = "" +
      '<div class="monster-header-block">' +
        '<div class="monster-image-box"><img src="' + imgSrc(b.imagen) + '" alt="' + esc(b.nombre_es || b.nombre_fr) + '"></div>' +
        "<div>" +
          '<h1 class="bossname">' + esc(b.nombre_es || b.nombre_fr) + "</h1>" +
          (b.nombre_es && b.nombre_fr && b.nombre_es !== b.nombre_fr
            ? '<div class="bossname-fr">Francés: ' + esc(b.nombre_fr) + "</div>" : "") +
          '<div class="boss-meta">' + meta.join("<br>") + "</div>" +
          diff +
        "</div>" +
      "</div>";

    if (b.ilustracion) {
      html += '<div style="text-align:center;margin-top:1rem;">' +
        '<img src="assets/illustrations/' + encodeURIComponent(b.ilustracion) + '" style="max-width:100%;border-radius:10px;" alt="">' +
        (b.leyenda ? '<div class="illustration-caption">' + esc(b.leyenda) + "</div>" : "") + "</div>";
    }

    html += '<div class="subheading">Gestión general</div><div class="bars-grid">' +
      barBlock("Focus.png", "Focus inmediato", b.focus, "focus") +
      barBlock("Evasion.png", "Esquiva", b.esquiva, "esquiva") +
      barBlock("Tank.png", "Tanque", b.tanque, "tanque") +
      "</div>";

    html += section("informacion", "Information.png", "Información", info);
    html += section("mecanica", "M%C3%A9canique6.png", "Mecánicas globales", meca);
    html += section("consejos", "Conseils.png", "Consejos de estrategia", adv);

    // Enlace a la ficha del jefe en DoFensive (en español), como en el sitio original.
    if (b.dofensive) {
      html += '<div class="dofensive-link-wrap">' +
        '<a class="dofensive-link" href="' + esc(b.dofensive) + '" target="_blank" rel="noopener">' +
        "¿Necesitas detalles? " +
        '<img src="assets/icons/Dofensive.png" class="dofensive-icon" alt="DoFensive">' +
        "</a></div>";
    }

    if (b.hechizos && b.hechizos.length) {
      html += '<div class="subheading">Hechizos del jefe</div><div class="spell-grid">' +
        b.hechizos.map(function (s) {
          var st = [];
          if (s.ap != null) st.push(s.ap + " PA");
          if (s.range != null) st.push("Alcance " + (s.minRange && s.minRange !== s.range ? s.minRange + "-" + s.range : s.range));
          if (s.perTurn) st.push(s.perTurn + "x/turno");
          return '<div class="spell-card"><div class="sname">' + esc(s.name) + "</div>" +
            (st.length ? '<div class="sstats">' + esc(st.join(" · ")) + "</div>" : "") +
            (s.desc ? '<div class="sdesc">' + esc(s.desc) + "</div>" : "") + "</div>";
        }).join("") + "</div>";
    }

    bossContent.innerHTML = html;
    viewHome.classList.add("hidden");
    viewBoss.classList.remove("hidden");
    viewBoss.dataset.id = String(b.id);
    window.scrollTo(0, 0);

    var url = new URL(location.href);
    url.searchParams.set("boss", String(b.id));
    history.replaceState(null, "", url);
  }

  function goHome() {
    viewBoss.classList.add("hidden");
    viewHome.classList.remove("hidden");
    viewBoss.dataset.id = "";
    var url = new URL(location.href);
    url.searchParams.delete("boss");
    history.replaceState(null, "", url);
    elSearch.focus();
  }

  function randomBoss() {
    if (!BOSSES.length) return;
    showBoss(BOSSES[Math.floor(Math.random() * BOSSES.length)].id);
  }

  document.getElementById("back-btn").addEventListener("click", goHome);
  document.getElementById("random-btn").addEventListener("click", randomBoss);
  document.getElementById("random-btn-2").addEventListener("click", randomBoss);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") goHome();
  });

  /* ---------- Arranque ---------- */
  // Se ejecuta al final para que INDEX, buildIndex, showBoss, etc. ya estén listos.
  if (Array.isArray(window.SONGES_DATA) && window.SONGES_DATA.length) {
    onDataReady(window.SONGES_DATA);
  } else {
    fetch("data/jefes.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(onDataReady)
      .catch(function (e) {
        showLoadError(
          e.message +
          (location.protocol === "file:"
            ? " — Abre el sitio con un servidor local (ver README) o comprueba que data/jefes.js existe."
            : "")
        );
      });
  }
})();
