const container = document.getElementById("proximamente");

// ================== CONFIG ==================
const data = {
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Billie_Eilish_-_Hit_Me_Hard_and_Soft_-_The_Tour_In_3D_logo.png",
    descripcion: "Una experiencia visual inmersiva que transforma el álbum en un viaje intenso y envolvente",
    poster: "https://www.seattlemusicnews.com/wp-content/uploads/2024/12/billie-eilish-seattle-climate-pledge-arena-by-henry-hwu-1.jpg",
    video: "../images/extras/BILLIE EILISH - HIT ME HARD AND SOFT_ THE TOUR (LIVE IN 3D) _ Official Trailer.mp4",
    botones: ["Ver más", "Recordarme"]
};

// ================== ESTILOS CONTENEDOR ==================
container.style.position = "relative";
container.style.width = "calc(100% - 30px)";
container.style.margin = "15px";
container.style.height = "500px";
container.style.borderRadius = "12px";
container.style.overflow = "hidden";
container.style.fontFamily = "Arial, sans-serif";
container.style.color = "white";

// ================== MEDIA ==================
const mediaContainer = document.createElement("div");
mediaContainer.style.position = "absolute";
mediaContainer.style.inset = "0";
mediaContainer.style.zIndex = "0";
container.appendChild(mediaContainer);


// Poster
const poster = document.createElement("img");
poster.src = data.poster;
poster.style.width = "100%";
poster.style.height = "100%";
poster.style.objectFit = "cover";
poster.style.position = "absolute";
poster.style.inset = "0";
poster.style.transition = "opacity 0.8s ease";
mediaContainer.appendChild(poster);

// Video
const video = document.createElement("video");
video.src = data.video;
video.style.width = "100%";
video.style.height = "100%";
video.style.objectFit = "cover";
video.style.position = "absolute";
video.style.inset = "0";
video.style.opacity = "0";
video.style.transition = "opacity 0.8s ease";
video.autoplay = false;
video.muted = true;
video.playsInline = true;
mediaContainer.appendChild(video);

// ================== BOTÓN VOLUMEN ==================

const volumeBtn = document.createElement("i");
volumeBtn.className = "fas fa-volume-up";

volumeBtn.style.position = "absolute";
volumeBtn.style.right = "25px";
volumeBtn.style.bottom = "25px";
volumeBtn.style.fontSize = "22px";
volumeBtn.style.color = "white";
volumeBtn.style.cursor = "pointer";
volumeBtn.style.zIndex = "3";
volumeBtn.style.opacity = "0";
volumeBtn.style.transition = "opacity 0.3s ease";

container.appendChild(volumeBtn);

// Estado volumen
let sonidoActivo = true;

// Arranca muted por políticas del navegador
video.muted = true;

// Mostrar botón si el mouse está sobre el banner
container.addEventListener("mouseenter", () => {
    volumeBtn.style.opacity = "1";
});

container.addEventListener("mouseleave", () => {
    volumeBtn.style.opacity = "0";
});

// Mostrar también si el mouse está cerca del lado derecho
container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const distanciaDerecha = rect.right - e.clientX;

    if (distanciaDerecha < 120) {
        volumeBtn.style.opacity = "1";
    }
});

// Click volumen
volumeBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    sonidoActivo = !sonidoActivo;

    if (sonidoActivo) {
        video.muted = false;
        volumeBtn.className = "fas fa-volume-up";
    } else {
        video.muted = true;
        volumeBtn.className = "fas fa-volume-mute";
    }
});

// Overlay
const overlay = document.createElement("div");
overlay.style.position = "absolute";
overlay.style.inset = "0";
overlay.style.background = "linear-gradient(to right, rgba(0,0,0,0.9) 25%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.1))";
overlay.style.zIndex = "1";
container.appendChild(overlay);

// ================== CONTENIDO ==================
const content = document.createElement("div");
content.style.position = "relative";
content.style.zIndex = "2";
content.style.padding = "60px";
content.style.maxWidth = "600px";
container.appendChild(content);

// Badge
const badge = document.createElement("div");
badge.textContent = "Proximamente";
badge.style.display = "inline-block";
badge.style.padding = "6px 14px";
badge.style.background = "#0a102a";
badge.style.borderRadius = "20px";
badge.style.fontSize = "14px";
badge.style.marginBottom = "20px";
badge.style.fontWeight = "bold";
content.appendChild(badge);

// Logo
const logo = document.createElement("img");
logo.src = data.logo;
logo.style.width = "300px";
logo.style.display = "block";
logo.style.marginBottom = "20px";
logo.style.transition = "transform 0.6s ease";
logo.style.transformOrigin = "left top";
content.appendChild(logo);

// Descripción
const desc = document.createElement("p");
desc.textContent = data.descripcion;
desc.style.fontSize = "18px";
desc.style.lineHeight = "1.5";
desc.style.marginBottom = "25px";
content.appendChild(desc);

// Botones
const btnContainer = document.createElement("div");
btnContainer.style.display = "flex";
btnContainer.style.gap = "15px";
content.appendChild(btnContainer);

data.botones.forEach(texto => {
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.style.padding = "12px 28px";
    btn.style.borderRadius = "30px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "16px";
    btn.style.fontWeight = "bold";
    btn.style.transition = "0.3s";

    if (texto === "Ver más") {
        btn.style.background = "white";
        btn.style.color = "black";
    } else {
        btn.style.background = "rgba(255,255,255,0.2)";
        btn.style.color = "white";
        btn.style.border = "1px solid white";
    }

    btn.onmouseenter = () => btn.style.transform = "scale(1.05)";
    btn.onmouseleave = () => btn.style.transform = "scale(1)";
    btnContainer.appendChild(btn);
});

// ================== LÓGICA VIDEO ==================
let videoListo = false;
let minimoTiempoCumplido = false;

// mínimo 3 segundos de poster
setTimeout(() => {
    minimoTiempoCumplido = true;
    intentarReproducir();
}, 3000);

// cuando el video esté completamente listo
video.addEventListener("canplaythrough", () => {
    videoListo = true;
    intentarReproducir();
});

function intentarReproducir() {
    if (videoListo && minimoTiempoCumplido && bannerVisible) {

        video.play();
        video.style.opacity = "1";
        poster.style.opacity = "0";

        logo.style.transform = "scale(0.65) translateY(120px)";
    }
}

// cuando termina
video.addEventListener("ended", () => {
    video.style.opacity = "0";
    poster.style.opacity = "1";
    video.currentTime = 0;

    // 🔥 Restaurar logo
    logo.style.transform = "scale(1) translateY(0px)";

    minimoTiempoCumplido = false;
    setTimeout(() => {
        minimoTiempoCumplido = true;
        intentarReproducir();
    }, 10000);
});

// activar sonido con click
container.addEventListener("click", () => {
    video.muted = false;
});

// ================== DETECCIÓN DE VISIBILIDAD ==================

let bannerVisible = true;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

        if (!entry.isIntersecting) {

            bannerVisible = false;

            // cancelar posible espera activa
            if (esperaScrollTimeout) {
                clearTimeout(esperaScrollTimeout);
                esperaScrollTimeout = null;
            }

            video.pause();
            video.currentTime = 0;

            video.style.opacity = "0";
            poster.style.opacity = "1";

            logo.style.transform = "scale(1) translateY(0px)";

        } else {

            bannerVisible = true;

            // 🔥 cuando vuelve a ser visible → esperar 3s
            esperaScrollTimeout = setTimeout(() => {
                intentarReproducir();
            }, 3000);
        }

    });
}, {
    threshold: 0.3
});

observer.observe(container);