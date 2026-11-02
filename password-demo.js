/* ==========================================================
   password-demo.js - Password Strength Checker
   Everything runs in the browser. Nothing is sent anywhere.
   ========================================================== */

(function () {
  "use strict";

  var input = document.getElementById("pw");
  if (!input) return;

  var toggleBtn = document.getElementById("pwToggle");
  var fill = document.getElementById("meterFill");
  var label = document.getElementById("meterLabel");
  var lengthEl = document.getElementById("statLength");
  var bitsEl = document.getElementById("statBits");
  var timeEl = document.getElementById("statTime");
  var criteriaItems = document.querySelectorAll("#criteria li");

  var COMMON = ["password", "123456", "12345678", "123456789", "qwerty", "abc123", "111111",
    "password1", "iloveyou", "admin", "welcome", "letmein", "000000", "123123", "football",
    "monkey", "dragon", "login", "princess", "qwerty123", "nigeria", "miva123"];

  // Each rule has a key (matches data-key in the HTML) and a test function
  var rules = [
    { key: "length", test: function (p) { return p.length >= 12; } },
    { key: "lower", test: function (p) { return /[a-z]/.test(p); } },
    { key: "upper", test: function (p) { return /[A-Z]/.test(p); } },
    { key: "number", test: function (p) { return /[0-9]/.test(p); } },
    { key: "symbol", test: function (p) { return /[^A-Za-z0-9]/.test(p); } },
    { key: "common", test: function (p) { return !isCommon(p) && !/(.)\1\1/.test(p); } }
  ];

  var levels = [
    { max: 28, name: "Very weak", color: "var(--danger)" },
    { max: 36, name: "Weak", color: "var(--danger)" },
    { max: 60, name: "Okay", color: "var(--warn)" },
    { max: 80, name: "Strong", color: "var(--success)" },
    { max: Infinity, name: "Very strong", color: "var(--success)" }
  ];

  function isCommon(p) {
    var lower = p.toLowerCase();
    return COMMON.some(function (word) { return lower === word || lower.replace(/[0-9!@#$%^&*]+$/, "") === word; });
  }

  function poolSize(p) {
    var size = 0;
    if (/[a-z]/.test(p)) size += 26;
    if (/[A-Z]/.test(p)) size += 26;
    if (/[0-9]/.test(p)) size += 10;
    if (/[^A-Za-z0-9]/.test(p)) size += 32;
    return size;
  }

  function entropyBits(p) {
    if (p.length === 0) return 0;
    if (isCommon(p)) return 8;
    return Math.round(p.length * Math.log(poolSize(p)) / Math.LN2);
  }

  function crackTime(bits) {
    if (bits === 0) return "-";
    // Assume an attacker can try 10 billion guesses every second
    var seconds = Math.pow(2, bits) / 2 / 1e10;
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return Math.round(seconds) + " seconds";
    if (seconds < 3600) return Math.round(seconds / 60) + " minutes";
    if (seconds < 86400) return Math.round(seconds / 3600) + " hours";
    if (seconds < 31536000) return Math.round(seconds / 86400) + " days";
    var years = seconds / 31536000;
    if (years < 1e6) return Math.round(years).toLocaleString() + " years";
    return "Millions of years+";
  }

  function check() {
    var pw = input.value;
    var bits = entropyBits(pw);

    rules.forEach(function (rule, i) {
      criteriaItems[i].classList.toggle("ok", pw.length > 0 && rule.test(pw));
    });

    var level = levels.filter(function (l) { return bits < l.max; })[0];
    if (pw.length === 0) {
      fill.style.width = "0%";
      label.textContent = "Type a password to begin";
      label.style.color = "var(--muted)";
    } else {
      fill.style.width = Math.min(100, Math.max(6, (bits / 90) * 100)) + "%";
      fill.style.background = level.color;
      label.textContent = level.name;
      label.style.color = level.color;
    }

    lengthEl.textContent = pw.length;
    bitsEl.textContent = bits;
    timeEl.textContent = crackTime(bits);
  }

  input.addEventListener("input", check);

  toggleBtn.addEventListener("click", function () {
    var show = input.type === "password";
    input.type = show ? "text" : "password";
    toggleBtn.textContent = show ? "Hide" : "Show";
    toggleBtn.setAttribute("aria-pressed", show ? "true" : "false");
  });

  check();
})();
