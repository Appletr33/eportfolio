/* script.js — ePortfolio: content loader + interactions */

/* Toggle fade-in/slide-in scroll animations (set to false for static) */
const TOGGLE_FADE_IN = false;
const ENABLE_SCANLINE_EFFECT = false;


document.addEventListener('DOMContentLoaded', async () => {
  if (ENABLE_SCANLINE_EFFECT) {
    document.body.classList.add('enable-scanline');
  }

  /* ---- Load shared nav ---- */
  const navSlot = document.getElementById('shared-nav');
  if (navSlot) {
    try {
      const navResp = await fetch('nav.html');
      navSlot.innerHTML = await navResp.text();
    } catch (e) {
      console.warn('Could not load nav.html', e);
    }
  }

  /* ---- Load shared footer ---- */
  const footerSlot = document.getElementById('shared-footer');
  if (footerSlot) {
    try {
      const footerResp = await fetch('footer.html');
      footerSlot.innerHTML = await footerResp.text();
    } catch (e) {
      console.warn('Could not load footer.html', e);
    }
  }

  /* ---- Load content.json ---- */
  let content = null;
  try {
    // Cache-busting to ensure we always get fresh content, fixing the issue where browser shows stale data
    const resp = await fetch(`content.json?t=${Date.now()}`);
    content = await resp.json();
    applyContent(content);

    // Initialize typing animation AFTER content is applied, so we type the loaded text
    initTypingAnimation();
  } catch (e) {
    console.warn('Could not load content.json, using inline fallbacks.', e);
    // If loading fails, still run animation with whatever is in the HTML
    initTypingAnimation();
  }

  /* ---- Apply content to the page ---- */
  function applyContent(c) {
    if (!c) return;

    // Name everywhere
    document.querySelectorAll('[data-content="name"]').forEach(el => {
      el.textContent = c.name;
    });
    // Page title
    if (document.querySelector('title')) {
      const page = document.body.dataset.page;
      const pageTitles = {
        academics: 'Academic Work',
        programming: 'Programming Work',
        volunteer: 'Volunteer Work'
      };
      document.title = pageTitles[page]
        ? `${pageTitles[page]} — ${c.name}`
        : `${c.name} — ePortfolio`;
    }
    // Email
    document.querySelectorAll('[data-content="email"]').forEach(el => {
      el.textContent = c.email;
      el.href = `mailto:${c.email}`;
    });
    document.querySelectorAll('[data-content="email-text"]').forEach(el => {
      el.textContent = c.email;
    });

    // Hero - Typography Updates
    const heroSubtitle = document.querySelector('[data-typing]');
    if (heroSubtitle && c.heroSubtitle) {
      heroSubtitle.setAttribute('data-typing', c.heroSubtitle);
    }

    const heroTagline = document.querySelector('[data-content="heroTagline"]');
    if (heroTagline) heroTagline.textContent = c.heroTagline;

    // About Me
    const aboutContainer = document.querySelector('[data-content="aboutMe"]');
    if (aboutContainer && c.aboutMe) {
      aboutContainer.innerHTML = c.aboutMe.map(p => `<p>${p}</p>`).join('');
    }

    // Favorites
    const favContainer = document.querySelector('[data-content="favorites"]');
    if (favContainer && c.favorites && c.favorites.length) {
      favContainer.innerHTML = `
        <h3 class="favorites__heading"><span class="accent">&gt;</span> favorites</h3>
        <div class="favorites__grid">
          ${c.favorites.map(f => `
            <div class="favorites__item">
              <span class="favorites__emoji">${f.emoji}</span>
              <span class="favorites__label">${f.label}</span>
              <span class="favorites__value">${f.value}</span>
            </div>
          `).join('')}
        </div>`;
    }

    // Achievements
    const achieveContainer = document.querySelector('[data-content="achievements"]');
    if (achieveContainer && c.achievements) {
      const colors = ['#f59e0b', '#22c55e', '#38bdf8', '#a78bfa'];
      achieveContainer.innerHTML = c.achievements.map((a, i) => {
        const color = colors[i % colors.length];
        return `
          <div class="card" style="--i:${i}">
            <div class="card__icon">
              <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="22,4 26,16 38,16 28,24 32,36 22,28 12,36 16,24 6,16 18,16"
                         stroke="${color}" stroke-width="1.2" fill="${color}1a"/>
                <circle cx="22" cy="4" r="2" fill="#38bdf8"/>
                <line x1="22" y1="4" x2="22" y2="0" stroke="#38bdf8" stroke-width="0.7"/>
              </svg>
            </div>
            <h3 class="card__title">${a.title}</h3>
            <p class="card__text">${a.description}</p>
          </div>`;
      }).join('');
    }

    // Strengths
    const strengthsContainer = document.querySelector('[data-content="strengths"]');
    if (strengthsContainer && c.strengths) {
      const sColors = ['#22c55e', '#38bdf8', '#a78bfa', '#f59e0b', '#2dd4bf', '#ef4444'];
      strengthsContainer.innerHTML = c.strengths.map((s, i) => {
        const sc = sColors[i % sColors.length];
        return `
          <li style="--i:${i}">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 2 L12.5 7.5 L18 8 L14 12 L15 18 L10 15 L5 18 L6 12 L2 8 L7.5 7.5Z" fill="${sc}" opacity="0.7"/>
            </svg>
            <div><strong>${s.title}</strong> — ${s.description}</div>
          </li>`;
      }).join('');
    }

    // Goals
    const goalsContainer = document.querySelector('[data-content="goals"]');
    if (goalsContainer && c.goals) {
      const gIcons = [
        // Academic
        `<svg viewBox="0 0 44 44" fill="none"><rect x="6" y="10" width="32" height="24" rx="3" stroke="#38bdf8" stroke-width="1.2" fill="rgba(56,189,248,0.06)"/><path d="M6 16 H38" stroke="#38bdf8" stroke-width="0.6" opacity="0.3"/><rect x="11" y="20" width="14" height="3" rx="1" fill="#38bdf8" opacity="0.4"/><rect x="11" y="26" width="22" height="3" rx="1" fill="#38bdf8" opacity="0.25"/><path d="M30 8 L36 11 L30 14 L24 11Z" fill="#f59e0b" opacity="0.6"/></svg>`,
        // Experience
        `<svg viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="14" stroke="#22c55e" stroke-width="1.2" fill="rgba(34,197,94,0.06)"/><path d="M22 12 V22 L29 29" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M30 10 Q35 6 34 12 Q32 14 30 10Z" fill="#22c55e" opacity="0.4"/></svg>`,
        // Career
        `<svg viewBox="0 0 44 44" fill="none"><path d="M8 34 L22 10 L36 34Z" stroke="#a78bfa" stroke-width="1.2" fill="rgba(167,139,250,0.06)"/><line x1="22" y1="22" x2="22" y2="28" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round"/><circle cx="22" cy="31" r="1" fill="#a78bfa"/><path d="M28 16 L34 12 L34 20Z" fill="#38bdf8" opacity="0.3"/></svg>`
      ];
      goalsContainer.innerHTML = c.goals.map((g, i) => `
        <div class="card" style="--i:${i}">
          <div class="card__icon">${gIcons[i % gIcons.length]}</div>
          <h3 class="card__title">${g.emoji} ${g.title}</h3>
          <p class="card__text">${g.description}</p>
        </div>`).join('');
    }

    // Academics (subjects → classes → entries)
    const acadContainer = document.querySelector('[data-content="academics"]');
    if (acadContainer && c.academics) {
      const entryColors = ['#22c55e', '#38bdf8', '#a78bfa'];
      acadContainer.innerHTML = c.academics.map((subject, si) => {
        const subjectColor = subject.color || entryColors[si % entryColors.length];
        const classesHTML = subject.classes.map((cls, ci) => {
          const entriesHTML = cls.entries.map((a, ei) => {
            const ac = entryColors[ei % entryColors.length];
            return `
              <div class="academic-card fade-in" style="margin-bottom: 28px;">
                <div class="academic-card__header">
                  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="2" width="20" height="28" rx="3" stroke="${ac}" stroke-width="1.2" fill="${ac}0f"/>
                    <path d="M18 2 V8 H24" stroke="${ac}" stroke-width="1" fill="none" opacity="0.5"/>
                    <rect x="8" y="12" width="12" height="2" rx="1" fill="${ac}" opacity="0.4"/>
                    <rect x="8" y="17" width="10" height="2" rx="1" fill="${ac}" opacity="0.25"/>
                    <rect x="8" y="22" width="14" height="2" rx="1" fill="${ac}" opacity="0.2"/>
                  </svg>
                  <h3>${a.title}</h3>
                </div>
                <div class="academic-card__body">
                  <div class="academic-card__links">
                    <a href="${a.assignmentLink}" target="_blank" rel="noopener">📄 View Assignment</a>
                    <a href="${a.reflectionLink}" target="_blank" rel="noopener">💭 View Reflection</a>
                  </div>
                  <div class="academic-card__reflection">
                    <h4>// reflection</h4>
                    ${a.reflection.map(p => `<p>${p}</p>`).join('')}
                  </div>
                </div>
              </div>`;
          }).join('');

          return `
            <div class="academic-class fade-in">
              <div class="academic-class__header">
                <span class="academic-class__icon" style="color: ${subjectColor}">📚</span>
                <h4 class="academic-class__name">${cls.name}</h4>
              </div>
              <div class="academic-class__entries">
                ${entriesHTML}
              </div>
            </div>`;
        }).join('');

        return `
          <div class="academic-subject fade-in" style="--subject-color: ${subjectColor}">
            <div class="academic-subject__header" onclick="this.parentElement.classList.toggle('collapsed')">
              <div class="academic-subject__title-row">
                <span class="academic-subject__icon">${subject.icon || '📖'}</span>
                <h3 class="academic-subject__name">${subject.subject}</h3>
              </div>
              <span class="academic-subject__toggle">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <polyline points="6,8 10,12 14,8"/>
                </svg>
              </span>
            </div>
            <div class="academic-subject__body">
              ${classesHTML}
            </div>
          </div>`;
      }).join('');

      // Handle new fade-in elements
      acadContainer.querySelectorAll('.fade-in').forEach(el => TOGGLE_FADE_IN ? fadeObserver.observe(el) : el.classList.add('visible'));
    }

    // Programming projects
    const progContainer = document.querySelector('[data-content="programming"]');
    if (progContainer && c.programming) {
      const pColors = ['#22c55e', '#38bdf8', '#a78bfa', '#f59e0b'];
      progContainer.innerHTML = c.programming.map((p, i) => {
        const pc = pColors[i % pColors.length];
        return `
          <div class="academic-card fade-in" style="margin-bottom: 28px;">
            <div class="academic-card__header">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="28" height="24" rx="3" stroke="${pc}" stroke-width="1.2" fill="${pc}0f"/>
                <polyline points="9,14 14,19 9,24" stroke="${pc}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="17" y1="24" x2="25" y2="24" stroke="${pc}" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <h3>${p.title}</h3>
            </div>
            <div class="academic-card__body">
              <p class="card__text">${p.description}</p>
              ${p.tags ? `<div class="project-tags">${p.tags.map(t => `<span class="project-tag" style="--tag-color:${pc}">${t}</span>`).join('')}</div>` : ''}
              ${p.link && p.link !== '#' ? `<div class="academic-card__links"><a href="${p.link}" target="_blank" rel="noopener">🔗 View Project</a></div>` : ''}
            </div>
          </div>`;
      }).join('');
      progContainer.querySelectorAll('.fade-in').forEach(el => TOGGLE_FADE_IN ? fadeObserver.observe(el) : el.classList.add('visible'));
    }

    // Volunteer work
    const volContainer = document.querySelector('[data-content="volunteer"]');
    if (volContainer && c.volunteer) {
      const vColors = ['#2dd4bf', '#22c55e', '#38bdf8', '#a78bfa'];
      volContainer.innerHTML = c.volunteer.map((v, i) => {
        const vc = vColors[i % vColors.length];
        return `
          <div class="academic-card fade-in" style="margin-bottom: 28px;">
            <div class="academic-card__header">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 28 L4 16 Q0 11 4 7 Q8 3 12 7 L16 12 L20 7 Q24 3 28 7 Q32 11 28 16Z" stroke="${vc}" stroke-width="1.2" fill="${vc}15"/>
              </svg>
              <h3>${v.title}</h3>
            </div>
            <div class="academic-card__body">
              <div class="volunteer-meta">
                <span class="volunteer-org">${v.organization}</span>
                <span class="volunteer-dates">${v.dates}</span>
              </div>
              <p class="card__text">${v.description}</p>
            </div>
          </div>`;
      }).join('');
      volContainer.querySelectorAll('.fade-in').forEach(el => TOGGLE_FADE_IN ? fadeObserver.observe(el) : el.classList.add('visible'));
    }

    // Footer year + name
    document.querySelectorAll('[data-content="footerCopy"]').forEach(el => {
      el.innerHTML = `&copy; 2026 ${c.name}`;
    });

    // Social links
    if (c.socials && c.socials.length) {
      const socialIcons = {
        github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
        linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
        youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
        twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
        website: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
        discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>`,
        twitch: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
        instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z"/></svg>`,
        email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
      };
      // Fallback icon for unknown platforms
      const fallbackIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`;

      const socialHTML = c.socials.map(s => {
        const icon = socialIcons[s.platform] || fallbackIcon;
        return `<a href="${s.url}" target="_blank" rel="noopener" class="social-link" title="${s.label}" aria-label="${s.label}">${icon}<span>${s.label}</span></a>`;
      }).join('');

      // Sidebar socials
      document.querySelectorAll('[data-content="socials-sidebar"]').forEach(el => {
        el.innerHTML = socialHTML;
      });
      // Footer socials (icon-only)
      document.querySelectorAll('[data-content="socials-footer"]').forEach(el => {
        el.innerHTML = c.socials.map(s => {
          const icon = socialIcons[s.platform] || fallbackIcon;
          return `<a href="${s.url}" target="_blank" rel="noopener" class="social-link social-link--icon" title="${s.label}" aria-label="${s.label}">${icon}</a>`;
        }).join('');
      });
    }
  }

  /* ---- Intersection Observer: fade-in on scroll ---- */
  const faders = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  let fadeObserver;
  if (TOGGLE_FADE_IN) {
    const observerOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
    fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, observerOpts);
    faders.forEach(el => fadeObserver.observe(el));
  } else {
    // Static mode: immediately show everything
    faders.forEach(el => el.classList.add('visible'));
  }

  /* ---- Mobile hamburger toggle ---- */
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded',
        navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Typing animation (reusable, called after content load) ---- */
  function initTypingAnimation() {
    const typeEl = document.querySelector('[data-typing]');
    // Check if we already initialized on this element to avoid duplicate cursors
    if (typeEl && !typeEl.hasAttribute('data-typing-initialized')) {
      typeEl.setAttribute('data-typing-initialized', 'true');
      const text = typeEl.getAttribute('data-typing') || '';
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
  }

  /* ---- Active nav link highlight (Scroll Spy) ---- */
  const navLinksItems = document.querySelectorAll('.nav__links a');
  const sections = document.querySelectorAll('section[id]');
  const path = window.location.pathname;
  const pageName = path.split('/').pop() || 'index.html';

  if (['academics.html', 'programming.html', 'volunteer.html'].includes(pageName)) {
    navLinksItems.forEach(link => {
      if (link.getAttribute('href') === pageName) link.classList.add('active');
    });
  } else {
    // Scroll Spy for Home Page
    const observerOptions = {
      root: null,
      // "Active area" is a strip in the middle-upper part of the screen
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Remove active from all
          navLinksItems.forEach(link => link.classList.remove('active'));

          // Add active to current
          const id = entry.target.getAttribute('id');
          navLinksItems.forEach(link => {
            const href = link.getAttribute('href');
            if (id === 'home' && (href === 'index.html' || href === '#home')) {
              link.classList.add('active');
            } else if (href === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      observer.observe(section);
    });
  }
});
