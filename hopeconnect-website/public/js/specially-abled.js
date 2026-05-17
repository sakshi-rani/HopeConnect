const $ = id => document.getElementById(id);

function showNotif(msg, color){
  const n = $('notif');
  n.innerHTML = msg;
  n.style.borderLeftColor = color || 'var(--gold)';
  n.classList.add('show');
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.remove('show'), 4500);
}

function getStore(key){ try{ return JSON.parse(localStorage.getItem('hc_sa_'+key)||'[]'); } catch(e){return [];} }
function setStore(key, data){ localStorage.setItem('hc_sa_'+key, JSON.stringify(data)); }
function addToStore(key, item){ const d=getStore(key); d.unshift(item); setStore(key, d); }

function fmtTime(ts){
  const d=new Date(ts), now=new Date(), diff=(now-d)/1000;
  if(diff<60) return 'just now';
  if(diff<3600) return Math.floor(diff/60)+' min ago';
  if(diff<86400) return Math.floor(diff/3600)+' hr ago';
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
}

// field map per category
const FIELDS = {
  blind:   {name:'bl-name', phone:'bl-phone', support:'bl-support', city:'bl-city', urgency:'bl-urgency', level:'bl-level', details:'bl-details'},
  deaf:    {name:'df-name', phone:'df-phone', support:'df-support', city:'df-city', urgency:'df-urgency', level:'df-level', details:'df-details'},
  mute:    {name:'mt-name', phone:'mt-phone', support:'mt-support', city:'mt-city', urgency:'mt-urgency', level:'mt-level', details:'mt-details'},
  handicap:{name:'hc-name', phone:'hc-phone', support:'hc-support', city:'hc-city', urgency:'hc-urgency', level:'hc-level', details:'hc-details'},
};

function showSection(name, btn){
  document.querySelectorAll('.sa-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sa-card').forEach(c => c.classList.remove('active'));
  $('panel-'+name).classList.add('active');
  btn.classList.add('active');
  loadSA(name);
  setTimeout(() => {
    $('panel-'+name).scrollIntoView({behavior:'smooth', block:'start'});
  }, 60);
}

function submitSA(e, type){
  e.preventDefault();
  const f = FIELDS[type];
  const name = ($(f.name)||{}).value||'';
  const phone = ($(f.phone)||{}).value||'';
  const city = ($(f.city)||{}).value||'';
  if(!name||!phone||!city){ showNotif('⚠️ Please fill all required fields.','#E67E22'); return; }
  addToStore(type, {
    id: Date.now(), name, phone, city,
    support: ($(f.support)||{}).value||'',
    urgency: ($(f.urgency)||{}).value||'',
    level:   ($(f.level)||{}).value||'',
    details: ($(f.details)||{}).value||'',
    status: 'Pending', ts: Date.now()
  });
  $(type+'-form').reset();
  loadSA(type);
  showNotif('✅ Request submitted! A volunteer will call <strong>'+phone+'</strong> within 2 hours.','#0D7A55');
}

function loadSA(type){
  const data = getStore(type);
  const list = $(type+'-list');
  if(!list) return;
  if(!data.length){
    list.innerHTML='<div class="empty-state"><div class="es-icon">📋</div><p>No requests yet.</p></div>';
    return;
  }
  list.innerHTML = data.map(r=>`
    <div class="listing-card">
      <div class="lc-badge badge-${r.status==='Resolved'?'resolved':'pending'}">${r.status}</div>
      <div class="lc-content">
        <div class="lc-title">${r.name} — ${r.support}</div>
        <div class="lc-meta">
          <span>📞 ${r.phone}</span><span>📍 ${r.city}</span><span>⏰ ${r.urgency}</span><span>🕐 ${fmtTime(r.ts)}</span>
        </div>
        ${r.details?`<div style="font-size:0.82rem;color:var(--gray);margin-top:5px">${r.details}</div>`:''}
      </div>
      <div class="lc-actions">
        ${r.status==='Pending'?`<button class="btn btn-success btn-sm" onclick="markSA('${type}',${r.id},'Resolved')">✓ Resolved</button>`:''}
        <button class="btn btn-danger btn-sm" onclick="deleteSA('${type}',${r.id})">🗑</button>
      </div>
    </div>`).join('');
}

function markSA(type, id, status){
  const data=getStore(type);
  const idx=data.findIndex(r=>r.id===id);
  if(idx>-1){ data[idx].status=status; setStore(type,data); loadSA(type); }
  showNotif('✅ Status updated to: '+status,'#0D7A55');
}

function deleteSA(type, id){
  if(!confirm('Remove this entry?')) return;
  setStore(type, getStore(type).filter(r=>r.id!==id));
  loadSA(type);
  showNotif('🗑 Entry removed.','#C0392B');
}

// NAV
function toggleMenu(){
  $('hamburger').classList.toggle('open');
  $('mobile-menu').classList.toggle('open');
}
function closeMenu(){
  $('hamburger').classList.remove('open');
  $('mobile-menu').classList.remove('open');
}
document.addEventListener('click', e => {
  const m=$('mobile-menu'), h=$('hamburger');
  if(m && m.classList.contains('open') && !m.contains(e.target) && !h.contains(e.target)) closeMenu();
});

function filterCards(val){
  const v = val.toLowerCase();
  document.querySelectorAll('.sa-card').forEach(c => {
    const match = (c.dataset.name||'').includes(v)
      || (c.querySelector('.sa-card-label')||{}).textContent.toLowerCase().includes(v)
      || (c.querySelector('.sa-card-desc')||{}).textContent.toLowerCase().includes(v);
    c.style.opacity = match||!v ? '1' : '0.3';
    c.style.transform = match||!v ? '' : 'scale(0.95)';
  });
}
