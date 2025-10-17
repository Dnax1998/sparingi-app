console.log("✅ script.js działa!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 DOM wczytany, startujemy!");

  // --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyBXwR3VojWtQLA6FsXj2pVQsSTWNNAUhb0",
  authDomain: "sparingi-app.firebaseapp.com",
  projectId: "sparingi-app",
  storageBucket: "sparingi-app.firebasestorage.app",
  messagingSenderId: "293859421755",
  appId: "1:293859421755:web:e98887fdc5fb4a79aef61e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase connected!");


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
      
      // przekierowanie po zalogowaniu
      setTimeout(() => {
        window.location.replace("dashboard.html");
      }, 800);
      
    } catch (err) {
      showMsg("Błąd logowania: " + err.message, "danger");
    }
  });
}

  // --- Rejestracja e-mail ---
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Sprawdzenie haseł
    if (password !== confirmPassword) {
      showMsg("Hasła nie są identyczne!", "danger");
      return;
    }

    try {
      await auth.createUserWithEmailAndPassword(email, password);
      showMsg("Zarejestrowano pomyślnie ✅", "success");

      // przekierowanie po udanej rejestracji
      setTimeout(() => {
        window.location.replace("dashboard.html");
      }, 800);

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
      
      // przekierowanie po logowaniu Google
      setTimeout(() => {
        window.location.replace("dashboard.html");
      }, 800);
      
    } catch (err) {
      showMsg("Błąd logowania Google: " + err.message, "danger");
    }
  });
}


  if (googleRegisterBtn) {
  googleRegisterBtn.addEventListener("click", async () => {
    try {
      await auth.signInWithPopup(provider);
      showMsg("Zarejestrowano przez Google ✅", "success");

      // przekierowanie po rejestracji Google
      setTimeout(() => {
        window.location.replace("dashboard.html");
      }, 800);

    } catch (err) {
      showMsg("Błąd rejestracji Google: " + err.message, "danger");
    }
  });
}


  // --- Monitorowanie stanu logowania (bez automatycznego przekierowania) ---
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("✅ Użytkownik zalogowany:", user.email);
    // Nie przekierowujemy automatycznie — użytkownik sam klika „Zaloguj się”
  } else {
    console.log("❌ Użytkownik niezalogowany");
  }
});


  console.log("🚀 Wszystkie listenery podpięte!");
});
