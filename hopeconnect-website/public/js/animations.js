
// ===== HOPECONNECT CINEMATIC ANIMATIONS =====
// Soft atmospheric emoji motion — calm, editorial, emotional

(function() {

  // ── Utility ──────────────────────────────────────────────
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max)); }

  function makeParticle(emoji, classes, styles) {
    const el = document.createElement('span');
    el.textContent = emoji;
    el.className = 'cin-particle ' + classes;
    Object.assign(el.style, styles);
    return el;
  }

  // ── 1. Hero Sparkles ✨ ───────────────────────────────────
  function initHeroSparkles() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const count = 10;
    for (let i = 0; i < count; i++) {
      const el = makeParticle('✨', 'cin-sparkle', {
        left: rand(5, 95) + '%',
        top: rand(10, 85) + '%',
        '--dur': rand(10, 18) + 's',
        '--delay': rand(0, 10) + 's',
        '--op': rand(0.1, 0.2),
        '--dx': rand(-20, 20) + 'px',
        '--dx2': rand(-30, 30) + 'px',
        position: 'absolute',
      });
      hero.appendChild(el);
    }
  }

  // ── 2. Hero Drifting Leaves 🍂 ────────────────────────────
  function initHeroLeaves() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const count = 6;
    for (let i = 0; i < count; i++) {
      const el = makeParticle('🍂', 'cin-leaf', {
        left: rand(0, 100) + '%',
        top: '-30px',
        '--dur': rand(16, 24) + 's',
        '--delay': rand(0, 16) + 's',
        '--op': rand(0.08, 0.14),
        '--dx': rand(20, 60) + 'px',
        '--dx2': rand(40, 100) + 'px',
        position: 'absolute',
      });
      hero.appendChild(el);
    }
  }

  // ── 3. Hero Heart Pulse ❤️ ────────────────────────────────
  function initHeroHearts() {
    const btns = document.querySelector('.hero-btns');
    if (!btns) return;

    btns.style.position = 'relative';
    for (let i = 0; i < 2; i++) {
      const el = makeParticle('❤️', 'cin-heart', {
        position: 'absolute',
        left: (i === 0 ? '20%' : '60%'),
        top: '50%',
        transform: 'translate(-50%,-50%)',
        '--dur': rand(4, 6) + 's',
        '--delay': rand(0, 3) + 's',
        '--op': 0.07,
        zIndex: '0',
      });
      btns.appendChild(el);
    }
  }

  // ── 4. Scroll-triggered Paw Trails 🐾 ────────────────────
  function initPawTrails() {
    const section = document.getElementById('choose');
    if (!section) return;

    const animalCard = section.querySelector('.bc-animal');
    if (!animalCard) return;

    let spawned = false;

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !spawned) {
        spawned = true;
        spawnPawTrail(section);
      }
    }, { threshold: 0.2 });

    obs.observe(section);
  }

  function spawnPawTrail(container) {
    const positions = [
      { left: '72%', top: '15%', rot: '-10deg' },
      { left: '74%', top: '28%', rot: '5deg' },
      { left: '71%', top: '41%', rot: '-8deg' },
      { left: '73%', top: '54%', rot: '10deg' },
      { left: '70%', top: '67%', rot: '-5deg' },
    ];

    positions.forEach((pos, i) => {
      setTimeout(() => {
        const el = makeParticle('🐾', 'cin-paw', {
          position: 'absolute',
          left: pos.left,
          top: pos.top,
          '--dur': '3s',
          '--delay': '0s',
          '--op': rand(0.12, 0.18),
          '--rot': pos.rot,
          zIndex: '1',
        });
        container.style.position = 'relative';
        container.appendChild(el);
        setTimeout(() => el.remove(), 3500);
      }, i * 400);
    });

    // Repeat every 12s
    setTimeout(() => { spawned = false; }, 12000);
    setTimeout(() => initPawTrails(), 12000);
  }

  // ── 5. Scroll-triggered Footprint Trails 👣 ──────────────
  function initFootprintTrails() {
    const about = document.getElementById('about');
    if (!about) return;

    let spawned = false;

    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !spawned) {
        spawned = true;
        spawnFootTrail(about);
      }
    }, { threshold: 0.2 });

    obs.observe(about);
  }

  function spawnFootTrail(container) {
    const positions = [
      { left: '8%',  top: '20%', rot: '15deg' },
      { left: '10%', top: '35%', rot: '-10deg' },
      { left: '7%',  top: '50%', rot: '12deg' },
      { left: '9%',  top: '65%', rot: '-8deg' },
      { left: '6%',  top: '78%', rot: '10deg' },
    ];

    positions.forEach((pos, i) => {
      setTimeout(() => {
        const el = makeParticle('👣', 'cin-footprint', {
          position: 'absolute',
          left: pos.left,
          top: pos.top,
          '--dur': '3.5s',
          '--delay': '0s',
          '--op': rand(0.1, 0.16),
          '--rot': pos.rot,
          zIndex: '1',
        });
        container.style.position = 'relative';
        container.appendChild(el);
        setTimeout(() => el.remove(), 4000);
      }, i * 500);
    });

    setTimeout(() => { spawned = false; }, 14000);
    setTimeout(() => initFootprintTrails(), 14000);
  }

  // ── 6. Volunteer Section Sparkles ✨ ─────────────────────
  function initVolunteerSparkles() {
    const vol = document.getElementById('volunteer');
    if (!vol) return;

    vol.style.position = 'relative';
    for (let i = 0; i < 6; i++) {
      const el = makeParticle('✨', 'cin-sparkle', {
        position: 'absolute',
        left: rand(10, 90) + '%',
        top: rand(10, 80) + '%',
        '--dur': rand(8, 14) + 's',
        '--delay': rand(0, 8) + 's',
        '--op': rand(0.08, 0.15),
        '--dx': rand(-15, 15) + 'px',
        '--dx2': rand(-20, 20) + 'px',
        zIndex: '0',
      });
      vol.appendChild(el);
    }
  }

  // ── 7. Card Hover Light Sweep ─────────────────────────────
  function initCardSweep() {
    const style = document.createElement('style');
    style.textContent = `
      .big-card::after {
        content: '';
        position: absolute;
        top: 0; left: -100%;
        width: 60%; height: 100%;
        background: linear-gradient(
          105deg,
          transparent 40%,
          rgba(246,241,232,0.03) 50%,
          transparent 60%
        );
        transition: left 0.9s ease;
        pointer-events: none;
        z-index: 2;
      }
      .big-card:hover::after { left: 150%; }
    `;
    document.head.appendChild(style);
  }

  // ── 8. Breathing Background ──────────────────────────────
  function initBreathingBg() {
    const style = document.createElement('style');
    style.textContent = `
      #hero .hero-orb-1 { animation: orbFloat 16s ease-in-out infinite, breathe 8s ease-in-out infinite; }
      #hero .hero-orb-2 { animation: orbFloat 20s ease-in-out infinite, breathe 10s 2s ease-in-out infinite; }
      #hero .hero-orb-3 { animation: orbFloat 14s ease-in-out infinite, breathe 12s 4s ease-in-out infinite; }
      @keyframes breathe {
        0%,100% { opacity: 0.9; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Init All ─────────────────────────────────────────────
  function init() {
    initHeroSparkles();
    initHeroLeaves();
    initHeroHearts();
    initPawTrails();
    initFootprintTrails();
    initVolunteerSparkles();
    initCardSweep();
    initBreathingBg();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
