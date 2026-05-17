
function showNotif(msg,color){
  const n=document.getElementById('notif');
  n.innerHTML=msg;
  n.style.borderLeftColor=color||'var(--gold)';
  n.classList.add('show');
  clearTimeout(n._t);
  n._t=setTimeout(()=>n.classList.remove('show'),4500);
}
function registerVol(){
  const e=document.getElementById('vol-email');
  if(!e.value||!e.value.includes('@')){showNotif('⚠️ Please enter a valid email address.','#E67E22');return;}
  showNotif('🎉 Welcome! Volunteer confirmation sent to <strong>'+e.value+'</strong>. Check your inbox!','#0D7A55');
  e.value='';
}
// Counter animation
function animCount(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=+el.dataset.count,dur=1800;let start=null;
    function step(t){
      if(!start)start=t;
      const p=Math.min((t-start)/dur,1),ease=1-Math.pow(1-p,3);
      const v=Math.floor(ease*target);
      el.textContent=target>=1000?(v/1000).toFixed(1)+'K+':v+(target===340?'+':target===48?'':'');
      if(p<1)requestAnimationFrame(step);
      else el.textContent=target>=10000?(target/1000).toFixed(1)+'K+':target+(target===340?'+':target===48?'':'');
    }
    requestAnimationFrame(step);
  });
}
new IntersectionObserver(e=>{if(e[0].isIntersecting){animCount();e[0].target._obs.disconnect();}},{ threshold:0.5 }).observe(Object.assign(document.querySelector('.hero-stats'),{_obs:null,get _obs(){return this._observer},set _obs(v){this._observer=v}}));
const hso=new IntersectionObserver(e=>{if(e[0].isIntersecting){animCount();hso.disconnect();}},{threshold:0.5});
hso.observe(document.querySelector('.hero-stats'));
