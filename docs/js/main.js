/* ============================================================
   CharMinder — Pokémon Portfolio
   Main JavaScript — Scroll effects, particles, reveals
   ============================================================ */

(function () {
  'use strict';

  // --------------------------------------------------------
  // Fire Particle System
  // --------------------------------------------------------
  const canvas = document.getElementById('fire-particles');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let scrollRatio = 0; // 0 at top, 1 at bottom

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function createParticle() {
    // Intensity scales with scroll depth
    const intensity = 0.3 + scrollRatio * 0.7;
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(1.5 + Math.random() * 3) * intensity,
      size: 2 + Math.random() * 4 * intensity,
      life: 1,
      decay: 0.008 + Math.random() * 0.015,
      color: Math.random() < 0.5 ? 'fire-orange' : Math.random() < 0.5 ? 'fire-yellow' : 'fire-red',
    };
  }

  function getColor(name, alpha) {
    switch (name) {
      case 'fire-orange': return 'rgba(249,115,22,' + alpha + ')';
      case 'fire-yellow': return 'rgba(250,204,21,' + alpha + ')';
      case 'fire-red':    return 'rgba(239,68,68,' + alpha + ')';
      default:            return 'rgba(249,115,22,' + alpha + ')';
    }
  }

  function updateParticles() {
    // Spawn rate scales with scroll depth
    var spawnCount = Math.floor(1 + scrollRatio * 4);
    for (var i = 0; i < spawnCount; i++) {
      particles.push(createParticle());
    }

    for (var idx = particles.length - 1; idx >= 0; idx--) {
      var p = particles[idx];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(idx, 1);
      }
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life * 0.7;
      ctx.fillStyle = getColor(p.color, p.life);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function animateParticles() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --------------------------------------------------------
  // Scroll tracking
  // --------------------------------------------------------
  var sections = document.querySelectorAll('.section');
  var navDots = document.querySelectorAll('.nav-dot');
  var evoFlash1 = document.getElementById('evo-flash-1');
  var evoFlash2 = document.getElementById('evo-flash-2');
  var flash1Triggered = false;
  var flash2Triggered = false;

  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollRatio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    // Update side nav dots
    var currentSection = '';
    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.5) {
        currentSection = sec.id;
      }
    });

    var sectionOrder = ['charmander', 'charmeleon', 'charizard'];
    var currentIdx = sectionOrder.indexOf(currentSection);

    navDots.forEach(function (dot, i) {
      dot.classList.remove('active', 'filled');
      if (i < currentIdx) {
        dot.classList.add('filled');
      }
      if (i === currentIdx) {
        dot.classList.add('active', 'filled');
      }
    });

    // Evolution flashes
    checkEvoFlash(evoFlash1, function () { return !flash1Triggered; }, function () { flash1Triggered = true; });
    checkEvoFlash(evoFlash2, function () { return !flash2Triggered; }, function () { flash2Triggered = true; });
  }

  function checkEvoFlash(el, guard, markDone) {
    var rect = el.getBoundingClientRect();
    var inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;

    if (inView) {
      el.classList.add('visible');
      if (guard()) {
        markDone();
        // Trigger white flash
        el.classList.add('flash-active');
        setTimeout(function () {
          el.classList.remove('flash-active');
        }, 1200);
      }
    }
  }

  // --------------------------------------------------------
  // Reveal on scroll (IntersectionObserver)
  // --------------------------------------------------------
  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show everything
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --------------------------------------------------------
  // Stat bar animations
  // --------------------------------------------------------
  var statBars = document.querySelectorAll('.reveal-stat');

  if ('IntersectionObserver' in window) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var bar = entry.target;
          var value = bar.getAttribute('data-value');
          var fill = bar.querySelector('.stat-bar__fill');
          if (fill) {
            // Slight delay for stagger effect
            var idx = Array.prototype.indexOf.call(statBars, bar);
            setTimeout(function () {
              fill.style.width = value + '%';
              bar.classList.add('animated');
            }, idx * 150);
          }
          statObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    statBars.forEach(function (bar) {
      statObserver.observe(bar);
    });
  }

  // --------------------------------------------------------
  // Smooth scroll for side nav
  // --------------------------------------------------------
  navDots.forEach(function (dot) {
    dot.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --------------------------------------------------------
  // Listen to scroll
  // --------------------------------------------------------
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial call

})();
