// ===============================================
// JS COMPLETO — Solo Catálogo General
// ===============================================

// URL Hoja1
const urlHoja1  = "https://opensheet.elk.sh/1PjRQDpbZQ6nscdRzlEOtwNpeEiyeEOGjkic6mggNEBY/1";

// ================= UTILIDADES =================

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function fixImagePath(path) {
  if(!path) return "";
  if(path.startsWith("http")) return path;
  return "../" + path.replace(/^\.{0,2}\//,"");
}

function sendClick(id){
  if(!id) return;
  navigator.sendBeacon(
    "https://script.google.com/macros/s/AKfycbyWl7csc047mwaAPRNFBoIC9DhODMOVt5ukgtU5SfRqsMF7kARPAVL-mdehydMj9od5/exec",
    JSON.stringify({id})
  );
}

// ===============================================
// CARGAR HOJA Y MOSTRAR CATÁLOGO
// ===============================================

fetch(urlHoja1)
  .then(r => r.json())
  .then(data => {

    const contenedor = document.getElementById("contenedor");
    if(!contenedor) return;

    const secciones = Array.from(
      data.reduce((map, item, idx) => {
        const key = item.seccion?.toLowerCase() || "sinseccion";
        if(!map.has(key)) {
          map.set(key, { 
            titulo: item.tituloSeccion || item.seccion,
            firstIdx: idx 
          });
        }
        return map;
      }, new Map())
    ).sort((a,b) => a[1].firstIdx - b[1].firstIdx);

    secciones.forEach(([secKey, info]) => {

      const items = data.filter(
        x => (x.seccion?.toLowerCase() || "sinseccion") === secKey
      );
      if(!items.length) return;

      const bloque = document.createElement("div");
      bloque.classList.add("recommends");

      bloque.innerHTML = `
        <div class="sectionHeader">
          <h4>${info.titulo || secKey}</h4>
          <a href="genre/?seccion=${encodeURIComponent(secKey)}" class="verMas">
            <i class="fas fa-chevron-right"></i>
          </a>
        </div>
        <div class="recommendedContent"></div>
      `;

      const contItems = bloque.querySelector(".recommendedContent");

      items.forEach(item => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "recWrap videoItem";

        const link = document.createElement("a");
        link.href = `video.html?id=${item.id}`;

        const img = document.createElement("img");
        img.src = fixImagePath(item.imagen);
        img.alt = escapeHtml(item.alt || "");

        link.appendChild(img);
        cardDiv.appendChild(link);

        cardDiv.addEventListener("click", () => sendClick(item.id));

        contItems.appendChild(cardDiv);
      });

      // Flechas del catálogo
      if(items.length >= 5 && window.innerWidth >= 769){

        const leftArrow = document.createElement("div");
        leftArrow.className = "arrow left";
        leftArrow.innerHTML = '<i style="pointer-events:none" class="fa-solid fa-angle-left"></i>';

        const rightArrow = document.createElement("div");
        rightArrow.className = "arrow right";
        rightArrow.innerHTML = '<i style="pointer-events:none" class="fa-solid fa-angle-right"></i>';

        bloque.appendChild(leftArrow);
        bloque.appendChild(rightArrow);

        const slide = dir => {
          const tarjetas = contItems.querySelectorAll(".recWrap");
          if(!tarjetas.length) return;

          const gap = parseInt(getComputedStyle(contItems).gap) || 12;
          const ancho = tarjetas[0].offsetWidth + gap;

          contItems.scrollBy({
            left: ancho * 4 * dir,
            behavior: "smooth"
          });
        };

        leftArrow.addEventListener("click", e => {
          e.stopPropagation();
          slide(-1);
        });

        rightArrow.addEventListener("click", e => {
          e.stopPropagation();
          slide(1);
        });
      }

      contenedor.appendChild(bloque);
    });

  })
  .catch(err => console.error("Error cargando catálogo:", err));

// =======================================
// SEARCH OVERLAY REAL CON CARDS — ALT + SECCION
// =======================================
document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.querySelector(".searchInput");
    const searchBtn = document.querySelector(".searchBtn");
    const overlay = document.getElementById("searchOverlay");
    const overlayResults = document.getElementById("overlayResults");
    const closeBtn = document.querySelector(".closeSearch");

    let catalogo = [];

    // ================= Cargar catálogo desde la hoja
    fetch(urlHoja1)
        .then(r => r.json())
        .then(data => catalogo = data)
        .catch(err => console.error("Error cargando catálogo para búsqueda:", err));

    // ================= UTILIDADES =================
    function fixImagePath(path) {
        if(!path) return "";
        if(path.startsWith("http")) return path;
        return "../" + path.replace(/^\.{0,2}\//,"");
    }

    function abrirOverlay() {
        overlay.classList.add("active");
    }

    function cerrarOverlay() {
        overlay.classList.remove("active");
        overlayResults.innerHTML = "";
    }

    // ================= BÚSQUEDA FUZZY =================
    function fuzzyMatch(str, query){
        str = (str || "").toLowerCase();
        query = (query || "").toLowerCase();
        let qIndex = 0;
        for(let c of str){
            if(c === query[qIndex]) qIndex++;
            if(qIndex === query.length) break;
        }
        return qIndex === query.length || str.includes(query);
    }

    function buscar() {
        const query = searchInput.value.trim().toLowerCase();
        if(!query) return;

        abrirOverlay();
        overlayResults.innerHTML = "";

        const resultados = catalogo.filter(item =>
            fuzzyMatch(item.alt, query) || fuzzyMatch(item.tituloSeccion, query)
        ).slice(0, 20); // Limitar a 20 resultados para fluidez

        if(resultados.length > 0){
            resultados.forEach(item => {
                const cardDiv = document.createElement("div");
                cardDiv.className = "recWrap videoItem";

                const link = document.createElement("a");
                link.href = `video.html?id=${item.id}`;

                const img = document.createElement("img");
                img.src = fixImagePath(item.imagen);
                img.alt = item.alt || item.tituloSeccion || "";

                link.appendChild(img);
                cardDiv.appendChild(link);

                cardDiv.addEventListener("click", () => {
                    if(item.id) sendClick(item.id);
                });

                overlayResults.appendChild(cardDiv);
            });
        } else {
            mostrarNoDisponible(query);
        }
    }

    function mostrarNoDisponible(query){
        overlayResults.innerHTML = `
            <p class="notFoundMessage">
                En este momento no tenemos <strong>${query}</strong>, pero podrías solicitarlo.
            </p>
            <button class="requestBtn">Solicitar contenido</button>
            <h3>Te podría gustar:</h3>
            <div id="suggestionsContainer" style="display:flex; flex-wrap:wrap; gap:12px;"></div>
        `;

        const suggestionsContainer = document.getElementById("suggestionsContainer");
        const recomendaciones = catalogo.sort(() => 0.5 - Math.random()).slice(0, 4);

        recomendaciones.forEach(item => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "recWrap videoItem";

            const link = document.createElement("a");
            link.href = `video.html?id=${item.id}`;

            const img = document.createElement("img");
            img.src = fixImagePath(item.imagen);
            img.alt = item.alt || item.tituloSeccion || "";

            link.appendChild(img);
            cardDiv.appendChild(link);

            cardDiv.addEventListener("click", () => {
                if(item.id) sendClick(item.id);
            });

            suggestionsContainer.appendChild(cardDiv);
        });
    }

    // ================= EVENTOS =================
    searchBtn.addEventListener("click", buscar);
    searchInput.addEventListener("keydown", e => {
        if(e.key === "Enter") buscar();
    });

    closeBtn.addEventListener("click", cerrarOverlay);
    overlay.addEventListener("click", e => {
        if(e.target === overlay) cerrarOverlay();
    });

});

