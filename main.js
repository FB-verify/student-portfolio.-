/* ==========================================================
   main.js - shared behaviour for every page
   Theme toggle (dark / light), mobile menu, typing effect,
   skill bars, scroll reveal and footer year.
   ========================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "portfolio-theme";

  /* >>> EDIT THIS ONE LINE after you create your GitHub repository <<<
     Example: "https://github.com/your-username/student-portfolio"
     The "Source Code" buttons on the Projects page will use it. */
  var GITHUB_REPO_URL = "https://github.com/YOUR-USERNAME/student-portfolio";

  /* ---------- Theme: dark, light and a toggle button ---------- */
  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.getElementById("themeToggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
      btn.setAttribute("title", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
    }
  }

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* storage blocked - theme still changes for this visit */
    }
  }

  // Default is dark unless the visitor chose otherwise before
  applyTheme(getSavedTheme() || "dark");

  document.addEventListener("DOMContentLoaded", function () {
    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      applyTheme(root.getAttribute("data-theme"));
      themeBtn.addEventListener("click", toggleTheme);
    }

    /* ---------- Mobile menu ---------- */
    var menuBtn = document.getElementById("menuToggle");
    var navLinks = document.getElementById("navLinks");
    if (menuBtn && navLinks) {
      menuBtn.addEventListener("click", function () {
        var open = navLinks.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        menuBtn.textContent = open ? "✕" : "☰";
      });
      navLinks.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          navLinks.classList.remove("open");
          menuBtn.setAttribute("aria-expanded", "false");
          menuBtn.textContent = "☰";
        }
      });
    }

    /* ---------- Source Code buttons point to the GitHub repo ---------- */
    if (GITHUB_REPO_URL.indexOf("YOUR-USERNAME") === -1) {
      document.querySelectorAll("[data-repo-link]").forEach(function (link) {
        link.setAttribute("href", GITHUB_REPO_URL + "/blob/main/" + link.getAttribute("data-repo-link"));
      });
    }

    /* ---------- Back-to-top button ---------- */
    var topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "back-top";
    topBtn.setAttribute("aria-label", "Back to top");
    topBtn.innerHTML = "&#8593;";
    document.body.appendChild(topBtn);
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", function () {
      topBtn.classList.toggle("show", window.scrollY > 500);
    });

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Typing effect (home page) ---------- */
    var typingEl = document.getElementById("typing");
    if (typingEl) {
      var phrases = [
        "Cybersecurity Student",
        "Aspiring Cloud Engineer",
        "Web Developer in Training",
        "Lifelong Learner"
      ];
      var p = 0, c = 0, deleting = false;

      function type() {
        var word = phrases[p];
        typingEl.textContent = deleting ? word.slice(0, c--) : word.slice(0, c++);
        var delay = deleting ? 45 : 90;
        if (!deleting && c > word.length) {
          deleting = true;
          delay = 1500;
        } else if (deleting && c < 0) {
          deleting = false;
          p = (p + 1) % phrases.length;
          c = 0;
          delay = 400;
        }
        setTimeout(type, delay);
      }
      type();
    }

    /* ---------- Scroll reveal + skill bars ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    var bars = document.querySelectorAll(".bar span[data-level]");

    function showBars(scope) {
      scope.querySelectorAll(".bar span[data-level]").forEach(function (bar) {
        bar.style.width = bar.getAttribute("data-level") + "%";
      });
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            showBars(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("visible"); });
      bars.forEach(function (bar) { bar.style.width = bar.getAttribute("data-level") + "%"; });
    }

    /* Bars that are not inside a .reveal block */
    var barObserver = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.getAttribute("data-level") + "%";
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 }) : null;
    if (barObserver) bars.forEach(function (bar) { barObserver.observe(bar); });
  });
})();
