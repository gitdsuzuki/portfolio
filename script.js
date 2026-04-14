/* =============================== */
/*  鈴猫Works - Main JavaScript     */
/* =============================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mark body as loaded (remove loading overlay)
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });

  initParticles();
  initTyping();
  initScrollAnimations();
  initNavbar();
  initTiltCards();
  initCountUp();
  initMobileMenu();
  initBackToTop();
  initSmoothScroll();
  initSkillBars();
});

/* =============================== */
/*  1. PARTICLE BACKGROUND          */
/* =============================== */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let mouse = { x: null, y: null };

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Track mouse for interactive particles
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particleCount = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.4 + 0.1;
      // Color: mix of accent and cyan (darker for light bg)
      const colors = [
        '99, 102, 241',   // accent
        '139, 92, 246',   // accent-light
        '14, 165, 233',   // cyan
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.x -= (dx / dist) * force * 0.5;
          this.y -= (dy / dist) * force * 0.5;
        }
      }

      // Wrap around edges
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const opacity = (1 - dist / 120) * 0.1;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();
    animationId = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationId);
  });
}

/* =============================== */
/*  2. TYPING ANIMATION             */
/* =============================== */
function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const words = ['Webアプリ開発', 'LP・サイト制作', '技術コンサルティング', 'UI/UXデザイン', 'API設計・開発'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let timeout;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 500; // Pause before next word
    }

    timeout = setTimeout(type, speed);
  }

  // Start after hero animation
  setTimeout(type, 1000);
}

/* =============================== */
/*  3. SCROLL ANIMATIONS            */
/* =============================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-animate');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px 0px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* =============================== */
/*  4. NAVBAR SCROLL                */
/* =============================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

/* =============================== */
/*  5. 3D TILT CARD EFFECT          */
/* =============================== */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    const inner = card.querySelector(':scope > div');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    });
  });
}

/* =============================== */
/*  6. COUNT UP ANIMATION           */
/* =============================== */
function initCountUp() {
  const counters = document.querySelectorAll('.counter');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.dataset.target);
        animateCounter(counter, target);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    el.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

/* =============================== */
/*  7. MOBILE MENU                  */
/* =============================== */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');

    if (isOpen) {
      menu.classList.add('hidden');
      btn.classList.remove('hamburger-active');
      document.body.style.overflow = '';
    } else {
      menu.classList.remove('hidden');
      btn.classList.add('hamburger-active');
      document.body.style.overflow = 'hidden';
    }
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
      btn.classList.remove('hamburger-active');
      document.body.style.overflow = '';
    });
  });
}

/* =============================== */
/*  8. BACK TO TOP                  */
/* =============================== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================== */
/*  9. SMOOTH SCROLL                */
/* =============================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* =============================== */
/*  10. SKILL BARS                  */
/* =============================== */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.dataset.width;
        // Stagger the animation slightly based on parent position
        const parent = bar.closest('.skill-item');
        const siblings = Array.from(parent.parentElement.children);
        const index = siblings.indexOf(parent);

        setTimeout(() => {
          bar.style.width = width + '%';
          bar.classList.add('animate');
        }, index * 150);

        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => observer.observe(b));
}

/* =============================== */
/*  CONTACT FORM HANDLER            */
/* =============================== */
(function () {
  var GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzXtSUlLGOPS_rRAF9vD6ffvBR4D7z-tPLMZfiXEC0WAQtOQPis73Pvq4lG-VyP14mj/exec';

  var form      = document.getElementById('contact-form');
  var statusEl  = document.getElementById('form-status');
  var submitBtn = document.getElementById('form-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // HTML5 バリデーション
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // 送信中 UI
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>送信中...';
    statusEl.className = 'hidden';
    statusEl.textContent = '';

    var payload = {
      name:    form.name.value.trim(),
      email:   form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim()
    };

    // クライアント側バリデーション
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      statusEl.className = 'p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm';
      statusEl.textContent = 'メールアドレスの形式が正しくありません。';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i>送信する';
      return;
    }
    if (payload.name.length > 100 || payload.subject.length > 200 || payload.message.length > 5000) {
      statusEl.className = 'p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm';
      statusEl.textContent = '入力内容が長すぎます。お名前100文字・件名200文字・メッセージ5000文字以内でご入力ください。';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i>送信する';
      return;
    }

    try {
      var res = await fetch(GAS_ENDPOINT, {
        method:   'POST',
        redirect: 'follow',
        body:     JSON.stringify(payload)
      });

      var json = await res.json();

      if (json.status === 'ok') {
        statusEl.className = 'p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm';
        statusEl.innerHTML = '送信しました！確認メールをお送りしましたのでご確認ください。通常1営業日以内にご返信いたします。<br><span class="text-xs text-green-600 mt-1 block">※ メールが届かない場合は、メールアドレスが正しいかご確認のうえ、迷惑メールフォルダもご確認ください。</span>';
        form.reset();
      } else {
        throw new Error(json.message || '送信エラー');
      }
    } catch (err) {
      statusEl.className = 'p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm';
      statusEl.textContent = '送信に失敗しました。しばらく経ってから再度お試しください。';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i>送信する';
    }
  });
})();