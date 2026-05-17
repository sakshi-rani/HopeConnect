
const $=id=>document.getElementById(id);
const getVal=id=>($($id)||{value:''}).value||'';
// fix getVal for actual usage
function gv(id){ const el=document.getElementById(id); return el?el.value:''; }

function showNotif(msg,color){
  const n=$('notif');
  n.innerHTML=msg;
  n.style.borderLeftColor=color||'var(--gold)';
  n.classList.add('show');
  clearTimeout(n._t);
  n._t=setTimeout(()=>n.classList.remove('show'),4500);
}
function closeModal(id){ $(id).classList.remove('open'); }
function openModal(id){ $(id).classList.add('open'); }

function showTab(name,btn){
  document.querySelectorAll('.section-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  $('panel-'+name).classList.add('active');
  btn.classList.add('active');
  window.scrollTo({top:document.querySelector('.tabs-bar').offsetTop-68,behavior:'smooth'});
  if(name==='rescue') loadRescue();
  if(name==='vet'){ renderVetDirectory(); loadVetAppts(); }
  if(name==='adopt'){ renderPets(); loadAdoptApps(); }
  if(name==='lostpet') loadLostPets();
  if(name==='shelter') renderShelters();
}

function getStore(key){ try{ return JSON.parse(localStorage.getItem('hc_a_'+key)||'[]'); } catch(e){return [];} }
function setStore(key,data){ localStorage.setItem('hc_a_'+key,JSON.stringify(data)); }
function addToStore(key,item){ const d=getStore(key); d.unshift(item); setStore(key,d); }

function fmtTime(ts){
  const d=new Date(ts),now=new Date(),diff=(now-d)/1000;
  if(diff<60)return 'just now';
  if(diff<3600)return Math.floor(diff/60)+' min ago';
  if(diff<86400)return Math.floor(diff/3600)+' hr ago';
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
}

// ===== RESCUE =====
let rescueFilter='all';
function submitRescue(e){
  e.preventDefault();
  const name=gv('r-name'),phone=gv('r-phone'),animal=gv('r-animal'),condition=gv('r-condition'),location=gv('r-location');
  if(!name||!phone||!animal||!condition||!location){ showNotif('⚠️ Fill all required fields.','#E67E22'); return; }
  const entry={id:Date.now(),name,phone,animal,condition,count:gv('r-count'),urgency:gv('r-urgency'),location,desc:gv('r-desc'),status:'Active',ts:Date.now()};
  addToStore('rescue',entry);
  document.getElementById('rescue-form').reset();
  loadRescue();
  showNotif('🚨 Rescue team dispatched! ETA 20–30 min. Please stay near the animal if safe.','#C0392B');
}
function loadRescue(){
  let data=getStore('rescue');
  if(rescueFilter==='active') data=data.filter(r=>r.status==='Active');
  if(rescueFilter==='resolved') data=data.filter(r=>r.status==='Resolved');
  const list=$('rescue-list');
  if(!data.length){ list.innerHTML='<div class="empty-state"><div class="es-icon">🆘</div><p>No rescue reports. Report a distressed animal above.</p></div>'; return; }
  list.innerHTML=data.map(r=>`
    <div class="listing-card">
      <div>
        <div class="lc-badge ${r.status==='Resolved'?'badge-resolved':r.urgency.includes('Emergency')?'badge-emergency':'badge-active'}">${r.status}</div>
      </div>
      <div class="lc-content">
        <div class="lc-title">${r.animal} — ${r.condition}</div>
        <div class="lc-meta"><span>📍 ${r.location}</span><span>👤 ${r.name}</span><span>📞 ${r.phone}</span><span>🎯 ${r.urgency}</span><span>🕐 ${fmtTime(r.ts)}</span></div>
        ${r.desc?`<div style="font-size:0.82rem;color:var(--gray);margin-top:5px">${r.desc}</div>`:''}
      </div>
      <div class="lc-actions">
        ${r.status!=='Resolved'?`<button class="btn btn-success btn-sm" onclick="markRStatus(${r.id},'Rescued')">✓ Rescued</button>`:''}
        <button class="btn btn-danger btn-sm" onclick="delRescue(${r.id})">🗑</button>
      </div>
    </div>`).join('');
}
function markRStatus(id,status){ const d=getStore('rescue'); const i=d.findIndex(r=>r.id===id); if(i>-1){d[i].status='Resolved';setStore('rescue',d);loadRescue();showNotif('✅ Marked as '+status,'#0D7A55');} }
function delRescue(id){ if(!confirm('Remove?'))return; setStore('rescue',getStore('rescue').filter(r=>r.id!==id)); loadRescue(); }
function setRFilter(f,el){ rescueFilter=f; document.querySelectorAll('#panel-rescue .pill').forEach(p=>p.classList.remove('active')); el.classList.add('active'); loadRescue(); }

// ===== VET =====
const VET_DATA=[
  {id:1,name:'City Animal Hospital',type:'private',tags:['surgery','24h'],icon:'🏥',desc:'Full-service veterinary hospital with ICU, surgery theatre and diagnostic lab.',city:'Ranchi',phone:'0651-111111',hours:'24 hours',dist:'0.8 km',rating:'4.9'},
  {id:2,name:'Dr. Sharma Veterinary Clinic',type:'private',tags:['private'],icon:'🩺',desc:'Experienced small animal clinic. Specialises in dogs and cats.',city:'Ranchi',phone:'0651-222222',hours:'9 AM – 7 PM',dist:'1.4 km',rating:'4.7'},
  {id:3,name:'Govt. Veterinary Hospital',type:'govt',tags:['govt'],icon:'🏛️',desc:'Government run. Free treatment for stray animals and BPL farmers.',city:'Ranchi',phone:'0651-333333',hours:'8 AM – 4 PM (Mon–Sat)',dist:'2.1 km',rating:'4.2'},
  {id:4,name:'Green Paws Animal Care',type:'private',tags:['private','surgery'],icon:'🐾',desc:'Modern vet clinic with grooming, boarding and dental care services.',city:'Ranchi',phone:'0651-444444',hours:'9 AM – 8 PM',dist:'2.8 km',rating:'4.8'},
  {id:5,name:'Prani Mitra Emergency Vet',type:'private',tags:['24h','surgery'],icon:'🚑',desc:'24/7 emergency and critical care veterinary hospital.',city:'Ranchi',phone:'0651-555555',hours:'24 hours',dist:'3.2 km',rating:'4.6'},
  {id:6,name:'Happy Pets Clinic',type:'private',tags:['private'],icon:'😺',desc:'Friendly neighbourhood clinic for cats and small animals.',city:'Ranchi',phone:'0651-666666',hours:'10 AM – 6 PM',dist:'1.9 km',rating:'4.5'},
];
let vetTypeFilter='all';
function isOpenNow(hours){ if(hours.includes('24')) return true; const h=new Date().getHours(); return h>=9&&h<19; }
function submitVetAppt(e){
  e.preventDefault();
  const owner=gv('v-owner'),phone=gv('v-phone'),animal=gv('v-animal'),type=gv('v-type');
  if(!owner||!phone||!animal||!type){ showNotif('⚠️ Fill required fields.','#E67E22'); return; }
  addToStore('vet_appts',{id:Date.now(),owner,phone,petname:gv('v-petname'),animal,type,hospital:gv('v-hospital'),date:gv('v-date'),time:gv('v-time'),symptoms:gv('v-symptoms'),status:'Confirmed',ts:Date.now()});
  document.getElementById('vet-form').reset();
  loadVetAppts();
  showNotif('✅ Appointment confirmed at '+gv('v-hospital')+'! We\'ll call you to confirm.','#0D7A55');
}
function setVetFilter(f,el){ vetTypeFilter=f; document.querySelectorAll('#vet-filter-pills .pill').forEach(p=>p.classList.remove('active')); el.classList.add('active'); renderVetDirectory(); }
function filterVets(){ renderVetDirectory(); }
function renderVetDirectory(){
  const search=(document.getElementById('vet-search')||{value:''}).value||'';
  let data=VET_DATA;
  if(vetTypeFilter!=='all') data=data.filter(v=>v.tags.includes(vetTypeFilter));
  if(search) data=data.filter(v=>(v.name+v.desc).toLowerCase().includes(search.toLowerCase()));
  $('vet-directory').innerHTML=data.map(v=>`
    <div class="vet-card" onclick="openVetModal(${v.id})">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:1.8rem">${v.icon}</span>
        <div>
          <h4>${v.name}</h4>
          <div>
            <span class="vet-tag">${v.type==='govt'?'Government':v.tags.includes('24h')?'24-Hour':'Private'}</span>
            ${isOpenNow(v.hours)?'<span class="open-now">Open Now</span>':'<span class="closed-now">Closed</span>'}
          </div>
        </div>
      </div>
      <div class="vet-meta">
        <span>📍 ${v.dist} away — ${v.city}</span>
        <span>🕐 ${v.hours}</span>
        <span>⭐ ${v.rating}/5</span>
        <span>📞 ${v.phone}</span>
      </div>
      <div style="font-size:0.82rem;color:var(--gray);margin-bottom:0.75rem">${v.desc}</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-animal btn-sm" onclick="event.stopPropagation();openVetModal(${v.id})">📅 Book</button>
        <a href="tel:${v.phone}" class="btn btn-success btn-sm" onclick="event.stopPropagation()" style="text-decoration:none">📞 Call</a>
      </div>
    </div>`).join('');
}
function openVetModal(id){
  const v=VET_DATA.find(x=>x.id===id);
  if(!v) return;
  $('vet-modal-title').textContent='Book at '+v.name;
  $('vet-modal-sub').textContent=v.city+' | '+v.hours+' | '+v.phone;
  openModal('vet-modal');
}
let currentVetName='';
function confirmVetBooking(){
  const name=gv('vm-name'),phone=gv('vm-phone');
  if(!name||!phone){ showNotif('⚠️ Enter name and phone.','#E67E22'); return; }
  addToStore('vet_appts',{id:Date.now(),owner:name,phone,petname:'',animal:gv('vm-pet'),type:gv('vm-reason'),hospital:$('vet-modal-title').textContent.replace('Book at ',''),date:gv('vm-date'),time:gv('vm-time'),symptoms:'',status:'Confirmed',ts:Date.now()});
  closeModal('vet-modal');
  loadVetAppts();
  showNotif('✅ Appointment booked! Confirmation sent to '+phone,'#0D7A55');
}
function loadVetAppts(){
  const data=getStore('vet_appts');
  const el=$('vet-appts');
  if(!data.length){ el.innerHTML='<div class="empty-state"><div class="es-icon">📅</div><p>No appointments yet.</p></div>'; return; }
  el.innerHTML=data.map(a=>`
    <div class="listing-card">
      <div class="lc-badge ${a.status==='Cancelled'?'badge-emergency':'badge-open'}">${a.status}</div>
      <div class="lc-content">
        <div class="lc-title">${a.owner}${a.petname?' ('+a.petname+')':''} — ${a.type}</div>
        <div class="lc-meta"><span>🏥 ${a.hospital}</span><span>🐾 ${a.animal}</span>${a.date?`<span>📅 ${a.date}</span>`:''}<span>⏰ ${a.time}</span><span>📞 ${a.phone}</span></div>
      </div>
      <div class="lc-actions">
        <button class="btn btn-danger btn-sm" onclick="cancelAppt(${a.id})">✕ Cancel</button>
        <button class="btn btn-danger btn-sm" onclick="delAppt(${a.id})">🗑</button>
      </div>
    </div>`).join('');
}
function cancelAppt(id){ const d=getStore('vet_appts'); const i=d.findIndex(a=>a.id===id); if(i>-1){d[i].status='Cancelled';setStore('vet_appts',d);loadVetAppts();showNotif('Appointment cancelled.','#C0392B');} }
function delAppt(id){ setStore('vet_appts',getStore('vet_appts').filter(a=>a.id!==id)); loadVetAppts(); }

// ===== PETS FOR ADOPTION =====
const PETS=[
  {id:1,name:'Bruno',species:'dog',breed:'Labrador Mix',age:'2 yrs',gender:'Male',icon:'🐕',bg:'#FFF8E1',vaccinated:true,neutered:true,desc:'Friendly, playful and great with children. Loves fetch and cuddles. House-trained.',status:'Available'},
  {id:2,name:'Luna',species:'cat',breed:'Domestic Shorthair',age:'1 yr',gender:'Female',icon:'🐱',bg:'#F3E5F5',vaccinated:true,neutered:true,desc:'Calm, affectionate and loves to be petted. Gets along well with other cats.',status:'Available'},
  {id:3,name:'Mango',species:'bird',breed:'Indian Ringneck',age:'3 yrs',gender:'Male',icon:'🦜',bg:'#E1F5FE',vaccinated:false,neutered:false,desc:'Talks a few words, very active and social. Needs an attentive owner.',status:'Available'},
  {id:4,name:'Fluffy',species:'other',breed:'Dutch Rabbit',age:'1 yr',gender:'Female',icon:'🐰',bg:'#F1F8E9',vaccinated:true,neutered:true,desc:'Gentle, quiet and easy to care for. Perfect for families with children.',status:'Available'},
  {id:5,name:'Rocky',species:'dog',breed:'Street Dog Mix',age:'4 yrs',gender:'Male',icon:'🐶',bg:'#FFF3E0',vaccinated:true,neutered:true,desc:'Loyal, gentle giant. Very calm indoors. Has been in foster for 6 months, fully trained.',status:'Available'},
  {id:6,name:'Shadow',species:'cat',breed:'Black Shorthair',age:'2 yrs',gender:'Male',icon:'😺',bg:'#ECEFF1',vaccinated:true,neutered:true,desc:'Independent but affectionate. Perfect apartment cat. Gets along with calm dogs.',status:'Available'},
  {id:7,name:'Daisy',species:'dog',breed:'Beagle Mix',age:'1 yr',gender:'Female',icon:'🐕‍🦺',bg:'#FBE9E7',vaccinated:true,neutered:false,desc:'Energetic, curious and loves walks. Great for active families.',status:'Pending'},
  {id:8,name:'Tweety',species:'bird',breed:'Budgerigar',age:'6 months',gender:'Female',icon:'🐦',bg:'#E8F5E9',vaccinated:false,neutered:false,desc:'Sweet, social and chirpy. Easy to care for, good first bird.',status:'Available'},
];
let petFilter='all';
function setPetFilter(f,el){ petFilter=f; document.querySelectorAll('#panel-adopt .pill').forEach(p=>p.classList.remove('active')); el.classList.add('active'); renderPets(); }
function renderPets(){
  let data=PETS;
  if(petFilter!=='all') data=data.filter(p=>p.species===petFilter);
  $('pet-grid-container').innerHTML=data.map(p=>`
    <div class="pet-card" onclick="showPetDetail(${p.id})">
      <div class="pet-img" style="background:${p.bg}">${p.icon}</div>
      <div class="pet-body">
        <div class="pet-name">${p.name}</div>
        <div class="pet-breed">${p.breed} • ${p.age} • ${p.gender}</div>
        <div class="pet-tags">
          ${p.vaccinated?'<span class="pet-tag ptag-vac">✓ Vaccinated</span>':''}
          ${p.neutered?'<span class="pet-tag ptag-neut">✓ Neutered</span>':''}
          <span class="pet-tag ${p.status==='Available'?'ptag-avail':'ptag-pend'}">${p.status}</span>
        </div>
        <button class="btn btn-animal btn-sm" style="width:100%;justify-content:center" onclick="event.stopPropagation();adoptPet(${JSON.stringify(p.name)})">${p.status==='Available'?'❤️ Adopt':'⏳ Pending'}</button>
      </div>
    </div>`).join('');
}
function showPetDetail(id){
  const p=PETS.find(x=>x.id===id);
  if(!p) return;
  $('pet-modal-name').textContent=p.name+' '+p.icon;
  $('pet-modal-body').innerHTML=`
    <div style="text-align:center;font-size:5rem;margin-bottom:1rem;background:${p.bg};padding:1.5rem;border-radius:12px">${p.icon}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1rem;font-size:0.88rem">
      <div><strong>Breed:</strong> ${p.breed}</div>
      <div><strong>Age:</strong> ${p.age}</div>
      <div><strong>Gender:</strong> ${p.gender}</div>
      <div><strong>Status:</strong> ${p.status}</div>
      <div><strong>Vaccinated:</strong> ${p.vaccinated?'Yes ✓':'No'}</div>
      <div><strong>Neutered:</strong> ${p.neutered?'Yes ✓':'No'}</div>
    </div>
    <p style="color:var(--gray);font-size:0.9rem;line-height:1.7;margin-bottom:1.2rem">${p.desc}</p>
    <button class="btn btn-animal" style="width:100%;justify-content:center" onclick="adoptPet(${JSON.stringify(p.name)});closeModal('pet-modal')">❤️ Apply to Adopt ${p.name}</button>`;
  openModal('pet-modal');
}
function adoptPet(name){
  document.getElementById('ad-specific').value=name;
  const adoptTab = document.querySelector('[onclick*="showTab(\\'adopt\\')"]') || document.querySelectorAll('.tab')[2];
  if (adoptTab) adoptTab.click();
  document.getElementById('adopt-form').scrollIntoView({behavior:'smooth',block:'start'});
  showNotif('❤️ Great choice! Scroll down to complete your adoption application for '+name+'.','#0D7A55');
}
function submitAdopt(e){
  e.preventDefault();
  const name=gv('ad-name'),phone=gv('ad-phone'),email=gv('ad-email'),city=gv('ad-city'),why=gv('ad-why'),home=gv('ad-home');
  if(!name||!phone||!email||!city||!why||!home){ showNotif('⚠️ Fill all required fields.','#E67E22'); return; }
  addToStore('adopt_apps',{id:Date.now(),name,phone,email,city,animal:gv('ad-animal'),specific:gv('ad-specific'),home,otherpets:gv('ad-otherpets'),exp:gv('ad-exp'),time:gv('ad-time'),why,status:'Under Review',ts:Date.now()});
  document.getElementById('adopt-form').reset();
  loadAdoptApps();
  showNotif('✅ Application submitted! Our adoption team will contact you within 48 hours for a home assessment.','#0D7A55');
}
function loadAdoptApps(){
  const data=getStore('adopt_apps');
  const el=$('adopt-apps');
  if(!data.length){ el.innerHTML='<div class="empty-state"><div class="es-icon">❤️</div><p>No applications yet.</p></div>'; return; }
  el.innerHTML=data.map(a=>`
    <div class="listing-card">
      <div class="lc-badge ${a.status==='Approved'?'badge-resolved':a.status==='Rejected'?'badge-emergency':'badge-active'}">${a.status}</div>
      <div class="lc-content">
        <div class="lc-title">${a.name} — ${a.specific||a.animal}</div>
        <div class="lc-meta"><span>📞 ${a.phone}</span><span>📧 ${a.email}</span><span>📍 ${a.city}</span><span>🏠 ${a.home}</span><span>🕐 ${fmtTime(a.ts)}</span></div>
        <div style="font-size:0.82rem;color:var(--gray);margin-top:5px">"${a.why.substring(0,100)}${a.why.length>100?'…':''}"</div>
      </div>
      <div class="lc-actions">
        ${a.status==='Under Review'?`<button class="btn btn-success btn-sm" onclick="updateAdopt(${a.id},'Approved')">✓ Approve</button><button class="btn btn-danger btn-sm" onclick="updateAdopt(${a.id},'Rejected')">✗ Reject</button>`:''}
        <button class="btn btn-danger btn-sm" onclick="delAdopt(${a.id})">🗑</button>
      </div>
    </div>`).join('');
}
function updateAdopt(id,status){ const d=getStore('adopt_apps'); const i=d.findIndex(a=>a.id===id); if(i>-1){d[i].status=status;setStore('adopt_apps',d);loadAdoptApps();showNotif('✅ Application '+status,'#0D7A55');} }
function delAdopt(id){ setStore('adopt_apps',getStore('adopt_apps').filter(a=>a.id!==id)); loadAdoptApps(); }

// ===== LOST PETS =====
let lpFilter='all';
function seedLostPets(){
  if(getStore('lostpets').length) return;
  const seeds=[
    {id:1,type:'lost',name:'Kapil Dev',phone:'9876543211',animal:'Dog',petname:'Tommy',color:'Golden brown, no collar',loc:'Lalpur, Ranchi',details:'Missing since morning, friendly, responds to Tommy',status:'Open',ts:Date.now()-7200000},
    {id:2,type:'found',name:'Sunita Rao',phone:'9876543212',animal:'Cat',petname:'',color:'White with orange patches',loc:'Harmu, Ranchi',details:'Found near road, seems domestic, not injured',status:'Open',ts:Date.now()-3600000},
  ];
  setStore('lostpets',seeds);
}
function submitLostPet(e){
  e.preventDefault();
  const type=gv('lp-type'),name=gv('lp-name'),phone=gv('lp-phone'),animal=gv('lp-animal'),loc=gv('lp-loc'),color=gv('lp-color');
  if(!type||!name||!phone||!animal||!loc||!color){ showNotif('⚠️ Fill all required fields.','#E67E22'); return; }
  addToStore('lostpets',{id:Date.now(),type,name,phone,animal,petname:gv('lp-petname'),color,loc,date:gv('lp-date'),details:gv('lp-details'),status:'Open',ts:Date.now()});
  document.getElementById('lp-form').reset();
  loadLostPets();
  showNotif('✅ Report submitted! Shared with local pet community.','#0D7A55');
}
function loadLostPets(){
  seedLostPets();
  let data=getStore('lostpets');
  if(lpFilter!=='all') data=data.filter(r=>r.type===lpFilter);
  const el=$('lostpet-list');
  if(!data.length){ el.innerHTML='<div class="empty-state"><div class="es-icon">🔍</div><p>No reports yet.</p></div>'; return; }
  el.innerHTML=data.map(r=>`
    <div class="listing-card">
      <div>
        <div class="lc-badge ${r.type==='lost'?'badge-emergency':'badge-open'}">${r.type==='lost'?'LOST':'FOUND'}</div>
        <div class="lc-badge ${r.status==='Resolved'?'badge-resolved':'badge-active'}" style="margin-top:4px">${r.status}</div>
      </div>
      <div class="lc-content">
        <div class="lc-title">${r.animal}${r.petname?' "'+r.petname+'"':''} — ${r.color}</div>
        <div class="lc-meta"><span>📍 ${r.loc}</span><span>👤 ${r.name}</span><span>📞 ${r.phone}</span>${r.date?`<span>📅 ${r.date}</span>`:''}<span>🕐 ${fmtTime(r.ts)}</span></div>
        ${r.details?`<div style="font-size:0.82rem;color:var(--gray);margin-top:5px">${r.details}</div>`:''}
      </div>
      <div class="lc-actions">
        ${r.status!=='Resolved'?`<button class="btn btn-success btn-sm" onclick="resolveLostPet(${r.id})">✓ Reunited!</button>`:''}
        <button class="btn btn-animal btn-sm" onclick="showNotif('📞 Connecting to '+${JSON.stringify(r.name)}+' at ${r.phone}','#0D7A55')">📞 Contact</button>
        <button class="btn btn-danger btn-sm" onclick="delLostPet(${r.id})">🗑</button>
      </div>
    </div>`).join('');
}
function resolveLostPet(id){ const d=getStore('lostpets'); const i=d.findIndex(r=>r.id===id); if(i>-1){d[i].status='Resolved';setStore('lostpets',d);loadLostPets();showNotif('🎉 Wonderful! Pet reunited with family!','#0D7A55');} }
function delLostPet(id){ setStore('lostpets',getStore('lostpets').filter(r=>r.id!==id)); loadLostPets(); }
function setLPFilter(f,el){ lpFilter=f; document.querySelectorAll('#panel-lostpet .pill').forEach(p=>p.classList.remove('active')); el.classList.add('active'); loadLostPets(); }

// ===== SHELTERS =====
const SHELTER_DATA=[
  {name:'Paws & Care Animal Shelter',icon:'🐾',city:'Ranchi',animals:34,capacity:60,phone:'0651-771111',desc:'Full-service shelter for dogs and cats. Daily medical rounds, socialization programs.',services:['Dog boarding','Cat care','Medical treatment','Adoption events']},
  {name:'Happy Tails Sanctuary',icon:'🏡',city:'Ranchi',animals:52,capacity:80,phone:'0651-772222',desc:'Largest animal sanctuary in Jharkhand. Rescues all species including cattle.',services:['All animals','24h emergency','Veterinary care','Volunteer programs']},
  {name:'Maitri Pashu Sewa Kendra',icon:'🌿',city:'Ranchi',animals:28,capacity:50,phone:'0651-773333',desc:'NGO-run shelter focusing on injured and sick strays. Free treatment for all.',services:['Stray rescue','Medical care','Neutering','Food donation drive']},
];
function renderShelters(){
  $('shelter-directory').innerHTML=SHELTER_DATA.map(s=>`
    <div class="vet-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:2rem">${s.icon}</span>
        <div><h4>${s.name}</h4><span class="vet-tag">Animal Shelter</span></div>
      </div>
      <div class="vet-meta">
        <span>📍 ${s.city}</span>
        <span>🐾 ${s.animals}/${s.capacity} animals</span>
        <span>📞 ${s.phone}</span>
      </div>
      <p style="font-size:0.82rem;color:var(--gray);margin-bottom:0.75rem">${s.desc}</p>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:0.75rem">
        ${s.services.map(sv=>'<span style="font-size:0.72rem;background:var(--Ap);color:var(--A);padding:2px 8px;border-radius:50px;font-weight:600">'+sv+'</span>').join('')}
      </div>
      <div style="display:flex;gap:8px">
        <a href="tel:${s.phone}" class="btn btn-animal btn-sm" style="text-decoration:none">📞 Call</a>
        <button class="btn btn-success btn-sm" onclick="showNotif('✅ Volunteering at ${s.name} registered!','#0D7A55')">🙋 Volunteer</button>
      </div>
    </div>`).join('');
}
function submitShelterHelp(e){
  e.preventDefault();
  const name=gv('sh-name'),phone=gv('sh-phone'),type=gv('sh-type'),city=gv('sh-city');
  if(!name||!phone||!type||!city){ showNotif('⚠️ Fill required fields.','#E67E22'); return; }
  document.getElementById('shelter-form').reset();
  showNotif('✅ Thank you '+name+'! The shelter team will contact you at '+phone+' within 24 hours.','#0D7A55');
}

// ===== INIT =====
window.onload=()=>{
  loadRescue();
  if(location.hash==='#adopt'){
    const btn=document.querySelector('[onclick*="showTab(\'adopt\'"]');
    if(btn) btn.click();
  }
};
