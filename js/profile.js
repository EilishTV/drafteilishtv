import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =========================
   CONFIG FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyC3x7H9-JliDqEha3P-Ne_X9FyIFmxw7ec",
  authDomain: "eilishtv-935ee.firebaseapp.com",
  projectId: "eilishtv-935ee",
  storageBucket: "eilishtv-935ee.firebasestorage.app",
  messagingSenderId: "95065190642",
  appId: "1:95065190642:web:7174eb5746a591ebdce06b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   DOM READY
========================= */

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("profilesContainer");
  const addBtn = document.getElementById("addProfile");
  const modal = document.getElementById("addProfileModal");
  const closeModal = document.querySelector(".closeModal");
  const saveNewProfile = document.getElementById("saveNewProfile");
  const newProfileName = document.getElementById("newProfileName");
  const newProfileAvatar = document.getElementById("newProfileAvatar");
  const newAvatarPreview = document.getElementById("newAvatarPreview");

  function showMessage(msg) {
    const toast = document.createElement("div");
    toast.className = "toastMessage";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  /* =========================
     AUTH STATE
  ========================= */

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      window.location.href = "/";
      return;
    }

    const profilesRef = collection(db, "users", user.uid, "profiles");

    /* =========================
       LISTENER EN TIEMPO REAL
    ========================= */

    onSnapshot(profilesRef, async (snapshot) => {

      container.innerHTML = "";

      // 🔥 CREAR PERFIL PRINCIPAL CON NOMBRE REAL
      if (snapshot.empty) {
        await addDoc(profilesRef, {
          name: user.displayName || "Usuario",
          avatar: "../images/avatars/avatar1.jpeg",
          main: true
        });
        return;
      }

      snapshot.forEach((docSnap) => {

        const profile = docSnap.data();
        const profileId = docSnap.id;

        const card = document.createElement("div");
        card.className = "profileCard";

        card.innerHTML = `
          <div class="profileInfo">
            <img src="${profile.avatar || '../images/avatars/avatar1.jpeg'}">
            <span>${profile.name}</span>
          </div>
          <i class="fas fa-chevron-right toggleSettings"></i>
          <div class="profileSettings" style="display:none;">
            <input type="text" value="${profile.name}">
            <input type="text" value="${profile.avatar}">
            <button class="saveBtn">Guardar cambios</button>
            ${
              profile.main
                ? `<button class="deleteBtn" disabled style="background-color:#555; cursor:not-allowed;">Perfil principal</button>`
                : `<button class="deleteBtn" style="background-color:#c00;">Eliminar perfil</button>`
            }
          </div>
        `;

        const toggle = card.querySelector(".toggleSettings");
        const settings = card.querySelector(".profileSettings");
        const nameInput = settings.querySelector("input:nth-child(1)");
        const avatarInput = settings.querySelector("input:nth-child(2)");
        const saveBtn = settings.querySelector(".saveBtn");
        const deleteBtn = settings.querySelector(".deleteBtn");

        toggle.addEventListener("click", () => {
          settings.style.display =
            settings.style.display === "flex" ? "none" : "flex";
        });

        /* ===== ACTUALIZAR ===== */

        saveBtn.addEventListener("click", async () => {

          const newName = nameInput.value.trim() || "Sin nombre";

          await updateDoc(doc(db, "users", user.uid, "profiles", profileId), {
            name: newName,
            avatar: avatarInput.value.trim()
          });

          // 🔥 Si es el principal → actualizar también Firebase Auth
          if (profile.main) {
            await updateProfile(user, {
              displayName: newName
            });
          }

          showMessage("Perfil actualizado");
        });

        /* ===== ELIMINAR ===== */

        if (!profile.main) {
          deleteBtn.addEventListener("click", async () => {

            const currentSnap = await getDocs(profilesRef);

            if (currentSnap.size <= 1) {
              showMessage("Debe quedar al menos un perfil");
              return;
            }

            await deleteDoc(doc(db, "users", user.uid, "profiles", profileId));
            showMessage("Perfil eliminado");
          });
        }

        container.appendChild(card);
      });

      addBtn.style.display = snapshot.size >= 5 ? "none" : "block";

    });

    /* =========================
       MODAL AGREGAR PERFIL
    ========================= */

    addBtn.addEventListener("click", () => {
      modal.style.display = "flex";
      newProfileName.value = "";
      newProfileAvatar.value = "";
      newAvatarPreview.src = "../images/avatars/avatar1.jpeg";
    });

    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    newProfileAvatar.addEventListener("input", () => {
      newAvatarPreview.src =
        newProfileAvatar.value || "../images/avatars/avatar1.jpeg";
    });

    saveNewProfile.addEventListener("click", async () => {

      const snapshot = await getDocs(profilesRef);

      if (snapshot.size >= 5) {
        showMessage("Máximo 5 perfiles");
        return;
      }

      await addDoc(profilesRef, {
        name: newProfileName.value.trim() || "Sin nombre",
        avatar: newProfileAvatar.value.trim(),
        main: false
      });

      modal.style.display = "none";
      showMessage("Perfil agregado");
    });

  });

});