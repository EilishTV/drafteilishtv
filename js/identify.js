

/* =========================
   IDENTIFY → enviar email
========================= */
const startBtn = document.getElementById("startBtn");

if (startBtn) {
    startBtn.addEventListener("click", () => {
        const email = document.getElementById("emailInput").value.trim();

        if (!email) {
            alert("Ingresá tu email");
            return;
        }

        window.location.href = `signup/?email=${encodeURIComponent(email)}`;
    });
}


/* =========================
   SIGNUP → mostrar email
========================= */
const userEmail = document.getElementById("userEmail");

if (userEmail) {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (email) {
        userEmail.textContent = email;
    }
}