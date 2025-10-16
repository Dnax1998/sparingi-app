// === Firebase ===
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

// === Motyw ===
const THEME_KEY='theme_mode',body=document.body,btn=document.getElementById('themeToggle');
function setTheme(m){body.className=m;localStorage.setItem(THEME_KEY,m);btn.textContent=m==='dark'?'☀️ Tryb jasny':'🌙 Tryb ciemny';}
setTheme(localStorage.getItem(THEME_KEY)||'light');btn.onclick=()=>setTheme(body.classList.contains('dark')?'light':'dark');

// === Status ===
const dot=document.getElementById('statusDot');function status(t,c){dot.textContent=t;dot.className='badge '+c;}
status('online','text-bg-success');window.addEventListener('offline',()=>status('offline','text-bg-secondary'));
window.addEventListener('online',()=>status('online','text-bg-success'));

// === Auth ===
const authView=document.getElementById('authView'),appView=document.getElementById('appView'),userEmail=document.getElementById('userEmail');
auth.onAuthStateChanged(async user=>{
  if(user){authView.classList.add('d-none');appView.classList.remove('d-none');userEmail.textContent=user.email;
    const ref=db.collection('users').doc(user.uid);const snap=await ref.get();if(!snap.exists)await ref.set({email:user.email,createdAt:new Date()});
    loadProfile();loadMatches();
  }else{appView.classList.add('d-none');authView.classList.remove('d-none');}
});

// Email login/register
document.getElementById('loginBtn').onclick=async()=>{const e=email.value.trim(),p=password.value;
  try{await auth.signInWithEmailAndPassword(e,p);}catch(err){alert('Błąd logowania: '+err.message);}}
document.getElementById('registerBtn').onclick=async()=>{const e=email.value.trim(),p=password.value;
  try{await auth.createUserWithEmailAndPassword(e,p);alert('Konto utworzone.');}catch(err){alert('Błąd rejestracji: '+err.message);}}
document.getElementById('logoutBtn').onclick=()=>auth.signOut();

// Google Sign-In
const provider=new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});
document.getElementById('googleLoginBtn').onclick=async()=>{
  try{await auth.signInWithPopup(provider);}catch(e){alert('Błąd logowania Google: '+e.message);}
};

// === Profil ===
async function loadProfile(){const u=auth.currentUser;if(!u)return;const ref=db.collection('users').doc(u.uid);const s=await ref.get();
  if(s.exists){const d=s.data();profileTeam.value=d.team||'';profileContact.value=d.contact||'';}}
profileForm.onsubmit=async e=>{e.preventDefault();const u=auth.currentUser;if(!u)return;
  await db.collection('users').doc(u.uid).set({team:profileTeam.value.trim(),contact:profileContact.value.trim()},{merge:true});alert('Zapisano profil!');}

// === Mecze ===
matchForm.onsubmit=async e=>{e.preventDefault();const u=auth.currentUser;if(!u)return alert('Zaloguj się.');
  const data={userId:u.uid,userEmail:u.email,teamHost:teamHost.value.trim(),level:level.value.trim(),
  date:date.value,time:time.value,location:location.value.trim(),contact:contact.value.trim(),createdAt:new Date()};
  if(!data.teamHost||!data.level||!data.date||!data.time||!data.location||!data.contact)return alert('Uzupełnij wszystkie pola');
  await db.collection('matches').add(data);alert('Dodano mecz!');e.target.reset();loadMatches();}

async function loadMatches(){const tb=matchesBody;tb.innerHTML='<tr><td colspan=6>Ładowanie...</td></tr>';
  try{const q=await db.collection('matches').orderBy('date').orderBy('time').get();tb.innerHTML='';
    if(q.empty)return tb.innerHTML='<tr><td colspan=6>Brak meczów</td></tr>';
    q.forEach(d=>{const x=d.data(),own=auth.currentUser&&x.userId===auth.currentUser.uid;
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${x.date} ${x.time}</td><td>${x.teamHost}</td><td>${x.level}</td><td>${x.location}</td><td>${x.contact}</td>
        <td>${own?'<button class="btn btn-sm btn-danger" data-id="'+d.id+'">Usuń</button>':''}</td>`;
      if(own)tr.querySelector('button').onclick=async()=>{if(confirm('Usunąć mecz?')){await db.collection('matches').doc(d.id).delete();loadMatches();}};
      tb.appendChild(tr);});}
  catch(err){tb.innerHTML='<tr><td colspan=6>Błąd: '+err.message+'</td></tr>';console.error(err);}}
refreshBtn.onclick=loadMatches;
