// ============================================================
//  SAJAL BHATTARAI — PORTFOLIO SCRIPTS
//  Features: Nav, Theme, Scroll Reveals, Stats Animation,
//            Back-to-Top, EmailJS Contact Form
// ============================================================

// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ===== DOM Refs =====
const navToggle = $("#navToggle");
const navLinks  = $("#navLinks");
const themeToggle = $("#themeToggle");
const yearEl    = $("#year");
const topbar    = $(".topbar");
const backToTop = $(".back-to-top");


// ============================================================
//  FOOTER YEAR
// ============================================================
if (yearEl) yearEl.textContent = new Date().getFullYear();


// ============================================================
//  MOBILE NAV
// ============================================================
function closeNav() {
  if (!navLinks || !navToggle) return;
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

function toggleNav() {
  if (!navLinks || !navToggle) return;
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

navToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleNav();
});

// Close on nav-link click
$$(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinks?.classList.contains("open")) closeNav();
  });
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!navLinks || !navToggle) return;
  if (!navLinks.contains(e.target) && !navToggle.contains(e.target) && navLinks.classList.contains("open")) {
    closeNav();
  }
});

// Close on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks?.classList.contains("open")) closeNav();
});


// ============================================================
//  SMOOTH SCROLL (same-page hash links)
// ============================================================
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = topbar ? topbar.offsetHeight + 12 : 84;
  const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: y, behavior: "smooth" });
}

$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    if (id && document.getElementById(id)) {
      e.preventDefault();
      scrollToId(id);
    }
  });
});


// ============================================================
//  ACTIVE NAV LINK — highlights based on current page path
// ============================================================
(function setActiveNavLink() {
  const path = window.location.pathname;
  $$(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    // Exact match for home
    if (href === "/" && (path === "/" || path === "/index.html")) {
      link.classList.add("active");
    }
    // Prefix match for sub-pages (e.g. /projects/ matches /projects/fintech-pipeline/)
    else if (href !== "/" && path.startsWith(href)) {
      link.classList.add("active");
    }
    else {
      link.classList.remove("active");
    }
  });
})();


// ============================================================
//  THEME TOGGLE (persisted + system fallback)
// ============================================================
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeToggle) themeToggle.textContent = theme === "light" ? "☀️" : "🌙";
}

// Initialize
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light" || savedTheme === "dark") {
  applyTheme(savedTheme);
} else {
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  applyTheme(prefersLight ? "light" : "dark");
}

themeToggle?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
});


// ============================================================
//  NAVBAR — shrink on scroll + backdrop strengthen
// ============================================================
let lastScrollY = 0;
let ticking = false;

function updateNavbar() {
  const scrolled = window.scrollY > 50;
  topbar?.classList.toggle("scrolled", scrolled);
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateNavbar);
    ticking = true;
  }
}, { passive: true });


// ============================================================
//  BACK TO TOP — show/hide on scroll
// ============================================================
function updateBackToTop() {
  if (!backToTop) return;
  if (window.scrollY > 500) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
}

window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();


// ============================================================
//  SCROLL REVEAL — animate elements as they enter viewport
// ============================================================
(function initScrollReveal() {
  // Elements to reveal on scroll
  const revealSelectors = [
    ".stat-card",
    ".meet-content",
    ".journey-marker",
    ".stack-category",
    ".project-hero",
    ".card.project",
    ".blog-card",
    ".feature-card",
    ".layer-card",
    ".cta-card",
    ".footer-card",
    ".project-card",
    ".decision-card",
    ".result-item",
    ".roadmap-card",
    ".story-chapter",
    ".timeline-item",
    ".beyond-card",
    ".principle-card",
  ];

  const targets = $$(revealSelectors.join(", "));
  if (!targets.length) return;

  // Add initial hidden state
  targets.forEach((el) => {
    el.classList.add("reveal");
  });

  // Use IntersectionObserver
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const parent = entry.target.parentElement;
          const siblings = parent ? $$(".reveal", parent) : [];
          const index = siblings.indexOf(entry.target);
          const delay = Math.min(index * 80, 400); // max 400ms stagger

          entry.target.style.transitionDelay = `${delay}ms`;
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  targets.forEach((el) => observer.observe(el));
})();


// ============================================================
//  STATS COUNTER — animate numbers when visible
// ============================================================
(function initStatsCounter() {
  const statNumbers = $$(".stat-number, .result-number");
  if (!statNumbers.length) return;

  function animateValue(el, start, end, duration, suffix = "") {
    const startTime = performance.now();
    const isDecimal = String(end).includes(".");

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function parseStatValue(text) {
    // Extract numeric value and suffix from strings like "1,700+", "5+", "3–5 hrs/wk"
    const cleaned = text.trim();

    // Handle range format like "3–5 hrs/wk" — just display as-is, no animation
    if (cleaned.includes("–") || cleaned.includes("-")) {
      return null;
    }

    const match = cleaned.match(/^([\d,.]+)(.*)$/);
    if (!match) return null;

    const num = parseFloat(match[1].replace(/,/g, ""));
    const suffix = match[2] || "";

    return { num, suffix };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const original = el.textContent.trim();
          const parsed = parseStatValue(original);

          if (parsed && !isNaN(parsed.num)) {
            animateValue(el, 0, parsed.num, 1600, parsed.suffix);
          }
          // If not parseable (range), just leave it

          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
})();


// ============================================================
//  SCROLL CUE — hide after user scrolls
// ============================================================
(function initScrollCue() {
  const cue = $(".scroll-cue");
  if (!cue) return;

  let hidden = false;
  window.addEventListener("scroll", () => {
    if (!hidden && window.scrollY > 100) {
      cue.style.opacity = "0";
      cue.style.transform = "translateY(10px)";
      cue.style.transition = "400ms ease";
      hidden = true;
    }
  }, { passive: true });
})();


// ============================================================
//  EMAILJS CONTACT FORM
// ============================================================
const contactForm = document.getElementById("contactForm");
const formStatus  = document.getElementById("formStatus");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const sendBtn = document.getElementById("sendBtn");
    const originalText = sendBtn.textContent;

    // Loading state
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";
    formStatus.textContent = "";
    formStatus.style.color = "";

    const formData = {
      from_name:  document.getElementById("from_name").value,
      from_email: document.getElementById("from_email").value,
      message:    document.getElementById("message").value,
      to_name:    "Sajal Bhattarai",
    };

    emailjs
      .send(
        "service_qhnq5jb",   // Service ID
        "template_n0dd2fb",  // Template ID
        formData,
        "6mbHxvGgypO2zAq7k"  // Public Key
      )
      .then(() => {
        formStatus.textContent = "✓ Message sent successfully! I'll get back to you soon.";
        formStatus.style.color = "#10b981";
        contactForm.reset();
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
        setTimeout(() => { formStatus.textContent = ""; }, 5000);
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        formStatus.textContent = "✗ Failed to send. Please email me directly at jobsajalbhattarai@gmail.com";
        formStatus.style.color = "#ef4444";
        sendBtn.disabled = false;
        sendBtn.textContent = originalText;
        setTimeout(() => { formStatus.textContent = ""; }, 7000);
      });
  });
}


// ============================================================
//  INJECT REVEAL + BACK-TO-TOP CSS
//  (Keeps everything in one file — no extra CSS needed)
// ============================================================
(function injectDynamicStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* Scroll Reveal */
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .reveal.revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* Back to Top visibility */
    .back-to-top {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .back-to-top.visible {
      opacity: 0.6;
      pointer-events: auto;
    }
    .back-to-top.visible:hover {
      opacity: 1;
    }

    /* Navbar scrolled state */
    .topbar.scrolled {
      border-bottom-color: rgba(59,130,246,.10);
      box-shadow: 0 4px 20px rgba(0,0,0,.15);
    }
    [data-theme="light"] .topbar.scrolled {
      box-shadow: 0 4px 20px rgba(0,0,0,.06);
    }
  `;
  document.head.appendChild(style);
})();