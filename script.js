// Firebase config (Twoje istniejące dane)
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

// Konfiguracja przekierowania po zalogowaniu
const APP_URL = "https://sparingi-app.vercel.app/";

// Przełączanie zakładek
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const msg = document.getElementById('msg');
// Pobranie przycisków i formularzy
const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleRegisterBtn = document.getElementById('googleRegisterBtn');

// 🔐 Logowanie przez e-mail
loginForm?.addEventListener('submit', async (e) => {

  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showMsg('Zalogowano pomyślnie ✅', 'success');
  } catch (err) {
    showMsg('Błąd logowania: ' + err.message, 'danger');
  }
});

// 🆕 Rejestracja przez e-mail
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const p1 = document.getElementById('regPassword').value;
  const p2 = document.getElementById('regPassword2').value;
  if (p1 !== p2) return showMsg('Hasła się nie zgadzają ❌', 'warning');

  try {
    await auth.createUserWithEmailAndPassword(email, p1);
    showMsg('Konto utworzone pomyślnie 🎉', 'success');
  } catch (err) {
    showMsg('Błąd rejestracji: ' + err.message, 'danger');
  }
});

// 🔵 Logowanie przez Google
googleLoginBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    showMsg('Zalogowano przez Google ✅', 'success');
  } catch (err) {
    showMsg('Błąd logowania Google: ' + err.message, 'danger');
  }
});

// 🟢 Rejestracja przez Google
googleRegisterBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    showMsg('Zarejestrowano przez Google 🎉', 'success');
  } catch (err) {
    showMsg('Błąd rejestracji Google: ' + err.message, 'danger');
  }
});

function showLogin(){
  tabLogin.classList.add('active'); tabRegister.classList.remove('active');
  loginForm.classList.remove('d-none'); registerForm.classList.add('d-none');
}
function showRegister(){
  tabRegister.classList.add('active'); tabLogin.classList.remove('active');
  registerForm.classList.remove('d-none'); loginForm.classList.add('d-none');
}
tabLogin.addEventListener('click', showLogin);
tabRegister.addEventListener('click', showRegister);

// Pomocnicze
function showMsg(text, type='success'){
  msg.className = 'alert alert-' + type;
  msg.textContent = text;
  msg.classList.remove('d-none');
  setTimeout(()=> msg.classList.add('d-none'), 4000);
}

// Jeśli już zalogowany -> przekieruj
auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('users').doc(user.uid).set({ email: user.email || '' }, { merge: true }).finally(()=>{
      window.location.href = APP_URL;
    });
  }
});

// Logowanie e-mail
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  try{
    await auth.signInWithEmailAndPassword(email, pass);
    showMsg('Zalogowano! Przekierowanie...','success');
  }catch(err){
    showMsg('Błąd logowania: ' + err.message, 'danger');
  }
});

// Rejestracja e-mail
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const p1 = document.getElementById('regPassword').value;
  const p2 = document.getElementById('regPassword2').value;
  if (p1 !== p2) return showMsg('Hasła się nie zgadzają.', 'warning');
  try{
    await auth.createUserWithEmailAndPassword(email, p1);
    showMsg('Konto utworzone. Logowanie...', 'success');
  }catch(err){
    showMsg('Błąd rejestracji: ' + err.message, 'danger');
  }
});

// Google sign-in
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

document.getElementById('googleLoginBtn').addEventListener('click', async () => {
  try{
    await auth.signInWithPopup(provider);
  }catch(err){
    showMsg('Błąd logowania Google: ' + err.message, 'danger');
  }
});

document.getElementById('googleRegisterBtn').addEventListener('click', async () => {
  try{
    await auth.signInWithPopup(provider);
  }catch(err){
    showMsg('Błąd logowania Google: ' + err.message, 'danger');
  }
});
// Sprawdzanie stanu logowania, aby uniknąć pętli odświeżania
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("✅ Zalogowany użytkownik:", user.email);

    // Jeśli jesteśmy na stronie logowania, przekieruj tylko raz
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
      console.log("➡️ Przekierowanie do dashboard...");
      window.location.replace("dashboard.html"); // replace zamiast href — nie powoduje cofania w historii
    }
  } else {
    console.log("❌ Użytkownik niezalogowany");
  }
});
// Zatrzymuje odświeżanie formularzy
document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => e.preventDefault());
});
