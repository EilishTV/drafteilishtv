import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Config Firebase
const firebaseConfig = { /* tu config */ };
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

const overlay = document.getElementById("profileOverlay");
const profilesContainer = document.getElementById("profiles");

// 🔹 Función para generar el overlay con perfiles
async function showProfilesOverlay(user) {
  overlay.style.display = "flex";

  // Traer todos los perfiles del usuario
  const profilesRef = collection(db, "users", user.uid, "profiles");
  const allProfilesSnap = await getDocs(profilesRef);
  const profiles = allProfilesSnap.docs.map(doc => doc.data());

  profilesContainer.innerHTML = "";

  // Mostrar cada perfil
  profiles.forEach(profile => {
    const profileDiv = document.createElement("div");
    profileDiv.classList.add("profileWrapper");

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.style.backgroundImage = `url(${profile.avatar || "../images/avatars/avatar1.jpeg"})`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";

    const name = document.createElement("div");
    name.classList.add("profileName");
    name.textContent = profile.name;

    profileDiv.appendChild(avatar);
    profileDiv.appendChild(name);

    // Click → seleccionar perfil y redirigir
    profileDiv.addEventListener("click", () => {
      localStorage.setItem("navProfileName", profile.name);
      localStorage.setItem("navProfileAvatar", profile.avatar);
      localStorage.setItem("profileSelected", "true");
      overlay.style.display = "none";
      window.location.href = "/browse/";
    });

    profilesContainer.appendChild(profileDiv);
  });

  // Botón añadir perfil al final
  const addProfileBtn = document.createElement("div");
  addProfileBtn.classList.add("profileWrapper", "addNext");

  const addCircle = document.createElement("div");
  addCircle.classList.add("avatar", "addAvatar");
  addCircle.textContent = "+";

  const addName = document.createElement("div");
  addName.classList.add("profileName");
  addName.textContent = "Añadir";

  addProfileBtn.appendChild(addCircle);
  addProfileBtn.appendChild(addName);

  addCircle.addEventListener("click", () => alert("Agregar un nuevo perfil"));

  profilesContainer.appendChild(addProfileBtn);

  // Botón editar debajo de todo
  const editBtn = document.createElement("button");
  editBtn.classList.add("editProfileBtn");
  editBtn.textContent = "Editar perfil";
  editBtn.addEventListener("click", () => alert("Editar perfil"));

  overlay.appendChild(editBtn);
}

// 🔹 Evento inicial al cargar la página
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  // Si ya se seleccionó un perfil, no mostrar overlay
  if (localStorage.getItem("profileSelected") === "true") {
    overlay.style.display = "none";
    return;
  }

  await showProfilesOverlay(user);
});

// 🔹 Evento para abrir overlay desde la navbar
const openProfilesBtn = document.getElementById("openProfiles");
openProfilesBtn?.addEventListener("click", async () => {
  localStorage.removeItem("profileSelected"); // permite volver a mostrar overlay

  const user = auth.currentUser;
  if (!user) return;

  await showProfilesOverlay(user); // 🔹 volvemos a generar todos los perfiles
});

