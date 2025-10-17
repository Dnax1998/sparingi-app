console.log("✅ script.js działa!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 DOM wczytany, startujemy!");

  // --- Firebase config ---
  const firebaseConfig = {
    apiKey: "AIzaSyBvRx3iXy0uL4Qfe5jXp2VpGStNMAuHbo",
    authDomain: "sparingi-app.firebaseapp.com",
    projectId: "sparingi-app",
    storageBucket: "sparingi-app.appspot.com",
    messagingSenderId: "293598421755",
    appId: "1:293598421755:web:e9887dfc45fb4a79aef61e"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // --- Elementy strony ---
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const googleRegisterBtn = document.getElementById('googleRegisterBtn');
  const msg = document.getElementById('msg');

  // --- Pomocnicza funkcja komunikatów ---
  function showMsg(text, type = "info") {
    if (!msg) return;
    msg.className = `alert alert-${type}`;
    msg.textContent = text;
    msg.classList.remove("d-none");
    setTimeout(() => msg.classList.add("d-none"), 4000);
  }

  // --- Przełączanie zakładek ---
  if (tabLogin && tabRegister && loginForm && registerForm) {
    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      loginForm.classList.remove("d-none");
      registerForm.classList.add("d-none");
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      registerForm.classList.remove("d-none");
      loginForm.classList.add("d-none");
    });
  }

  // --- Logowanie e-mail ---
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;

      try {
        await auth.signInWithEmailAndPassword(email, password);
        showMsg("Zalogowano pomyślnie ✅", "success");
      } catch (err) {
        showMsg("Błąd logowania: " + err.message, "danger");
      }
    });
  }

  // --- Rejestracja e-mail ---
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("regEmail").value.trim();
      const p1 = document.getElementById("regPassword").value;
      const p2 = document.getElementById("regPassword2").value;

      if (p1 !== p2) return showMsg("Hasła się nie zgadzają ❌", "warning");

      try {
        await auth.createUserWithEmailAndPassword(email, p1);
        showMsg("Konto utworzone 🎉 Logowanie...", "success");
      } catch (err) {
        showMsg("Błąd rejestracji: " + err.message, "danger");
      }
    });
  }

  // --- Logowanie Google ---
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
      try {
        await auth.signInWithPopup(provider);
        showMsg("Zalogowano przez Google ✅", "success");
      } catch (err) {
        showMsg("Błąd logowania Google: " + err.message, "danger");
      }
    });
  }

  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", async () => {
      try {
        await auth.signInWithPopup(provider);
        showMsg("Zarejestrowano przez Google 🎉", "success");
      } catch (err) {
        showMsg("Błąd rejestracji Google: " + err.message, "danger");
      }
    });
  }

  // --- Monitorowanie stanu logowania ---
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ Zalogowany użytkownik:", user.email);
      if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        console.log("➡️ Przekierowanie do dashboard.html...");
        window.location.replace("dashboard.html");
      }
    } else {
      console.log("❌ Użytkownik niezalogowany");
    }
  });

  console.log("🚀 Wszystkie listenery podpięte!");
});
