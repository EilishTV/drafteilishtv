/* =========================
   DROPDOWN USUARIO
========================= */
const userMenu = document.querySelector(".userMenu");
const dropDown = document.querySelector(".dropDown");
const profileArrow = document.getElementById("profileArrow");

let closeTimer;

if (userMenu && dropDown) {
    userMenu.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        dropDown.style.display = "flex";

        // mostrar flecha
        if (profileArrow) profileArrow.style.opacity = "1";
    });

    userMenu.addEventListener("mouseleave", () => {
        closeTimer = setTimeout(() => {
            dropDown.style.display = "none";

            // ocultar flecha
            if (profileArrow) profileArrow.style.opacity = "0";
        }, 150);
    });
} else {
    console.log("userMenu o dropDown no encontrados");
}



/* =========================
   BUSCADOR
========================= */
const searchBtn = document.querySelector(".searchBtn");
const searchInput = document.querySelector(".searchInput");

if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
        searchInput.classList.toggle("show");
        if (searchInput.classList.contains("show")) {
            searchInput.focus();
        }
    });
} else {
    console.log("searchBtn o searchInput no encontrados");
}



/* =========================
   LOGOUT
========================= */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("CLICK LOGOUT");

        if (window.logoutUser) {
            window.logoutUser();
        } else {
            console.error("logoutUser no está disponible todavía");
        }
    });
} else {
    console.log("logoutBtn no encontrado");
}



/* =========================
   PERFIL ACTIVO EN NAV
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const navName = document.getElementById("navProfileName");
    const navAvatar = document.getElementById("navAvatar");

    const storedName = localStorage.getItem("navProfileName");
    const storedAvatar = localStorage.getItem("navProfileAvatar");

    if (storedName && navName) {
        navName.textContent = storedName;
    }

    if (storedAvatar && navAvatar) {
        navAvatar.src = storedAvatar;
    }

});



/* =========================
   ABRIR OVERLAY
========================= */

if (openProfiles) {
    openProfiles.addEventListener("click", () => {
        const overlay = document.getElementById("whoIsWatching");
        if (overlay) {
            overlay.style.display = "flex";
        }

        // ocultar flecha
        if (profileArrow) profileArrow.style.opacity = "0";
    });
}
