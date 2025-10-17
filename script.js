
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBVxR3vjOvl0qL4F6jX5J2VpQ-STNMAuHbo",
  authDomain: "sparingi-app.firebaseapp.com",
  projectId: "sparingi-app",
  storageBucket: "sparingi-app.appspot.com",
  messagingSenderId: "293589421755",
  appId: "1:293589421755:web:e98887dfc5fb4a79aef61e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Przełączanie zakładek
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const msg = document.getElementById('msg');

// Przyciski Google
const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleRegisterBtn = document.getElementById('googleRegisterBtn');

// Funkcja komunikatów
function showMsg(text, type = 'success') {
  msg.className = 'alert alert-' + type;
  msg.textContent = text;
  msg.classList.remove('d-none');
  setTimeout(() => msg.classList.add('d-none'), 4000);
}

// Logowanie e-mail
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showMsg('Zalogowano pomyślnie ✅', 'success');
    window.location.href = "dashboard.html"; // przekierowanie po zalogowaniu
  } catch (err) {
    showMsg('Błąd logowania: ' + err.message, 'danger');
  }
});

// Rejestracja e-mail
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const p1 = document.getElementById('regPassword').value;
  const p2 = document.getElementById('regPassword2').value;
  if (p1 !== p2) return showMsg('Hasła się nie zgadzają ❌', 'warning');

  try {
    await auth.createUserWithEmailAndPassword(email, p1);
    showMsg('Konto utworzone! ✅', 'success');
    window.location.href = "dashboard.html";
  } catch (err) {
    showMsg('Błąd rejestracji: ' + err.message, 'danger');
  }
});

// Logowanie przez Google
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

googleLoginBtn.addEventListener('click', async () => {
  try {
    await auth.signInWithPopup(provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    showMsg('Błąd logowania Google: ' + err.message, 'danger');
  }
});

googleRegisterBtn.addEventListener('click', async () => {
  try {
    await auth.signInWithPopup(provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    showMsg('Błąd logowania Google: ' + err.message, 'danger');
  }
});

// Sprawdzanie stanu logowania (bez przekierowania z /index.html)
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("✅ Zalogowany użytkownik:", user.email);
  } else {
    console.log("❌ Użytkownik niezalogowany");
  }
});
