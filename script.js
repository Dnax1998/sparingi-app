// ===== Helpery UI =====
const THEME_KEY = 'theme_mode';
const body = document.body;
const toggleBtn = document.getElementById('themeToggle');
const errBox = document.getElementById('err');
const okBox  = document.getElementById('ok');
const statusDot = document.getElementById('statusDot');

function setTheme(mode){
  body.classList.remove('light','dark');
  body.classList.add(mode);
  localStorage.setItem(THEME_KEY, mode);
  toggleBtn.textContent = mode === 'dark' ? '☀️ Tryb jasny' : '🌙 Tryb ciemny';
  toggleBtn.className = mode === 'dark' ? 'theme-toggle btn btn-sm btn-outline-light' : 'theme-toggle btn btn-sm btn-outline-dark';
}
setTheme(localStorage.getItem(THEME_KEY) || 'dark');
toggleBtn.addEventListener('click', ()=> setTheme(body.classList.contains('dark') ? 'light' : 'dark'));

function showErr(msg){
  errBox.textContent = msg || 'Wystąpił błąd.';
  errBox.classList.remove('d-none');
}
function showOk(msg){
  okBox.textContent = msg || 'OK';
  okBox.classList.remove('d-none');
  setTimeout(()=> okBox.classList.add('d-none'), 3500);
}
function setStatus(text, cls){
  statusDot.textContent = text;
  statusDot.className = 'badge ' + cls;
}
setStatus('online', 'text-bg-success');
window.addEventListener('offline', ()=> setStatus('offline', 'text-bg-secondary'));
window.addEventListener('online',  ()=> setStatus('online',  'text-bg-success'));

// ===== Firebase inicjalizacja (compat) =====
try {
  const firebaseConfig = {
    apiKey: "AIzaSyBXwR3VojWtQLA6FsXj2pVQsSTWNNAUhb0",
    authDomain: "sparingi-app.firebaseapp.com",
    projectId: "sparingi-app",
    storageBucket: "sparingi-app.firebasestorage.app",
    messagingSenderId: "293859421755",
    appId: "1:293859421755:web:e98887fdc5fb4a79aef61e"
  };
  if (!window.firebase || !firebase.initializeApp) throw new Error('Firebase SDK nie załadował się.');
  firebase.initializeApp(firebaseConfig);
} catch (e){
  showErr('Błąd inicjalizacji Firebase: ' + e.message);
}

const db = firebase.firestore();

// ===== Formularz =====
const form = document.getElementById('matchForm');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  errBox.classList.add('d-none'); okBox.classList.add('d-none');

  const teamHost = document.getElementById('teamHost').value.trim();
  const level    = document.getElementById('level').value.trim();
  const date     = document.getElementById('date').value;
  const time     = document.getElementById('time').value;
  const location = document.getElementById('location').value.trim();
  const contact  = document.getElementById('contact').value.trim();

  if(!teamHost || !level || !date || !time || !location || !contact){
    showErr('Uzupełnij wszystkie pola.');
    return;
  }

  try {
    await db.collection('matches').add({ teamHost, level, date, time, location, contact, createdAt: new Date() });
    form.reset();
    showOk('Dodano! Aby zobaczyć na liście, odśwież stronę.');
  } catch (err){
    showErr('Błąd dodawania: ' + err.message);
    console.error(err);
  }
});

// ===== Odczyt listy (bez trybu live) =====
const tbody = document.getElementById('matchesBody');
function linkify(text){
  if (!text) return '';
  const t = text.trim();
  if (/^\+?\d[\d\s-]{7,}$/.test(t)) return `<a href="tel:${t.replace(/[\s-]/g,'')}">${t}</a>`;
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t)) return `<a href="mailto:${t}">${t}</a>`;
  if (/^https?:\/\//i.test(t)) return `<a href="${t}" target="_blank" rel="noopener">${t}</a>`;
  return t;
}

async function loadOnce(){
  try {
    const snap = await db.collection('matches').orderBy('date').orderBy('time').get();
    tbody.innerHTML = '';
    if (snap.empty){
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Brak spotkań</td></tr>';
      return;
    }
    snap.forEach(doc => {
      const x = doc.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${x.date || ''} ${x.time || ''}</td>
        <td>${x.teamHost || ''}</td>
        <td>${x.level || ''}</td>
        <td>${x.location || ''}</td>
        <td>${linkify(x.contact || '')}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err){
    showErr('Błąd pobierania listy: ' + err.message);
    console.error(err);
  }
}

loadOnce();
