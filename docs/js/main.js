/* ============================================================
   CharMinder — Retro Neon Portfolio
   Dark/Light toggle, retro grid, scroll reveals
   ============================================================ */

(function () {
  'use strict';

  // --------------------------------------------------------
  // Dark / Light Mode Toggle
  // --------------------------------------------------------
  var html = document.documentElement;
  var toggleBtn = document.getElementById('theme-toggle');

  // Check for saved preference, default to dark
  var stored = localStorage.getItem('theme');
  if (stored === 'light') {
    html.classList.remove('dark');
  } else {
    html.classList.add('dark');
  }

  toggleBtn.addEventListener('click', function () {
    html.classList.toggle('dark');
    var isDark = html.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // --------------------------------------------------------
  // Retro Grid / Particle Canvas
  // --------------------------------------------------------
  var canvas = document.getElementById('retro-canvas');
  var ctx = canvas.getContext('2d');
  var scrollRatio = 0;
  var particles = [];
  var gridOpacity = 0;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Floating neon particles
  function createParticle() {
    var isDark = html.classList.contains('dark');
    var colors = isDark
      ? ['rgba(0,245,212,', 'rgba(179,136,255,', 'rgba(255,110,180,', 'rgba(255,230,109,']
      : ['rgba(255,110,180,', 'rgba(179,136,255,', 'rgba(0,245,212,', 'rgba(255,183,71,'];

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: 1 + Math.random() * 2.5,
      life: 0.3 + Math.random() * 0.7,
      decay: 0.001 + Math.random() * 0.003,
      colorBase: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  // Seed initial particles
  for (var i = 0; i < 40; i++) {
    particles.push(createParticle());
  }

  function drawRetroGrid() {
    var isDark = html.classList.contains('dark');
    if (!isDark) return;

    gridOpacity = 0.04 + scrollRatio * 0.06;
    ctx.strokeStyle = 'rgba(179, 136, 255,' + gridOpacity + ')';
    ctx.lineWidth = 0.5;

    var spacing = 60;
    var offsetY = (Date.now() * 0.01) % spacing;

    // Horizontal lines (moving down for retro perspective feel)
    for (var y = -spacing + offsetY; y < canvas.height + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (var x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  function updateAndDrawParticles() {
    // Spawn new particles to maintain count
    while (particles.length < 50) {
      particles.push(createParticle());
    }

    for (var idx = particles.length - 1; idx >= 0; idx--) {
      var p = particles[idx];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0 || p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 10) {
        particles.splice(idx, 1);
        continue;
      }

      var alpha = p.life * 0.6;
      ctx.fillStyle = p.colorBase + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.colorBase + (alpha * 0.5) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRetroGrid();
    updateAndDrawParticles();
    requestAnimationFrame(animate);
  }
  animate();

  // --------------------------------------------------------
  // Side Navigation Tracking
  // --------------------------------------------------------
  var navDots = document.querySelectorAll('.nav-dot');
  var sectionIds = ['top', 'about', 'timeline', 'contact'];

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
  // Scroll Handler
  // --------------------------------------------------------
  function onScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollRatio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    updateNav();
    updateTimelineProgress();
  }

  // --------------------------------------------------------
  // Reveal on Scroll (IntersectionObserver)
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
  // Scroll-Driven Timeline Progress Line
  // --------------------------------------------------------
  var timeline = document.querySelector('.timeline');
  var timelineProgress = document.querySelector('.timeline-progress');
  var timelineItemsList = document.querySelectorAll('.timeline-item');

  function updateTimelineProgress() {
    if (!timeline || !timelineProgress) return;

    var rect = timeline.getBoundingClientRect();
    var timelineHeight = rect.height;

    // The "scan line" sits at 50% of the viewport height
    var triggerPoint = window.innerHeight * 0.5;
    var progressPx = triggerPoint - rect.top;
    var progress = progressPx / timelineHeight;
    progress = Math.max(0, Math.min(1, progress));

    timelineProgress.style.height = (progress * 100) + '%';

    // Activate dots as the progress line reaches each item
    for (var i = 0; i < timelineItemsList.length; i++) {
      var item = timelineItemsList[i];
      var itemTop = item.offsetTop;
      var threshold = progress * timelineHeight;

      if (itemTop <= threshold + 12) {
        item.classList.add('timeline-active');
      }
    }
  }

  // --------------------------------------------------------
  // Smooth Scroll for Side Nav
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
