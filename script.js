// ===== Motyw =====
const THEME_KEY = 'theme_mode';
const body = document.body;
const toggleBtn = document.getElementById('themeToggle');
function setTheme(mode){
  body.classList.remove('light','dark');
  body.classList.add(mode);
  localStorage.setItem(THEME_KEY, mode);
  toggleBtn.textContent = mode === 'dark' ? '☀️ Tryb jasny' : '🌙 Tryb ciemny';
  toggleBtn.className = 'theme-toggle btn btn-sm btn-outline-dark';
}
setTheme(localStorage.getItem(THEME_KEY) || 'light');
toggleBtn.addEventListener('click', ()=> setTheme(body.classList.contains('dark') ? 'light' : 'dark'));

// status online/offline
const statusDot = document.getElementById('statusDot');
function setStatus(text, cls){ statusDot.textContent = text; statusDot.className = 'badge ' + cls; }
setStatus('online', 'text-bg-success');
window.addEventListener('offline', ()=> setStatus('offline', 'text-bg-secondary'));
window.addEventListener('online',  ()=> setStatus('online',  'text-bg-success'));

// ===== Firebase inicjalizacja =====
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

// ===== Widoki =====
const authView = document.getElementById('authView');
const appView  = document.getElementById('appView');
const userEmailEl = document.getElementById('userEmail');

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    authView.classList.add('d-none');
    appView.classList.remove('d-none');
    userEmailEl.textContent = user.email || '';
    // stwórz rekord profilu jeśli nie istnieje
    const uref = db.collection('users').doc(user.uid);
    const usnap = await uref.get();
    if (!usnap.exists) await uref.set({ team:'', contact:'', createdAt: new Date(), email: user.email || ''});
    loadProfile();
    loadMatches();
  } else {
    appView.classList.add('d-none');
    authView.classList.remove('d-none');
  }
});

// ===== Logowanie / Rejestracja E-mail =====
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    alert('Logowanie nieudane: ' + e.message);
  }
});
document.getElementById('registerBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    alert('Konto utworzone. Jesteś zalogowany!');
  } catch (e) {
    alert('Rejestracja nieudana: ' + e.message);
  }
});
document.getElementById('logoutBtn').addEventListener('click', () => auth.signOut());

// ===== Google Sign-In (logowanie i „rejestracja”) =====
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

async function signInWithGoogle(){
  try {
    await auth.signInWithPopup(provider);
  } catch (e) {
    alert('Google Sign-In nieudane: ' + e.message);
  }
}
// Oba przyciski robią to samo: zaloguj (a jeśli pierwszy raz – utworzy konto w Auth)
document.getElementById('googleLoginBtn').addEventListener('click', signInWithGoogle);
document.getElementById('googleRegisterBtn').addEventListener('click', signInWithGoogle);

// ===== PROFIL =====
async function loadProfile(){
  const user = auth.currentUser; if (!user) return;
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (snap.exists){
    const p = snap.data();
    document.getElementById('profileTeam').value = p.team || '';
    document.getElementById('profileContact').value = p.contact || '';
  }
}
document.getElementById('profileForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const user = auth.currentUser; if (!user) return;
  const team = document.getElementById('profileTeam').value.trim();
  const contact = document.getElementById('profileContact').value.trim();
  await db.collection('users').doc(user.uid).set({ team, contact }, { merge:true });
  alert('Zapisano profil!');
});

// ===== Mecze =====
function linkify(text){
  if (!text) return '';
  const t = text.trim();
  if (/^\+?\d[\d\s-]{7,}$/.test(t)) return `<a href="tel:${t.replace(/[\s-]/g,'')}">${t}</a>`;
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t)) return `<a href="mailto:${t}">${t}</a>`;
  if (/^https?:\/\//i.test(t)) return `<a href="${t}" target="_blank" rel="noopener">${t}</a>`;
  return t;
}

document.getElementById('matchForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const user = auth.currentUser; if (!user) { alert('Zaloguj się.'); return; }

  const teamHost = document.getElementById('teamHost').value.trim();
  const level    = document.getElementById('level').value.trim();
  const date     = document.getElementById('date').value;
  const time     = document.getElementById('time').value;
  const location = document.getElementById('location').value.trim();
  const contact  = document.getElementById('contact').value.trim();

  if (!teamHost || !level || !date || !time || !location || !contact) { alert('Uzupełnij wszystkie pola'); return; }

  await db.collection('matches').add({
    userId: user.uid,
    userEmail: user.email,
    teamHost, level, date, time, location, contact,
    createdAt: new Date()
  });
  alert('Dodano mecz! Odśwież listę, aby zobaczyć.');
  e.target.reset();
});

async function loadMatches(){
  const tbody = document.getElementById('matchesBody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Ładowanie…</td></tr>';
  try{
    const snap = await db.collection('matches').orderBy('date').orderBy('time').get();
    tbody.innerHTML = '';
    if (snap.empty){ tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Brak meczów</td></tr>'; return; }
    snap.forEach(docSnap => {
      const x = docSnap.data();
      const isOwner = auth.currentUser && x.userId === auth.currentUser.uid;
      const delBtn = isOwner ? `<button class="btn btn-sm btn-outline-danger" data-id="${docSnap.id}">Usuń</button>` : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${x.date || ''} ${x.time || ''}</td>
        <td>${x.teamHost || ''}</td>
        <td>${x.level || ''}</td>
        <td>${x.location || ''}</td>
        <td>${linkify(x.contact || '')}</td>
        <td>${delBtn}</td>`;
      if (isOwner) {
        tr.querySelector('button')?.addEventListener('click', async ()=>{
          if (!confirm('Usunąć ten mecz?')) return;
          await db.collection('matches').doc(docSnap.id).delete();
          loadMatches();
        });
      }
      tbody.appendChild(tr);
    });
  }catch(err){
    alert('Błąd pobierania listy: ' + err.message);
    console.error(err);
  }
}
document.getElementById('refreshBtn').addEventListener('click', loadMatches);
