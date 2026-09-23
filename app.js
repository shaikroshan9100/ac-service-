import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getDatabase, ref, set, update, onValue } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import { getMessaging, getToken, isSupported } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging.js';

const firebaseConfig={
  apiKey:'AIzaSyB4KfsauDGiLCxnWVKZ8bM-zLaJZn9Qoq0',
  authDomain:'ac-works-c1cbf.firebaseapp.com',
  projectId:'ac-works-c1cbf',
  storageBucket:'ac-works-c1cbf.firebasestorage.app',
  messagingSenderId:'42938457253',
  appId:'1:42938457253:web:84f1e83d75af8284d2414c',
  measurementId:'G-358V7JQGMJ'
};

const app=initializeApp(firebaseConfig);
const db=getDatabase(app);
const auth=getAuth(app);
const services=[
{id:'general',name:'AC General Service',icon:'🔧',desc:'Basic cleaning, inspection and performance check.',price:499},
{id:'deep',name:'AC Deep Cleaning',icon:'🧼',desc:'Deep indoor unit cleaning for better cooling.',price:799},
{id:'repair',name:'AC Repair',icon:'🛠️',desc:'Electrical, PCB, fan motor, capacitor and other repairs.',price:0},
{id:'installation',name:'AC Installation',icon:'❄️',desc:'Split, window and ductable AC installation.',price:1499},
{id:'gas',name:'Gas Charging',icon:'💨',desc:'Gas charging, leak checking and pressure testing.',price:0},
{id:'amc',name:'AMC',icon:'🏠',desc:'Maintenance plans for homes and offices.',price:0}
];
let selected=null;
let cloudBookings=[];
let unsubscribeBookings=null;
const VAPID_KEY='YOUR_VAPID_PUBLIC_KEY_HERE';
const $=id=>document.getElementById(id);
const getLocal=()=>JSON.parse(localStorage.getItem('acworksBookings')||'[]');
const saveLocal=x=>localStorage.setItem('acworksBookings',JSON.stringify(x));

window.go=function(id){
  document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
  $(id).classList.add('active');
  document.querySelectorAll('.bottom button').forEach(x=>x.classList.toggle('active',x.dataset.nav===id));
  if(id==='bookings') lookupBookings();
  if(id==='admin') renderAdmin();
  scrollTo(0,0);
};
window.price=p=>p?'Starting ₹'+p:'Inspection / Quote';
function cards(){return services.map(s=>`<div class="card"><div class="icon">${s.icon}</div><h3>${s.name}</h3><p>${s.desc}</p><span class="price">${price(s.price)}</span></div>`).join('');}
function renderServices(){$('homeServices').innerHTML=cards();$('allServices').innerHTML=cards();}
function renderChoices(){
  $('serviceChoices').innerHTML=services.map(s=>`<label class="choice ${selected===s.id?'selected':''}"><input type="radio" name="service" value="${s.id}" ${selected===s.id?'checked':''}>${s.icon} ${s.name}<br><small>${price(s.price)}</small></label>`).join('');
  document.querySelectorAll('input[name="service"]').forEach(x=>x.onchange=()=>{selected=x.value;renderChoices();updatePrice();});
}
function updatePrice(){const s=services.find(x=>x.id===selected),n=+$('count').value||1;$('price').textContent=s&&s.price?'₹'+(s.price*n):s?'Quote after inspection':'Select service';}
function newId(){return 'ACW'+Date.now().toString().slice(-8)+Math.floor(Math.random()*90+10);}

$('bookingForm').onsubmit=async e=>{
  e.preventDefault();
  const phone=$('phone').value.trim();
  if(!/^\d{10}$/.test(phone)) return toast('Enter a valid 10-digit mobile number.');
  if(!selected) return toast('Select a service.');
  const s=services.find(x=>x.id===selected), count=+$('count').value||1;
  const payment=document.querySelector('input[name="payment"]:checked').value;
  const b={id:newId(),phone,name:$('name').value.trim(),service:s.name,serviceId:s.id,acType:$('acType').value,brand:$('brand').value,count,date:$('date').value,time:$('time').value,address:$('address').value.trim(),landmark:$('landmark').value.trim(),notes:$('notes').value.trim(),payment,amount:s.price*count,status:'Pending',technician:'Pending assignment',createdAt:new Date().toISOString()};
  try{
    await set(ref(db,'bookings/'+b.id),b);
    const a=getLocal().filter(x=>x.id!==b.id);a.unshift(b);saveLocal(a);
    localStorage.setItem('acworksLastPhone',phone);
    e.target.reset();selected=null;renderChoices();updatePrice();toast('Booking '+b.id+' sent to AC WORKS.');go('bookings');
  }catch(err){console.error(err);toast('Booking failed. Please try again.');}
};

window.lookupBookings=function(){
  const saved=localStorage.getItem('acworksLastPhone')||'';
  if(!$('lookupPhone').value)$('lookupPhone').value=saved;
  const phone=$('lookupPhone').value.trim();
  const a=getLocal().filter(x=>x.phone===phone);
  $('bookingsList').innerHTML=a.length?a.map(b=>`<div class="booking"><div class="bookingHead"><div><h3>${b.service}</h3><small>${b.id}</small></div><span class="status">${b.status}</span></div><p>📅 ${b.date} • ${b.time}</p><p>❄️ ${b.acType} • ${b.brand} • ${b.count} AC</p><p>📍 ${b.address}</p><p>💳 ${b.payment} • ${b.amount?'Starting ₹'+b.amount:'Quote after inspection'}</p><p>👨‍🔧 ${b.technician}</p><div class="actions"><a class="smallBtn" target="_blank" href="https://wa.me/919505225027?text=Hello%20AC%20WORKS,%20my%20booking%20ID%20is%20${b.id}.">WhatsApp</a><a class="smallBtn" href="tel:9505225027">Call</a></div></div>`).join(''):`<div class="booking"><h3>No booking found</h3><p>Your current device has no saved booking for this number.</p></div>`;
};

window.adminLogin=async function(){
  const email=$('adminEmail').value.trim(),pass=$('adminPassword').value;
  if(!email||!pass)return toast('Enter admin email and password.');
  try{await signInWithEmailAndPassword(auth,email,pass);toast('Admin login successful.');}catch(err){console.error(err);toast(err.code==='auth/invalid-credential'?'Wrong email or password.':'Login failed. Check Firebase Authentication.');}
};
window.adminLogout=async function(){await signOut(auth);toast('Logged out.');go('home');};

function subscribeBookings(){
  if(unsubscribeBookings)unsubscribeBookings();
  unsubscribeBookings=onValue(ref(db,'bookings'),snap=>{
    const data=snap.val()||{};
    cloudBookings=Object.values(data).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
    renderAdmin();
  },err=>{console.error(err);toast('Could not read bookings. Check database rules.');});
}
function renderAdmin(){
  const user=auth.currentUser;
  $('adminLogin').classList.toggle('hidden',!!user);
  $('adminPanel').classList.toggle('hidden',!user);
  if(!user)return;
  $('adminUserEmail').textContent=user.email||'Owner';
  $('total').textContent=cloudBookings.length;
  $('pending').textContent=cloudBookings.filter(x=>x.status==='Pending').length;
  $('confirmed').textContent=cloudBookings.filter(x=>x.status==='Confirmed').length;
  $('done').textContent=cloudBookings.filter(x=>x.status==='Completed').length;
  const filter=$('adminFilter').value;
  const a=filter==='All'?cloudBookings:cloudBookings.filter(x=>x.status===filter);
  $('adminList').innerHTML=a.length?a.map(b=>`<div class="adminCard ${b.status==='Pending'?'newCard':''}"><div class="bookingHead"><div><h3>${b.id} • ${b.service}</h3><small>${b.status}</small></div>${b.status==='Pending'?'<span class="newBadge">NEW</span>':''}</div><p>👤 ${b.name} • 📞 ${b.phone}</p><p>📅 ${b.date} • ${b.time}</p><p>❄️ ${b.acType} • ${b.brand} • ${b.count} AC</p><p>📍 ${b.address}${b.landmark?' • '+b.landmark:''}</p><p>📝 ${b.notes||'No notes'}</p><p>💳 ${b.payment} • ${b.amount?'Starting ₹'+b.amount:'Quote after inspection'}</p><p>👨‍🔧 ${b.technician}</p><div class="adminActions"><button onclick="setStatus('${b.id}','Confirmed')">Confirm</button><button onclick="setStatus('${b.id}','Technician Assigned')">Assign Nabi</button><button onclick="setStatus('${b.id}','On The Way')">On Way</button><button class="done" onclick="setStatus('${b.id}','Completed')">Complete</button><button class="cancel" onclick="setStatus('${b.id}','Cancelled')">Cancel</button><a class="smallBtn" href="tel:${b.phone}">Call</a><a class="smallBtn" target="_blank" href="https://wa.me/91${b.phone}?text=Hello%20${encodeURIComponent(b.name)},%20this%20is%20AC%20WORKS%20regarding%20booking%20${b.id}.">WhatsApp</a></div></div>`).join(''):`<div class="booking"><h3>No bookings</h3><p>New customer bookings will appear here in real time.</p></div>`;
}
window.setStatus=async function(id,status){
  const b=cloudBookings.find(x=>x.id===id);if(!b)return;
  const patch={status};if(status==='Technician Assigned')patch.technician='Nabi Rasool';
  try{await update(ref(db,'bookings/'+id),patch);toast(id+' → '+status);}catch(err){console.error(err);toast('Update failed.');}
};

window.enableNotifications=async function(){
  if(!auth.currentUser)return toast('Login first.');
  if(!('Notification'in window))return toast('This browser does not support notifications.');
  if(VAPID_KEY==='YOUR_VAPID_PUBLIC_KEY_HERE')return toast('Add the Firebase Web Push VAPID key first.');
  try{
    const permission=await Notification.requestPermission();
    if(permission!=='granted')return toast('Notification permission was not granted.');
    if(!(await isSupported()))return toast('Push messaging is not supported here.');
    const reg=await navigator.serviceWorker.register('./firebase-messaging-sw.js');
    const messaging=getMessaging(app);
    const token=await getToken(messaging,{vapidKey:VAPID_KEY,serviceWorkerRegistration:reg});
    if(token){await set(ref(db,'adminTokens/'+encodeURIComponent(token)),token);$('notificationStatus').textContent='Enabled on this device';toast('Notifications enabled on this phone.');}
  }catch(err){console.error(err);toast('Could not enable notifications.');}
};

onAuthStateChanged(auth,user=>{
  if(user){subscribeBookings();renderAdmin();}
  else{if(unsubscribeBookings)unsubscribeBookings();unsubscribeBookings=null;cloudBookings=[];renderAdmin();}
});

$('count').oninput=updatePrice;
$('date').min=new Date().toISOString().split('T')[0];
renderServices();renderChoices();lookupBookings();renderAdmin();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
