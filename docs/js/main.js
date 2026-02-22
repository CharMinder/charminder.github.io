/* ============================================================
   CharMinder — Portfolio
   Scroll-driven evolution, particles, reveals
   ============================================================ */

(function () {
  'use strict';

  // --------------------------------------------------------
  // Fire Particle System
  // --------------------------------------------------------
  var canvas = document.getElementById('fire-particles');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var scrollRatio = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function createParticle() {
    var intensity = 0.2 + scrollRatio * 0.8;
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(1.2 + Math.random() * 2.5) * intensity,
      size: 1.5 + Math.random() * 3 * intensity,
      life: 1,
      decay: 0.01 + Math.random() * 0.018,
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
    var spawnCount = Math.floor(1 + scrollRatio * 3);
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
      ctx.globalAlpha = p.life * 0.5;
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
  // Scroll-driven Evolution Background
  // --------------------------------------------------------
  var evoCharmander = document.getElementById('evo-charmander');
  var evoCharmeleon = document.getElementById('evo-charmeleon');
  var evoCharizard  = document.getElementById('evo-charizard');
  var evoFlashOverlay = document.getElementById('evo-flash-overlay');

  var sprites = [evoCharmander, evoCharmeleon, evoCharizard];
  var currentEvoStage = 0;

  // Evolution thresholds (scroll ratio)
  var EVO_THRESHOLD_1 = 0.33;
  var EVO_THRESHOLD_2 = 0.66;

  function getTargetStage(ratio) {
    if (ratio < EVO_THRESHOLD_1) return 0;
    if (ratio < EVO_THRESHOLD_2) return 1;
    return 2;
  }

  function triggerFlash() {
    evoFlashOverlay.classList.remove('flash');
    // Force reflow to restart animation
    void evoFlashOverlay.offsetWidth;
    evoFlashOverlay.classList.add('flash');
  }

  function updateEvolution() {
    var targetStage = getTargetStage(scrollRatio);

    if (targetStage !== currentEvoStage) {
      triggerFlash();
      currentEvoStage = targetStage;
    }

    // Update sprite visibility
    for (var i = 0; i < sprites.length; i++) {
      if (i === currentEvoStage) {
        sprites[i].classList.add('evo-sprite--active');
      } else {
        sprites[i].classList.remove('evo-sprite--active');
      }
    }

    // Scale sprite up slightly as you progress through each stage
    var stageProgress;
    if (currentEvoStage === 0) {
      stageProgress = scrollRatio / EVO_THRESHOLD_1;
    } else if (currentEvoStage === 1) {
      stageProgress = (scrollRatio - EVO_THRESHOLD_1) / (EVO_THRESHOLD_2 - EVO_THRESHOLD_1);
    } else {
      stageProgress = (scrollRatio - EVO_THRESHOLD_2) / (1 - EVO_THRESHOLD_2);
    }
    stageProgress = Math.max(0, Math.min(1, stageProgress));

    var activeSprite = sprites[currentEvoStage];
    var baseOpacity = 0.08;
    var maxOpacity = 0.15;
    var opacity = baseOpacity + stageProgress * (maxOpacity - baseOpacity);
    activeSprite.style.opacity = opacity;
  }

  // --------------------------------------------------------
  // Side Nav tracking
  // --------------------------------------------------------
  var navDots = document.querySelectorAll('.nav-dot');
  var sectionIds = ['top', 'timeline', 'contact'];

  function updateNav() {
    var currentSection = '';
    for (var i = 0; i < sectionIds.length; i++) {
      var sec = document.getElementById(sectionIds[i]);
      if (sec) {
        var rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5) {
          currentSection = sectionIds[i];
        }
      }
    }

    var currentIdx = sectionIds.indexOf(currentSection);

    navDots.forEach(function (dot, i) {
      dot.classList.remove('active', 'filled');
      if (i < currentIdx) {
        dot.classList.add('filled');
      }
      if (i === currentIdx) {
        dot.classList.add('active', 'filled');
      }
    });
  }

  // --------------------------------------------------------
  // Main scroll handler
  // --------------------------------------------------------
  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollRatio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

    updateEvolution();
    updateNav();
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
    revealElements.forEach(function (el) {
      el.classList.add('visible');
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
  onScroll();

})();
