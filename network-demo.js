/* ==========================================================
   network-demo.js - Home Network Security Audit report
   Findings are stored in an array. The security score and the
   counters update when a finding is marked as fixed.
   ========================================================== */

(function () {
  "use strict";

  var listEl = document.getElementById("findings");
  if (!listEl) return;

  var STORAGE_KEY = "network-audit-fixed";
  var WEIGHTS = { high: 25, medium: 10, low: 5 };

  var findings = [
    { id: "pw", severity: "high", device: "Router", title: "Router still uses the default admin password",
      detail: "Anyone on the network (or anyone who guesses the factory password) can open the router settings and change them.",
      fix: "Log in to the router and set a long, unique admin password. Keep it out of the router's sticker label." },
    { id: "fw", severity: "high", device: "Router", title: "Router firmware is out of date",
      detail: "Old firmware can contain known security holes that attackers scan the internet for.",
      fix: "Check the router's admin page for updates and turn on automatic updates if available." },
    { id: "wps", severity: "medium", device: "Router", title: "WPS (push-button setup) is switched on",
      detail: "WPS PINs can be brute-forced, which lets an attacker join the Wi-Fi without the password.",
      fix: "Turn WPS off in the Wi-Fi settings. Use the normal Wi-Fi password to connect devices." },
    { id: "guest", severity: "medium", device: "Smart TV", title: "Smart TV shares the network with laptops and phones",
      detail: "Smart TVs and other IoT gadgets are rarely updated. If one is hacked, it can reach your computers.",
      fix: "Create a Guest network and move the TV and other smart gadgets onto it." },
    { id: "upnp", severity: "medium", device: "Router", title: "UPnP is enabled",
      detail: "UPnP lets programs open holes in the firewall automatically, which malware can abuse.",
      fix: "Disable UPnP unless a game or app absolutely needs it." },
    { id: "ssid", severity: "low", device: "Router", title: "Wi-Fi name reveals the router model",
      detail: "A default name like 'TP-LINK_1A2B' tells attackers which known weaknesses to try.",
      fix: "Rename the Wi-Fi to something that does not contain the brand, model or your family name." },
    { id: "http", severity: "low", device: "Router", title: "Router admin page opens over HTTP, not HTTPS",
      detail: "Traffic to the admin page is not encrypted inside the home network.",
      fix: "Use HTTPS for the admin page if the router supports it, and only manage it from trusted devices." }
  ];

  var devices = [
    { name: "Router", type: "Gateway", risk: "High" },
    { name: "Laptop", type: "Computer", risk: "Low" },
    { name: "Phone", type: "Mobile", risk: "Low" },
    { name: "Smart TV", type: "IoT device", risk: "Medium" }
  ];

  var fixed = loadFixed();
  var currentFilter = "all";

  var scoreEl = document.getElementById("auditScore");
  var highEl = document.getElementById("countHigh");
  var medEl = document.getElementById("countMedium");
  var lowEl = document.getElementById("countLow");
  var filterBtns = document.querySelectorAll(".filter-btn[data-filter]");
  var resetBtn = document.getElementById("resetAudit");
  var deviceBody = document.getElementById("deviceRows");

  function loadFixed() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) { /* ignore */ }
    return [];
  }

  function saveFixed() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed)); } catch (e) { /* ignore */ }
  }

  function isFixed(id) { return fixed.indexOf(id) !== -1; }

  function toggleFixed(id) {
    if (isFixed(id)) {
      fixed = fixed.filter(function (x) { return x !== id; });
    } else {
      fixed.push(id);
    }
    saveFixed();
    render();
  }

  function cap(word) { return word.charAt(0).toUpperCase() + word.slice(1); }

  function updateSummary() {
    var totalWeight = 0, lostWeight = 0;
    var open = { high: 0, medium: 0, low: 0 };
    findings.forEach(function (f) {
      totalWeight += WEIGHTS[f.severity];
      if (!isFixed(f.id)) {
        lostWeight += WEIGHTS[f.severity];
        open[f.severity]++;
      }
    });
    var score = Math.round(((totalWeight - lostWeight) / totalWeight) * 60 + 40);
    scoreEl.textContent = score + "/100";
    highEl.textContent = open.high;
    medEl.textContent = open.medium;
    lowEl.textContent = open.low;
  }

  function render() {
    listEl.innerHTML = "";
    findings.forEach(function (f) {
      if (currentFilter !== "all" && f.severity !== currentFilter) return;

      var item = document.createElement("li");
      item.className = "finding" + (isFixed(f.id) ? " fixed" : "");

      var details = document.createElement("details");
      var summary = document.createElement("summary");

      var badge = document.createElement("span");
      badge.className = "badge sev-" + f.severity;
      badge.textContent = f.severity;

      var title = document.createElement("span");
      title.className = "f-title";
      title.textContent = f.title;

      summary.appendChild(badge);
      summary.appendChild(title);

      var body = document.createElement("div");
      body.className = "f-body";
      body.innerHTML = "<p><strong>Device:</strong> </p><p><strong>Risk:</strong> </p><p><strong>Recommended fix:</strong> </p>";
      var paras = body.querySelectorAll("p");
      paras[0].appendChild(document.createTextNode(f.device));
      paras[1].appendChild(document.createTextNode(f.detail));
      paras[2].appendChild(document.createTextNode(f.fix));

      var label = document.createElement("label");
      var check = document.createElement("input");
      check.type = "checkbox";
      check.checked = isFixed(f.id);
      check.addEventListener("change", function () { toggleFixed(f.id); });
      label.appendChild(check);
      label.appendChild(document.createTextNode(" Mark as fixed"));
      body.appendChild(label);

      details.appendChild(summary);
      details.appendChild(body);
      item.appendChild(details);
      listEl.appendChild(item);
    });

    if (!listEl.children.length) {
      var empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "No " + currentFilter + " findings.";
      listEl.appendChild(empty);
    }
    updateSummary();
  }

  function renderDevices() {
    devices.forEach(function (d) {
      var row = document.createElement("tr");
      [d.name, d.type].forEach(function (text) {
        var td = document.createElement("td");
        td.textContent = text;
        row.appendChild(td);
      });
      var riskCell = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "badge sev-" + d.risk.toLowerCase();
      badge.textContent = d.risk;
      riskCell.appendChild(badge);
      row.appendChild(riskCell);
      deviceBody.appendChild(row);
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      render();
    });
  });

  resetBtn.addEventListener("click", function () {
    fixed = [];
    saveFixed();
    render();
  });

  renderDevices();
  render();
})();
