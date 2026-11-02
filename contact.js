/* ==========================================================
   contact.js - Contact form validation
   Rules:
     1. No field may be empty
     2. Email must be in a valid format
     3. Phone number must contain digits only
   ========================================================== */

(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  if (!form) return;

  var statusBox = document.getElementById("formStatus");

  // Each field has its own checking function (stored in an array of objects)
  var fields = [
    {
      id: "name",
      label: "Name",
      check: function (value) {
        if (value === "") return "Name cannot be empty.";
        return "";
      }
    },
    {
      id: "email",
      label: "Email address",
      check: function (value) {
        if (value === "") return "Email address cannot be empty.";
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailPattern.test(value)) return "Please enter a valid email, e.g. name@example.com.";
        return "";
      }
    },
    {
      id: "phone",
      label: "Phone number",
      check: function (value) {
        if (value === "") return "Phone number cannot be empty.";
        if (!/^[0-9]+$/.test(value)) return "Phone number must contain digits only (no spaces, + or -).";
        return "";
      }
    },
    {
      id: "message",
      label: "Message",
      check: function (value) {
        if (value === "") return "Message cannot be empty.";
        return "";
      }
    }
  ];

  function showResult(field, errorText) {
    var input = document.getElementById(field.id);
    var wrapper = input.closest(".field");
    var errorEl = document.getElementById(field.id + "Error");

    errorEl.textContent = errorText;
    wrapper.classList.toggle("invalid", errorText !== "");
    wrapper.classList.toggle("valid", errorText === "");
    input.setAttribute("aria-invalid", errorText !== "" ? "true" : "false");
  }

  function validateField(field) {
    var value = document.getElementById(field.id).value.trim();
    var message = field.check(value);
    showResult(field, message);
    return message === "";
  }

  function validateAll() {
    var allGood = true;
    var firstBad = null;
    fields.forEach(function (field) {
      var ok = validateField(field);
      if (!ok && !firstBad) firstBad = field.id;
      allGood = allGood && ok;
    });
    if (firstBad) document.getElementById(firstBad).focus();
    return allGood;
  }

  function showStatus(type, text) {
    statusBox.className = "form-status show " + type;
    statusBox.textContent = text;
  }

  // Live validation while typing / leaving a field
  fields.forEach(function (field) {
    var input = document.getElementById(field.id);
    input.addEventListener("blur", function () { validateField(field); });
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("invalid")) validateField(field);
    });
  });

  // Block anything except digits as the user types in the phone box
  document.getElementById("phone").addEventListener("input", function (e) {
    if (/[^0-9]/.test(e.target.value)) {
      showResult(fields[2], "Phone number must contain digits only (no spaces, + or -).");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateAll()) {
      showStatus("bad", "Please fix the highlighted fields and try again.");
      return;
    }

    var name = document.getElementById("name").value.trim();
    // No server is needed for this assignment, so sending is simulated.
    showStatus("ok", "Thank you, " + name + "! Your message has been sent successfully. I will reply to your email soon.");
    form.reset();
    fields.forEach(function (field) {
      var wrapper = document.getElementById(field.id).closest(".field");
      wrapper.classList.remove("valid", "invalid");
      document.getElementById(field.id + "Error").textContent = "";
    });
  });
})();
