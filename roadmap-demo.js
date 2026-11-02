/* ==========================================================
   roadmap-demo.js - Cloud Engineer Roadmap tracker
   Tick topics as you learn them. Progress is saved in the browser.
   ========================================================== */

(function () {
  "use strict";

  var container = document.getElementById("roadmap");
  if (!container) return;

  var STORAGE_KEY = "cloud-roadmap-progress";

  var steps = [
    { title: "Step 1: Networking Basics", desc: "How computers talk to each other.",
      topics: ["IP addresses", "DNS", "TCP/IP model", "Subnetting", "Ports and protocols", "Routers and switches"] },
    { title: "Step 2: Linux and Git", desc: "The tools every cloud engineer uses daily.",
      topics: ["Linux command line", "File permissions", "Users and groups", "Bash scripting basics", "Git basics", "GitHub workflow"] },
    { title: "Step 3: Cybersecurity Fundamentals", desc: "Protecting systems and data.",
      topics: ["CIA triad", "Passwords and MFA", "Encryption basics", "Firewalls", "Common attacks", "Security best practices"] },
    { title: "Step 4: Cloud Fundamentals", desc: "Core cloud ideas used by every provider.",
      topics: ["IaaS, PaaS and SaaS", "Virtual machines", "Cloud storage", "Identity and access (IAM)", "Cloud networking", "Billing and cost control"] },
    { title: "Step 5: Hands-on Cloud Labs", desc: "Learning by building.",
      topics: ["Launch a virtual server", "Host a static website", "Set up a database", "Configure security groups", "Monitor with logs and alerts", "Automate with scripts"] },
    { title: "Step 6: Certification", desc: "Prove the skills.",
      topics: ["Pick an entry-level cloud certification", "Study with practice questions", "Book the exam", "Pass the exam"] }
  ];

  var done = load();
  var progressFill = document.getElementById("rmFill");
  var progressText = document.getElementById("rmText");
  var resetBtn = document.getElementById("rmReset");

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) { /* ignore */ }
    // Starting position: first two networking topics already learned
    return ["0-0", "0-1"];
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(done)); } catch (e) { /* ignore */ }
  }

  function toggle(key) {
    var index = done.indexOf(key);
    if (index === -1) done.push(key); else done.splice(index, 1);
    save();
    render();
  }

  function render() {
    container.innerHTML = "";
    var total = 0, completed = 0;

    steps.forEach(function (step, s) {
      var stepDone = 0;
      var card = document.createElement("article");
      card.className = "rm-step";

      var head = document.createElement("div");
      head.className = "rm-head";
      var h3 = document.createElement("h3");
      h3.textContent = step.title;
      var count = document.createElement("span");
      count.className = "rm-count";
      head.appendChild(h3);
      head.appendChild(count);

      var desc = document.createElement("p");
      desc.className = "rm-desc";
      desc.textContent = step.desc;

      var list = document.createElement("ul");
      list.className = "rm-topics";

      step.topics.forEach(function (topic, t) {
        var key = s + "-" + t;
        var li = document.createElement("li");
        var label = document.createElement("label");
        var box = document.createElement("input");
        box.type = "checkbox";
        box.checked = done.indexOf(key) !== -1;
        box.addEventListener("change", function () { toggle(key); });
        label.appendChild(box);
        label.appendChild(document.createTextNode(topic));
        li.appendChild(label);
        list.appendChild(li);

        total++;
        if (box.checked) { completed++; stepDone++; }
      });

      count.textContent = stepDone + " / " + step.topics.length + (stepDone === step.topics.length ? " ✓" : "");
      if (stepDone === step.topics.length) card.classList.add("complete");

      card.appendChild(head);
      card.appendChild(desc);
      card.appendChild(list);
      container.appendChild(card);
    });

    var percent = Math.round((completed / total) * 100);
    progressFill.style.width = percent + "%";
    progressText.textContent = percent + "% of the roadmap complete (" + completed + " of " + total + " topics)";
  }

  resetBtn.addEventListener("click", function () {
    done = [];
    save();
    render();
  });

  render();
})();
