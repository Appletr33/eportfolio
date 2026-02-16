/* script.js — ePortfolio interactions */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Intersection Observer: fade-in on scroll ---- */
  const faders = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  const observerOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOpts);

  faders.forEach(el => fadeObserver.observe(el));

  /* ---- Mobile hamburger toggle ---- */
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks  = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded',
        navLinks.classList.contains('open'));
    });

    // close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Typing animation ---- */
  const typeEl = document.querySelector('[data-typing]');
  if (typeEl) {
    const text = typeEl.getAttribute('data-typing');
    typeEl.textContent = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    typeEl.parentNode.appendChild(cursor);

    function typeChar() {
      if (i < text.length) {
        typeEl.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, 60 + Math.random() * 40);
      }
    }
    setTimeout(typeChar, 800);
  }

  /* ---- Active nav link highlight ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});
