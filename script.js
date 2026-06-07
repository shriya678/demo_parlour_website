// ============================================================
// Lightbox — click a gallery thumb to open the full-size image
// in a dark overlay; click overlay or press Esc to close.
// ============================================================

const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(fullUrl) {
  lightboxImg.src = fullUrl;
  lightbox.classList.remove('hidden');
  lightbox.classList.add('flex');
  document.body.classList.add('overflow-hidden');   // stop page scroll while open
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightbox.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
  lightboxImg.src = '';                             // free the image
}

document.querySelectorAll('.gallery-thumb').forEach(btn => {
  btn.addEventListener('click', () => openLightbox(btn.dataset.full));
});

lightbox.addEventListener('click', closeLightbox);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
    closeLightbox();
  }
});


// ============================================================
// Stat counter — given an element with data-count="N" and
// optional data-display="<formatted>", animate from 0 → N
// then set the final formatted display.
// ============================================================
function animateCount(el) {
  if (el.dataset.counted === 'true') return;
  el.dataset.counted = 'true';

  const target   = parseInt(el.dataset.count, 10);
  const display  = el.dataset.display || (target + '+');
  const duration = 1400;
  const start    = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // easeOutQuad — fast then settles slowly
    const eased = 1 - (1 - progress) * (1 - progress);
    const value = Math.floor(eased * target);
    el.textContent = value.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = display;
    }
  }
  requestAnimationFrame(tick);
}


// ============================================================
// Scroll-reveal — elements with class .reveal fade up the
// first time they enter the viewport. If the element (or any
// descendant) has data-count, the counter animates too.
// Uses native IntersectionObserver — no library, no polling.
// ============================================================
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');

    // Counters anywhere inside this revealed element.
    entry.target.querySelectorAll('[data-count]').forEach(animateCount);
    // Or if the element itself is a counter.
    if (entry.target.hasAttribute('data-count')) {
      animateCount(entry.target);
    }

    obs.unobserve(entry.target);     // fire once, then stop watching
  });
}, {
  threshold: 0.15,                    // 15% of the element visible = trigger
  rootMargin: '0px 0px -50px 0px'     // trigger a touch before fully in view
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ============================================================
// Sticky nav — show once the hero scrolls out of view.
// We watch the hero with an observer; nav appears when hero
// is NOT intersecting the viewport.
// ============================================================
const nav  = document.getElementById('nav');
const hero = document.querySelector('.brand-bg');

if (nav && hero) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        nav.classList.add('-translate-y-full');     // hidden
      } else {
        nav.classList.remove('-translate-y-full');  // visible
      }
    });
  }, { threshold: 0.05 });
  navObserver.observe(hero);
}


// ============================================================
// Testimonial carousel — fade between quotes every 5 seconds.
// Dots are click-to-jump; clicking resets the auto timer so the
// user gets at least a full interval to read what they picked.
// ============================================================
const testimonials = document.querySelectorAll('.testimonial');
const dots         = document.querySelectorAll('.dot');
let testimonialIdx = 0;
let testimonialTimer = null;

function showTestimonial(index) {
  testimonials.forEach((t, i) => t.classList.toggle('active', i === index));
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  testimonialIdx = index;
}

function nextTestimonial() {
  showTestimonial((testimonialIdx + 1) % testimonials.length);
}

function startTestimonialTimer() {
  clearInterval(testimonialTimer);
  testimonialTimer = setInterval(nextTestimonial, 5000);
}

if (testimonials.length > 0) {
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      showTestimonial(parseInt(dot.dataset.index, 10));
      startTestimonialTimer();   // reset auto-rotate after manual jump
    });
  });
  startTestimonialTimer();
}


// ============================================================
// Enquiry form → WhatsApp
// On submit, build a pre-formatted message from the form fields
// and open wa.me/<owner> with it URL-encoded as the text param.
// Swap OWNER_WHATSAPP for the real client's number per build.
// ============================================================
const OWNER_WHATSAPP = '918319181409';   // country code + number, no '+' or spaces

const enquiryForm = document.getElementById('enquiry-form');

if (enquiryForm) {
  enquiryForm.addEventListener('submit', e => {
    e.preventDefault();

    const data    = new FormData(enquiryForm);
    const name    = (data.get('name')    || '').trim();
    const phone   = (data.get('phone')   || '').trim();
    const service = data.get('service')  || '';
    const date    = data.get('date')     || '';
    const message = (data.get('message') || '').trim();

    // Build the message, skipping empty optional fields.
    const lines = [
      `Hi, I'm ${name}.`,
      `I'd like to book: ${service}.`,
      date    ? `Preferred date: ${date}.` : null,
      phone   ? `My phone: ${phone}.`      : null,
      message ? `\n${message}`             : null,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${text}`, '_blank');
  });
}
