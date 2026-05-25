
// ===== NOTIF =====
function showNotif(msg, color) {
  const n = document.getElementById('notif');
  n.innerHTML = msg;
  n.style.borderLeftColor = color || '#7B3B6F';
  n.classList.add('show');
  clearTimeout(n._t);
  n._t = setTimeout(() => n.classList.remove('show'), 4500);
}

// ===== VOLUNTEER =====
function registerVol() {
  const e = document.getElementById('vol-email');
  if (!e.value || !e.value.includes('@')) {
    showNotif('⚠️ Please enter a valid email address.', '#D66A6A');
    return;
  }
  showNotif('✦ Welcome. Confirmation sent to <strong>' + e.value + '</strong>', '#7B3B6F');
  e.value = '';
}

// ===== COUNTER ANIMATION =====
function animCount() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count, dur = 2200;
    let start = null;
    function step(t) {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const v = Math.floor(ease * target);
      el.textContent = target >= 1000
        ? (v / 1000).toFixed(1) + 'K+'
        : v + (target === 340 ? '+' : '');
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target >= 10000
        ? (target / 1000).toFixed(1) + 'K+'
        : target + (target === 340 ? '+' : '');
    }
    requestAnimationFrame(step);
  });
}

// ===== SCROLL REVEAL =====
function initReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(32px);
      transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1);
    }
    .reveal.visible { opacity: 1; transform: translateY(0); }
    .reveal-left {
      opacity: 0; transform: translateX(-32px);
      transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1);
    }
    .reveal-left.visible { opacity: 1; transform: translateX(0); }
    .reveal-right {
      opacity: 0; transform: translateX(32px);
      transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1);
    }
    .reveal-right.visible { opacity: 1; transform: translateX(0); }
    .reveal-scale {
      opacity: 0; transform: scale(0.96) translateY(16px);
      transition: opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1);
    }
    .reveal-scale.visible { opacity: 1; transform: scale(1) translateY(0); }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.choose-head, .stag, #volunteer h2, #volunteer p, .vol-row').forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.about-text').forEach(el => el.classList.add('reveal-left'));
  document.querySelectorAll('.about-img').forEach(el => el.classList.add('reveal-right'));
  document.querySelectorAll('.big-card').forEach((el, i) => {
    el.classList.add('reveal-scale');
    el.style.transitionDelay = (i * 0.1) + 's';
  });
  document.querySelectorAll('.anum').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.07) + 's';
  });
  document.querySelectorAll('.ht').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i * 0.05) + 's';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale')
    .forEach(el => obs.observe(el));
}

// ===== STATS COUNTER TRIGGER =====
const statsObs = new IntersectionObserver(e => {
  if (e[0].isIntersecting) { animCount(); statsObs.disconnect(); }
}, { threshold: 0.3 });

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ===== SUBTLE AMBIENT GLOW (replaces cursor glow) =====
function initAmbientGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;width:500px;height:500px;border-radius:50%;
    background:radial-gradient(circle,rgba(123,59,111,0.04),transparent 70%);
    pointer-events:none;z-index:0;
    transition:left 0.8s ease, top 0.8s ease;
    transform:translate(-50%,-50%);top:50%;left:50%;
  `;
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
}

// ===== INIT =====
window.onload = () => {
  initReveal();
  initAmbientGlow();
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObs.observe(heroStats);
};
