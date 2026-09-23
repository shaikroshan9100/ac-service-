const services=[
{id:"general",name:"AC General Service",icon:"🔧",desc:"Basic cleaning, inspection and performance check.",price:499},
{id:"deep",name:"AC Deep Cleaning",icon:"🧼",desc:"Deep indoor unit cleaning for better cooling.",price:799},
{id:"repair",name:"AC Repair",icon:"🛠️",desc:"Electrical, PCB, fan motor, capacitor and other repairs.",price:0},
{id:"installation",name:"AC Installation",icon:"❄️",desc:"Split, window and ductable AC installation.",price:1499},
{id:"gas",name:"Gas Charging",icon:"💨",desc:"Gas charging, leak checking and pressure testing.",price:0},
{id:"amc",name:"AMC",icon:"🏠",desc:"Maintenance plans for homes and offices.",price:0}
];
let selected=null;
const $=x=>document.getElementById(x);
const getData=()=>JSON.parse(localStorage.getItem("acworksBookings")||"[]");
const saveData=x=>localStorage.setItem("acworksBookings",JSON.stringify(x));
function go(id){
 document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
 $(id).classList.add("active");
 document.querySelectorAll(".bottom button").forEach(x=>x.classList.toggle("active",x.dataset.nav===id));
 if(id==="bookings")lookupBookings();
 if(id==="admin")renderAdmin();
 scrollTo(0,0);
}
function price(p){return p?"Starting ₹"+p:"Inspection / Quote"}
function cards(){return services.map(s=>`<div class="card"><div class="icon">${s.icon}</div><h3>${s.name}</h3><p>${s.desc}</p><span class="price">${price(s.price)}</span></div>`).join("")}
function renderServices(){$("homeServices").innerHTML=cards();$("allServices").innerHTML=cards()}
function renderChoices(){
 $("serviceChoices").innerHTML=services.map(s=>`<label class="choice ${selected===s.id?"selected":""}"><input type="radio" name="service" value="${s.id}" ${selected===s.id?"checked":""}>${s.icon} ${s.name}<br><small>${price(s.price)}</small></label>`).join("");
 document.querySelectorAll('input[name="service"]').forEach(x=>x.onchange=()=>{selected=x.value;renderChoices();updatePrice()});
}
function updatePrice(){
 const s=services.find(x=>x.id===selected),n=+$("count").value||1;
 $("price").textContent=s&&s.price?"₹"+(s.price*n):s?"Quote after inspection":"Select service";
}
function newId(){return"ACW"+Math.floor(1000+Math.random()*9000)}
$("bookingForm").onsubmit=e=>{
 e.preventDefault();
 const phone=$("phone").value.trim();
 if(!/^[0-9]{10}$/.test(phone))return toast("Enter a valid 10-digit mobile number.");
 if(!selected)return toast("Select a service.");
 const s=services.find(x=>x.id===selected);
 const payment=document.querySelector('input[name="payment"]:checked').value;
 const b={
  id:newId(),phone,name:$("name").value.trim(),service:s.name,serviceId:s.id,
  acType:$("acType").value,brand:$("brand").value,count:$("count").value,
  date:$("date").value,time:$("time").value,address:$("address").value.trim(),
  landmark:$("landmark").value.trim(),notes:$("notes").value.trim(),
  payment,amount:s.price*(+$("count").value||1),status:"Pending",
  technician:"Pending assignment",createdAt:new Date().toISOString()
 };
 const a=getData();a.unshift(b);saveData(a);
 localStorage.setItem("acworksLastPhone",phone);
 e.target.reset();selected=null;renderChoices();updatePrice();
 toast("Booking "+b.id+" received");
 go("bookings");
}
function lookupBookings(){
 const saved=localStorage.getItem("acworksLastPhone")||"";
 if(!$("lookupPhone").value)$("lookupPhone").value=saved;
 const phone=$("lookupPhone").value.trim();
 const a=getData().filter(x=>x.phone===phone);
 $("bookingsList").innerHTML=a.length?a.map(b=>`<div class="booking">
 <div class="bookingHead"><div><h3>${b.service}</h3><small>${b.id}</small></div><span class="status">${b.status}</span></div>
 <p>📅 ${b.date} • ${b.time}</p><p>❄️ ${b.acType} • ${b.brand} • ${b.count} AC</p><p>📍 ${b.address}</p><p>💳 ${b.payment} • ${b.amount?"Starting ₹"+b.amount:"Quote after inspection"}</p><p>👨‍🔧 ${b.technician}</p>
 <div class="actions"><a class="smallBtn" target="_blank" href="https://wa.me/919505225027?text=Hello%20AC%20WORKS,%20my%20booking%20ID%20is%20${b.id}.">WhatsApp</a><a class="smallBtn" href="tel:9505225027">Call</a></div>
 </div>`).join(""):`<div class="booking"><h3>No booking found</h3><p>Enter the same mobile number used while booking.</p></div>`;
}
function renderAdmin(){
 const a=getData();
 $("total").textContent=a.length;
 $("pending").textContent=a.filter(x=>x.status==="Pending").length;
 $("confirmed").textContent=a.filter(x=>x.status==="Confirmed").length;
 $("done").textContent=a.filter(x=>x.status==="Completed").length;
 $("adminList").innerHTML=a.length?a.map(b=>`<div class="adminCard">
 <h3>${b.id} • ${b.service}</h3><p>👤 ${b.name} • 📞 ${b.phone}</p><p>📅 ${b.date} • ${b.time}</p><p>📍 ${b.address}</p><p>💳 ${b.payment} • ${b.amount?"Starting ₹"+b.amount:"Quote after inspection"}</p><p>👨‍🔧 ${b.technician}</p>
 <div class="adminActions"><button onclick="setStatus('${b.id}','Confirmed')">Confirm</button><button onclick="setStatus('${b.id}','Technician Assigned')">Assign</button><button onclick="setStatus('${b.id}','On The Way')">On Way</button><button class="done" onclick="setStatus('${b.id}','Completed')">Complete</button><button class="cancel" onclick="setStatus('${b.id}','Cancelled')">Cancel</button></div>
 </div>`).join(""):`<div class="booking"><h3>No bookings</h3><p>New customer bookings will appear here.</p></div>`;
}
function setStatus(id,status){
 const a=getData(),b=a.find(x=>x.id===id);
 if(b){b.status=status;if(status==="Technician Assigned")b.technician="Nabi Rasool";saveData(a);renderAdmin();toast(id+" → "+status)}
}
function toast(t){const x=$("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2400)}
$("count").oninput=updatePrice;
$("date").min=new Date().toISOString().split("T")[0];
renderServices();renderChoices();lookupBookings();renderAdmin();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
