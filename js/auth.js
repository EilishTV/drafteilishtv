// =======================================
// FIREBASE IMPORTS
// =======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =======================================
// FIREBASE CONFIG
// =======================================

const firebaseConfig = {
  apiKey: "AIzaSyC3x7H9-JliDqEha3P-Ne_X9FyIFmxw7ec",
  authDomain: "eilishtv-935ee.firebaseapp.com",
  projectId: "eilishtv-935ee",
  storageBucket: "eilishtv-935ee.firebasestorage.app",
  messagingSenderId: "95065190642",
  appId: "1:95065190642:web:7174eb5746a591ebdce06b",
  measurementId: "G-TQFR3YRJJ6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =======================================
// NAV UPDATE
// =======================================

function updateNav(name, avatar) {
  if (!name) name = "User";
  if (!avatar) avatar = "/images/avatars/avatar1.jpeg";

  localStorage.setItem("navProfileName", name);
  localStorage.setItem("navProfileAvatar", avatar);

  const navName = document.getElementById("navProfileName");
  const navAvatar = document.querySelector(".userMenu .userImg");

  if (navName) navName.textContent = name;
  if (navAvatar) navAvatar.src = avatar;
}


// =======================================
// LOAD PROFILE (DESDE SUBCOLECCIÓN profiles)
// =======================================

async function loadProfile(user) {
  try {

    const profilesRef = collection(db, "users", user.uid, "profiles");

    // 1️⃣ Buscar perfil principal
    const q = query(profilesRef, where("main", "==", true));
    const mainSnap = await getDocs(q);

    if (!mainSnap.empty) {
      return mainSnap.docs[0].data();
    }

    // 2️⃣ Si no hay main, usar el primero
    const allProfiles = await getDocs(profilesRef);

    if (!allProfiles.empty) {
      return allProfiles.docs[0].data();
    }

    // 3️⃣ Fallback
    return {
      name: user.displayName || "User",
      avatar: "/images/avatars/avatar1.jpeg"
    };

  } catch (err) {
    console.error("Firestore read error:", err);

    return {
      name: user.displayName || "User",
      avatar: "/images/avatars/avatar1.jpeg"
    };
  }
}


// =======================================
// AUTH STATE (CONTROL DE RUTAS)
// =======================================

onAuthStateChanged(auth, async (user) => {

  const path = window.location.pathname;

  const inIdentify = path.startsWith("/identify");
  const inBrowse = path.startsWith("/browse");
  const inProfile = path.startsWith("/profile");

  if (user) {

    const profile = await loadProfile(user);
    updateNav(profile.name, profile.avatar);

    if (inIdentify || path === "/" || path.endsWith("index.html")) {
      window.location.href = "/browse/";
    }

  } else {

    if (inBrowse || inProfile) {
      window.location.href = "/identify/";
    }

  }
});


// =======================================
// SIGN UP
// =======================================

const registerBtn = document.querySelector(".continueBtn");

registerBtn?.addEventListener("click", async () => {
  try {

    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const password = document.getElementById("password")?.value.trim();
    const name = document.getElementById("userName")?.value.trim();

    if (!email || !password || !name) {
      alert("Completá todos los campos.");
      return;
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // 🔥 Guardar displayName en Auth
    await updateProfile(user, { displayName: name });

    // 🔥 Crear subcolección profiles con perfil principal
    const profilesRef = collection(db, "users", user.uid, "profiles");

    await setDoc(doc(profilesRef), {
      name: name,
      avatar: "/images/avatars/avatar1.jpeg",
      main: true,
      createdAt: new Date()
    });

    window.location.href = "/browse/";

  } catch (err) {
    console.error("Signup error:", err);
    alert(err.message);
  }
});


// =======================================
// LOGIN
// =======================================

const loginBtn = document.getElementById("loginBtn");

loginBtn?.addEventListener("click", async () => {
  try {

    const email = document.getElementById("emailInput")?.value.trim();
    const password = document.getElementById("passwordInput")?.value.trim();

    if (!email || !password) {
      alert("Completá email y contraseña.");
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "/browse/";

  } catch (err) {
    console.error("Login error:", err);
    alert("Email o contraseña incorrectos.");
  }
});


// =======================================
// LOGOUT
// =======================================

document.addEventListener("click", async (e) => {
  if (e.target.id === "logoutBtn") {
    try {

      await signOut(auth);

      localStorage.removeItem("navProfileName");
      localStorage.removeItem("navProfileAvatar");

      window.location.href = "/identify/";

    } catch (err) {
      console.error("Logout error:", err);
      alert("Error cerrando sesión.");
    }
  }
});


// =======================================
// CARGA INICIAL NAV (ANTI FLASH)
// =======================================

document.addEventListener("DOMContentLoaded", () => {
  const storedName = localStorage.getItem("navProfileName");
  const storedAvatar = localStorage.getItem("navProfileAvatar");

  if (storedName && storedAvatar) {
    updateNav(storedName, storedAvatar);
  }
});

