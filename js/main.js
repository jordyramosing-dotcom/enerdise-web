// ENERDISE — interacciones del sitio

// Menú móvil
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Sombra del header al hacer scroll
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Animación de aparición (en cascada dentro de cada grupo)
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => {
  const hermanos = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
  if (hermanos.length > 1 && !reducirMovimiento) {
    el.style.transitionDelay = `${Math.min(hermanos.indexOf(el) * 90, 540)}ms`;
  }
  observer.observe(el);
});

// Contadores animados en las cifras
function animarContador(el) {
  const partes = el.textContent.trim().match(/^([^\d]*)(\d+)(.*)$/);
  if (!partes) return; // textos sin número (p. ej. "Nacional")
  const [, prefijo, fin, sufijo] = partes;
  const objetivo = parseInt(fin, 10);
  const duracion = 1500;
  const inicio = performance.now();
  function paso(ahora) {
    const t = Math.min((ahora - inicio) / duracion, 1);
    const suavizado = 1 - Math.pow(1 - t, 3); // ease-out
    el.textContent = `${prefijo}${Math.round(objetivo * suavizado)}${sufijo}`;
    if (t < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach((num) => {
        if (reducirMovimiento) return;
        animarContador(num);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

// Parallax suave en los fondos del hero y la cinta CTA
const heroBg = document.querySelector('.hero-bg');
const ctaBand = document.querySelector('.cta-band');
const ctaBg = document.querySelector('.cta-bg');

function aplicarParallax() {
  if (heroBg) {
    const desplazamiento = Math.min(window.scrollY * 0.25, window.innerHeight * 0.27);
    heroBg.style.transform = `translate3d(0, ${desplazamiento}px, 0)`;
  }
  if (ctaBand && ctaBg) {
    const rect = ctaBand.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const centro = rect.top + rect.height / 2 - window.innerHeight / 2;
      ctaBg.style.transform = `translate3d(0, ${centro * -0.12}px, 0)`;
    }
  }
}

if (!reducirMovimiento) {
  let parallaxPendiente = false;
  window.addEventListener('scroll', () => {
    if (parallaxPendiente) return;
    parallaxPendiente = true;
    requestAnimationFrame(() => {
      aplicarParallax();
      parallaxPendiente = false;
    });
  }, { passive: true });
  aplicarParallax();
}

// Lightbox para la galería de proyectos
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.project').forEach((fig) => {
  fig.addEventListener('click', () => {
    const img = fig.querySelector('img');
    const title = fig.querySelector('h3');
    const place = fig.querySelector('figcaption p');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = `${title.textContent} — ${place.textContent}`;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Formulario: WhatsApp (principal) o correo (alternativa), con el mensaje prellenado
const contactForm = document.getElementById('contactForm');

function datosFormulario() {
  return {
    nombre: contactForm.nombre.value.trim(),
    telefono: contactForm.telefono.value.trim(),
    mensaje: contactForm.mensaje.value.trim(),
  };
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const { nombre, telefono, mensaje } = datosFormulario();
  const texto = `Hola ENERDISE, soy ${nombre}.${telefono ? ` Mi teléfono: ${telefono}.` : ''}\n\n${mensaje}`;
  window.open(`https://wa.me/50496431605?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
});

document.getElementById('btnCorreo').addEventListener('click', () => {
  if (!contactForm.reportValidity()) return;
  const { nombre, telefono, mensaje } = datosFormulario();
  const asunto = encodeURIComponent(`Solicitud de cotización — ${nombre}`);
  const cuerpo = encodeURIComponent(
    `Nombre: ${nombre}\nTeléfono: ${telefono || 'No indicado'}\n\nMensaje:\n${mensaje}`
  );
  window.location.href = `mailto:enerdiseingenieria@outlook.com?subject=${asunto}&body=${cuerpo}`;
});

// Año dinámico en el pie de página
document.getElementById('year').textContent = new Date().getFullYear();
