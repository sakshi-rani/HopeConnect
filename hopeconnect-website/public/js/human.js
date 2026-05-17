
// ===== UTILITY =====
const $ = id => document.getElementById(id);
const getVal = id => ($(id)||{}).value || '';

function showNotif(msg, color){
  const n = $('notif');
  n.innerHTML = msg;
  n.style.borderLeftColor = color || 'var(--gold)';
  n.classList.add('show');
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.remove('show'), 4500);
}

function showTab(name, btn){
  document.querySelectorAll('.section-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-card').forEach(t => t.classList.remove('active'));
  $('panel-'+name).classList.add('active');
  btn.classList.add('active');
  window.scrollTo({top: document.querySelector('.tabs-grid-container').offsetTop - 68, behavior:'smooth'});
  if(name === 'lostfound') loadLF();
  if(name === 'ngo') { loadNGO(); renderNGODirectory(); }
  if(name === 'infoDesk') loadQueries();
  if(name === 'community') loadComm();
  if(name === 'homeless') loadHomeless();
  if(name === 'abled') loadAbled();
}

// ===== STORAGE =====
function getStore(key){ try{ return JSON.parse(localStorage.getItem('hc_'+key)||'[]'); } catch(e){return [];} }
function setStore(key, data){ localStorage.setItem('hc_'+key, JSON.stringify(data)); }
function addToStore(key, item){ const d=getStore(key); d.unshift(item); setStore(key, d); }

function fmtTime(ts){
  const d = new Date(ts), now = new Date();
  const diff = (now - d)/1000;
  if(diff < 60) return 'just now';
  if(diff < 3600) return Math.floor(diff/60) + ' min ago';
  if(diff < 86400) return Math.floor(diff/3600) + ' hr ago';
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
}

// ===== SPECIALLY ABLED =====
function submitAbled(e){
  e.preventDefault();
  const name=getVal('a-name'), phone=getVal('a-phone'), city=getVal('a-city');
  if(!name||!phone||!city){ showNotif('⚠️ Please fill all required fields.','#E67E22'); return; }
  const entry = {
    id: Date.now(), name, phone,
    type: getVal('a-type') || 'Not specified',
    support: getVal('a-support') || 'Not specified',
    city, urgency: getVal('a-urgency'),
    details: getVal('a-details'),
    status: 'Pending', ts: Date.now()
  };
  addToStore('abled', entry);
  $('abled-form').reset();
  loadAbled();
  showNotif('✅ Request submitted! A volunteer will call you at <strong>'+phone+'</strong> within 2 hours.','#0D7A55');
}

function loadAbled(){
  const data = getStore('abled');
  const list = $('abled-list');
  if(!data.length){ list.innerHTML = '<div class="empty-state"><div class="es-icon">♿</div><p>No requests yet. Submit a request above.</p></div>'; return; }
  list.innerHTML = data.map(r => `
    <div class="listing-card">
      <div class="lc-badge badge-${r.status==='Resolved'?'resolved':'pending'}">${r.status}</div>
      <div class="lc-content">
        <div class="lc-title">${r.name} — ${r.type}</div>
        <div class="lc-meta">
          <span>📞 ${r.phone}</span><span>📍 ${r.city}</span><span>🎯 ${r.support}</span><span>⏰ ${r.urgency}</span><span>🕐 ${fmtTime(r.ts)}</span>
        </div>
        ${r.details?`<div style="font-size:0.82rem;color:var(--gray);margin-top:6px">${r.details}</div>`:''}
      </div>
      <div class="lc-actions">
        ${r.status==='Pending'?`<button class="btn btn-success btn-sm" onclick="markStatus('abled',${r.id},'Resolved')">✓ Resolved</button>`:''}
        <button class="btn btn-danger btn-sm" onclick="deleteEntry('abled',${r.id})">🗑</button>
      </div>
    </div>`).join('');
}

// ===== HOMELESS =====
const SHELTERS = [
  {name:'Seva Sadan Night Shelter', dist:'0.8 km', beds:'42/60', phone:'0651-234567', area:'Ranchi'},
  {name:'Asha Niketan Homeless Home', dist:'1.5 km', beds:'28/40', phone:'0651-345678', area:'Ranchi'},
  {name:'Jan Kalyan Shelter', dist:'2.2 km', beds:'15/50', phone:'0651-456789', area:'Ranchi'},
];

function submitHomeless(e){
  e.preventDefault();
  const loc = getVal('h-location');
  if(!loc){ showNotif('⚠️ Please enter your current location.','#E67E22'); return; }
  const entry = {
    id: Date.now(), name: getVal('h-name')||'Anonymous',
    phone: getVal('h-phone')||'Not provided',
    location: loc, count: getVal('h-count'),
    need: getVal('h-need'), duration: getVal('h-duration'),
    details: getVal('h-details'), status:'Active', ts: Date.now()
  };
  addToStore('homeless', entry);
  $('homeless-form').reset();
  // show nearest shelters
  const hr = $('homeless-result');
  hr.innerHTML = `
    <div class="alert-banner alert-success">✅ We found <strong>${SHELTERS.length} shelters</strong> near your location. A volunteer will guide you!</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;margin-bottom:1.5rem">
      ${SHELTERS.map(s=>`
        <div style="background:#fff;border-radius:12px;border:1px solid var(--border);padding:1.2rem">
          <div style="font-weight:700;font-size:1rem;margin-bottom:4px">🏠 ${s.name}</div>
          <div style="font-size:0.82rem;color:var(--gray)">📍 ${s.dist} away — ${s.area}</div>
          <div style="font-size:0.82rem;color:var(--gray);margin:4px 0">🛏 Available beds: ${s.beds}</div>
          <a href="tel:${s.phone}" style="display:block;margin-top:0.75rem;padding:7px 16px;background:var(--Hp);color:var(--H);border-radius:50px;font-size:0.82rem;font-weight:600;text-align:center;text-decoration:none">📞 Call ${s.phone}</a>
        </div>`).join('')}
    </div>`;
  loadHomeless();
  showNotif('🏠 Nearest shelters found! Volunteer will guide you.','#0D7A55');
}

function loadHomeless(){
  const data = getStore('homeless');
  const list = $('homeless-list');
  if(!data.length){ list.innerHTML='<div class="empty-state"><div class="es-icon">🏠</div><p>No reports yet.</p></div>'; return; }
  list.innerHTML = data.map(r=>`
    <div class="listing-card">
      <div class="lc-badge badge-${r.status==='Resolved'?'resolved':'pending'}">${r.status}</div>
      <div class="lc-content">
        <div class="lc-title">${r.name} — ${r.need}</div>
        <div class="lc-meta"><span>📍 ${r.location}</span><span>👥 ${r.count}</span><span>📅 ${r.duration}</span><span>🕐 ${fmtTime(r.ts)}</span></div>
        ${r.details?`<div style="font-size:0.82rem;color:var(--gray);margin-top:5px">${r.details}</div>`:''}
      </div>
      <div class="lc-actions">
        ${r.status!=='Resolved'?`<button class="btn btn-success btn-sm" onclick="markStatus('homeless',${r.id},'Resolved')">✓ Resolved</button>`:''}
        <button class="btn btn-danger btn-sm" onclick="deleteEntry('homeless',${r.id})">🗑</button>
      </div>
    </div>`).join('');
}

// ===== LOST & FOUND =====
let lfFilter = 'all';

// Seed some default entries if empty
function seedLF(){
  if(getStore('lf').length) return;
  const seeds = [
    {id:1, type:'lost-person', name:'Ramesh Kumar', phone:'9876543210', desc:'Elderly man ~70 yrs, white kurta, confused', loc:'Railway Station, Platform 2', time:'', extra:'Has hearing problem', status:'Open', ts: Date.now()-7200000},
    {id:2, type:'found-object', name:'Priya Sharma', phone:'9876500001', desc:'Blue backpack with books and laptop', loc:'City Bus Stop #14, MG Road', time:'', extra:'Handed to security guard', status:'Open', ts: Date.now()-18000000},
    {id:3, type:'lost-person', name:'Sanjana Singh', phone:'9876511111', desc:'Girl, ~8 years, pink frock, speaks Hindi', loc:'Central Market', time:'', extra:'Answers to Riya', status:'Resolved', ts: Date.now()-3600000},
    {id:4, type:'found-object', name:'Arjun Mehta', phone:'9876522222', desc:'Aadhaar card — Suresh Kumar', loc:'Post Office, MG Road', time:'', extra:'', status:'Open', ts: Date.now()-86400000},
  ];
  setStore('lf', seeds);
}

function submitLF(e){
  e.preventDefault();
  const type=getVal('lf-type'), name=getVal('lf-name'), phone=getVal('lf-phone'), desc=getVal('lf-desc'), loc=getVal('lf-loc');
  if(!type||!name||!phone||!desc||!loc){ showNotif('⚠️ Fill all required fields.','#E67E22'); return; }
  addToStore('lf', {id:Date.now(), type, name, phone, desc, loc, time:getVal('lf-time'), extra:getVal('lf-extra'), status:'Open', ts:Date.now()});
  $('lf-form').reset();
  loadLF();
  showNotif('✅ Report submitted! Shared with volunteers & nearby community.','#0D7A55');
}

function loadLF(search=''){
  seedLF();
  let data = getStore('lf');
  if(lfFilter !== 'all') data = data.filter(r => r.type === lfFilter);
  if(search) data = data.filter(r => (r.desc+r.loc+r.name).toLowerCase().includes(search.toLowerCase()));
  const list = $('lf-list');
  if(!data.length){ list.innerHTML='<div class="empty-state"><div class="es-icon">🔍</div><p>No reports found.</p></div>'; return; }
  const labels = {'lost-person':'Lost Person','found-person':'Found Person','lost-object':'Lost Object','found-object':'Found Object'};
  const badgeMap = {'lost-person':'badge-lost','found-person':'badge-found','lost-object':'badge-lost','found-object':'badge-found'};
  list.innerHTML = data.map(r=>`
    <div class="listing-card">
      <div>
        <div class="lc-badge ${badgeMap[r.type]||'badge-open'}">${labels[r.type]||r.type}</div>
        <div class="lc-badge ${r.status==='Resolved'?'badge-resolved':'badge-open'}" style="margin-top:4px">${r.status}</div>
      </div>
      <div class="lc-content">
        <div class="lc-title">${r.desc}</div>
        <div class="lc-meta"><span>📍 ${r.loc}</span><span>👤 Reported by: ${r.name}</span><span>📞 ${r.phone}</span><span>🕐 ${fmtTime(r.ts)}</span></div>
        ${r.extra?`<div style="font-size:0.82rem;color:var(--gray);margin-top:5px">${r.extra}</div>`:''}
      </div>
      <div class="lc-actions">
        ${r.status!=='Resolved'?`<button class="btn btn-success btn-sm" onclick="markStatus('lf',${r.id},'Resolved')">✓ Mark Resolved</button>`:''}
        <button class="btn btn-human btn-sm" onclick="contactLF(${r.id})">📞 Contact</button>
        <button class="btn btn-danger btn-sm" onclick="deleteEntry('lf',${r.id})">🗑</button>
      </div>
    </div>`).join('');
}

function setLFFilter(f, el){ lfFilter=f; document.querySelectorAll('#lf-filters .pill').forEach(p=>p.classList.remove('active')); el.classList.add('active'); loadLF($('lf-search').value); }
function filterLF(){ loadLF($('lf-search').value); }
function contactLF(id){ const r=getStore('lf').find(x=>x.id===id); if(r) showNotif('📞 Contacting '+r.name+' at '+r.phone+'…','#1B4FBF'); }

// ===== NGO =====
const NGO_DATA = [
  {name:'Bal Seva Ashram', type:'orphanage', icon:'👶', desc:'Care and education for orphaned and abandoned children aged 2–18. Fully residential.', city:'Ranchi', phone:'0651-101010', beds:40, typeLabel:'Orphanage'},
  {name:'Vriddha Aashray', type:'oldage', icon:'👴', desc:'Home for elderly persons without family support. Medical care, meals and activities provided.', city:'Ranchi', phone:'0651-202020', beds:60, typeLabel:'Old Age Home'},
  {name:'Manas Sewa Kendra', type:'mental', icon:'🧠', desc:'Mental health rehabilitation centre. Counselling, therapy and medication management.', city:'Ranchi', phone:'0651-303030', beds:30, typeLabel:'Mental Health'},
  {name:'Pragati Punarvaas', type:'rehab', icon:'🌱', desc:'Rehabilitation centre for substance abuse recovery and reintegration into society.', city:'Ranchi', phone:'0651-404040', beds:25, typeLabel:'Rehab Centre'},
  {name:'Asha Jyoti NGO', type:'general', icon:'🌟', desc:'General welfare NGO providing food, clothing and emergency shelter for all categories.', city:'Ranchi', phone:'0651-505050', beds:80, typeLabel:'General NGO'},
  {name:'Nari Shakti Sewa', type:'general', icon:'👩', desc:'Support centre for abandoned, abused and vulnerable women with legal & medical assistance.', city:'Ranchi', phone:'0651-606060', beds:35, typeLabel:'Women\'s Shelter'},
  {name:'Divya Drishti', type:'orphanage', icon:'🏠', desc:'Care home for visually impaired children with Braille education and vocational training.', city:'Ranchi', phone:'0651-707070', beds:20, typeLabel:'Orphanage'},
  {name:'Swasthya Setu', type:'mental', icon:'💙', desc:'Community mental health outreach — free counselling, psychiatric support and crisis helpline.', city:'Ranchi', phone:'0651-808080', beds:0, typeLabel:'Mental Health'},
];
let ngoTypeFilter='all';
function submitNGO(e){
  e.preventDefault();
  const name=getVal('ng-name'),phone=getVal('ng-phone'),who=getVal('ng-who'),loc=getVal('ng-loc');
  if(!name||!phone||!who||!loc){ showNotif('⚠️ Fill all required fields.','#E67E22'); return; }
  addToStore('ngo_refs', {id:Date.now(),name,phone,who,inst:getVal('ng-inst'),loc,urgency:getVal('ng-urgency'),desc:getVal('ng-desc'),ts:Date.now()});
  $('ngo-form').reset();
  showNotif('✅ Referral submitted! Our team will coordinate within 1 hour.','#0D7A55');
}
function filterNGOType(t,el){ ngoTypeFilter=t; document.querySelectorAll('.filter-pills .pill').forEach(p=>p.classList.remove('active')); el.classList.add('active'); renderNGODirectory(); }
function filterNGOs(){ renderNGODirectory(); }
function renderNGODirectory(){
  const search = ($('ngo-search')||{}).value||'';
  let data = NGO_DATA;
  if(ngoTypeFilter!=='all') data=data.filter(n=>n.type===ngoTypeFilter);
  if(search) data=data.filter(n=>(n.name+n.desc+n.city).toLowerCase().includes(search.toLowerCase()));
  const colors = {orphanage:'background:#EEF3FF;color:#1B4FBF',oldage:'background:#FFF8EC;color:#854F0B',mental:'background:#F0EEFF;color:#4A27C2',rehab:'background:#EAF7F2;color:#0D7A55',general:'background:#FFF0EC;color:#993C1D'};
  $('ngo-directory').innerHTML = data.map(n=>`
    <div class="ngo-card">
      <span class="ngo-icon">${n.icon}</span>
      <div class="ngo-name">${n.name}</div>
      <span class="ngo-type" style="${colors[n.type]||colors.general}">${n.typeLabel}</span>
      <div class="ngo-desc">${n.desc}</div>
      <div class="ngo-meta">
        <span>📍 ${n.city}</span>
        ${n.beds?`<span>🛏 Capacity: ${n.beds} beds</span>`:''}
        <span>📞 ${n.phone}</span>
      </div>
      <a href="tel:${n.phone}" class="btn btn-human btn-sm" style="text-decoration:none;display:block;text-align:center">📞 Call Now</a>
    </div>`).join('');
}
function loadNGO(){ renderNGODirectory(); }

// ===== QUERIES =====
function seedQueries(){
  if(getStore('queries').length) return;
  const seeds=[
    {id:1, name:'Mohan Verma', contact:'9812345678', cat:'Government Schemes', city:'Ranchi', question:'How do I apply for PM Awas Yojana housing scheme? What documents are needed?', status:'Answered', answer:'Visit your nearest Panchayat office or CSC centre with Aadhaar, income certificate, and ration card. Apply online at pmaymis.gov.in.', ts:Date.now()-172800000},
    {id:2, name:'Savita Devi', contact:'9876512345', cat:'Medical Help', city:'Ranchi', question:'Is there any free dialysis facility available in Ranchi for BPL families?', status:'Answered', answer:'RIMS Hospital Ranchi has free dialysis for BPL patients. Carry Aadhaar, BPL card, and doctor referral. Call 0651-2542100.', ts:Date.now()-86400000},
    {id:3, name:'Rajan Kumar', contact:'9765432100', cat:'Legal Aid', city:'Jharkhand', question:'My employer is not paying my wages for 2 months. Where do I complain?', status:'Open', answer:'', ts:Date.now()-3600000},
  ];
  setStore('queries', seeds);
}
function submitQuery(e){
  e.preventDefault();
  const name=getVal('q-name'),contact=getVal('q-contact'),question=getVal('q-question');
  if(!name||!contact||!question){ showNotif('⚠️ Fill required fields.','#E67E22'); return; }
  addToStore('queries',{id:Date.now(),name,contact,cat:getVal('q-cat'),city:getVal('q-city'),question,status:'Open',answer:'',ts:Date.now()});
  $('query-form').reset();
  loadQueries();
  showNotif('✅ Question posted! You\'ll get an answer within 24 hours.','#0D7A55');
}
function loadQueries(search=''){
  seedQueries();
  let data=getStore('queries');
  if(search) data=data.filter(q=>(q.question+q.cat+q.name).toLowerCase().includes(search.toLowerCase()));
  const list=$('query-list');
  if(!data.length){ list.innerHTML='<div class="empty-state"><div class="es-icon">ℹ️</div><p>No questions yet.</p></div>'; return; }
  list.innerHTML=data.map(q=>`
    <div class="query-card">
      <div class="qc-head">
        <div>
          <div class="qc-title">${q.question}</div>
          <div class="qc-meta"><span>📂 ${q.cat}</span><span>👤 ${q.name}</span>${q.city?`<span>📍 ${q.city}</span>`:''}<span>🕐 ${fmtTime(q.ts)}</span></div>
        </div>
        <div class="lc-badge ${q.status==='Answered'?'badge-resolved':'badge-pending'}">${q.status}</div>
      </div>
      ${q.answer?`<div class="qc-answer"><div class="qc-answer-label">Answer from Volunteer</div>${q.answer}</div>`:''}
      <div style="display:flex;gap:8px;margin-top:0.75rem;flex-wrap:wrap">
        ${q.status==='Open'?`<button class="btn btn-human btn-sm" onclick="answerQuery(${q.id})">✍️ Provide Answer</button>`:''}
        <button class="btn btn-danger btn-sm" onclick="deleteEntry('queries',${q.id})">🗑 Remove</button>
      </div>
    </div>`).join('');
}
function answerQuery(id){
  const ans=prompt('Enter your answer:');
  if(!ans) return;
  const data=getStore('queries');
  const idx=data.findIndex(q=>q.id===id);
  if(idx>-1){ data[idx].answer=ans; data[idx].status='Answered'; setStore('queries',data); loadQueries(); showNotif('✅ Answer posted!','#0D7A55'); }
}
function filterQueries(){ loadQueries($('q-search').value); }

// ===== COMMUNITY =====
let commFilter='all';
function submitComm(e){
  e.preventDefault();
  const name=getVal('cm-name'),phone=getVal('cm-phone'),area=getVal('cm-area'),details=getVal('cm-details');
  if(!name||!phone||!area||!details){ showNotif('⚠️ Fill all required fields.','#E67E22'); return; }
  addToStore('community',{id:Date.now(),intent:getVal('cm-intent'),name,phone,type:getVal('cm-type'),area,avail:getVal('cm-avail'),details,ts:Date.now()});
  $('comm-form').reset();
  loadComm();
  showNotif('✅ Posted to community board!','#0D7A55');
}
function seedComm(){
  if(getStore('community').length) return;
  const seeds=[
    {id:1,intent:'offer',name:'Anjali S.',phone:'9876500100',type:'Share food / groceries',area:'Lalpur, Ranchi',avail:'Daily evenings',details:'I cook extra food daily. Can provide home-cooked meals for 1-2 people in need near Lalpur area.',ts:Date.now()-7200000},
    {id:2,intent:'need',name:'Suresh M.',phone:'9876500200',type:'Give a ride / transport',area:'Doranda, Ranchi',avail:'',details:'Need a ride to RIMS hospital on Tuesday at 8 AM for my mother\'s dialysis. Will contribute for fuel.',ts:Date.now()-3600000},
    {id:3,intent:'offer',name:'Priya T.',phone:'9876500300',type:'Share skills (teaching, plumbing, etc.)',area:'Kanke, Ranchi',avail:'Weekends',details:'I am a teacher. Happy to give free coaching to underprivileged students for Class 8-10 Maths and Science.',ts:Date.now()-86400000},
  ];
  setStore('community',seeds);
}
function loadComm(){
  seedComm();
  let data=getStore('community');
  if(commFilter!=='all') data=data.filter(c=>c.intent===commFilter);
  const list=$('comm-list');
  if(!data.length){ list.innerHTML='<div class="empty-state"><div class="es-icon">🤲</div><p>No posts yet.</p></div>'; return; }
  const initials=n=>n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const colors=['#EEF3FF','#EAF7F2','#FFF8EC','#F0EEFF','#FFF0EC'];
  const textColors=['#1B4FBF','#0D7A55','#854F0B','#4A27C2','#993C1D'];
  list.innerHTML=data.map((c,i)=>`
    <div class="comm-card">
      <div class="cc-avatar" style="background:${colors[i%5]};color:${textColors[i%5]}">${initials(c.name)}</div>
      <div class="cc-info">
        <div class="cc-head">
          <span class="cc-name">${c.name}</span>
          <span class="cc-type ${c.intent==='offer'?'type-offer':'type-need'}">${c.intent==='offer'?'Offering Help':'Needs Help'}</span>
        </div>
        <div style="font-size:0.8rem;color:var(--gray);margin-bottom:6px">📂 ${c.type} • 📍 ${c.area}${c.avail?' • ⏰ '+c.avail:''}</div>
        <div class="cc-desc">${c.details}</div>
        <div class="cc-footer">
          <span>🕐 ${fmtTime(c.ts)}</span>
          <button class="btn btn-human btn-sm" onclick="showNotif('📞 Connecting you with '+${JSON.stringify(c.name)}+' at ${c.phone}…','#1B4FBF')">📞 Connect</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEntry('community',${c.id})">🗑</button>
        </div>
      </div>
    </div>`).join('');
}
function setCFilter(f,el){ commFilter=f; document.querySelectorAll('#panel-community .pill').forEach(p=>p.classList.remove('active')); el.classList.add('active'); loadComm(); }

// ===== SHARED =====
function markStatus(store, id, status){
  const data=getStore(store);
  const idx=data.findIndex(r=>r.id===id);
  if(idx>-1){ data[idx].status=status; setStore(store,data); }
  if(store==='abled') loadAbled();
  else if(store==='homeless') loadHomeless();
  else if(store==='lf') loadLF();
  showNotif('✅ Status updated to: '+status,'#0D7A55');
}
function deleteEntry(store, id){
  if(!confirm('Remove this entry?')) return;
  const data=getStore(store).filter(r=>r.id!==id);
  setStore(store,data);
  if(store==='abled') loadAbled();
  else if(store==='homeless') loadHomeless();
  else if(store==='lf') loadLF();
  else if(store==='queries') loadQueries();
  else if(store==='community') loadComm();
  showNotif('🗑 Entry removed.','#C0392B');
}

// ===== INIT =====
window.onload = () => {
  loadAbled();
  if(location.hash==='#lostfound'){
    const btn=document.querySelector('[onclick*="lostfound"]');
    if(btn) btn.click();
  }
};

// ===== NAV =====
function toggleMenu(){
  const h=$('hamburger'), m=$('mobile-menu');
  h.classList.toggle('open');
  m.classList.toggle('open');
}
function closeMenu(){
  $('hamburger').classList.remove('open');
  $('mobile-menu').classList.remove('open');
}
document.addEventListener('click', e => {
  const m=$('mobile-menu'), h=$('hamburger');
  if(m && m.classList.contains('open') && !m.contains(e.target) && !h.contains(e.target)) closeMenu();
});
function filterTabs(val){
  const v=val.toLowerCase();
  document.querySelectorAll('.tab-card').forEach(c=>{
    const match=(c.dataset.name||'').includes(v)||(c.querySelector('.tab-label')||{}).textContent.toLowerCase().includes(v)||(c.querySelector('.tab-desc')||{}).textContent.toLowerCase().includes(v);
    c.style.opacity=match||!v?'1':'0.3';
    c.style.transform=match||!v?'':'scale(0.95)';
  });
}
