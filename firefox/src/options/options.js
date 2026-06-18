import { DEFAULT_RULES } from "../shared/constants.js";

let rules = [];
let dragSrcRow = null;

function renderRules() {
  const tbody = document.getElementById("rules-body");
  tbody.innerHTML = "";

  rules.forEach((rule, i) => {
    const tr = document.createElement("tr");
    tr.dataset.index = i;
    tr.draggable = true;

    tr.innerHTML = `
      <td><span class="drag-handle" title="Drag to reorder">⠿</span></td>
      <td><input type="text" class="pattern" placeholder="e.g. *.example.com" value="${escHtml(rule.pattern)}" /></td>
      <td><input type="text" class="label" placeholder="e.g. Staging" value="${escHtml(rule.label || "")}" style="width:90px" /></td>
      <td>
        <div class="color-cell">
          <input type="color" class="color-picker" value="${rule.color}" />
          <span class="color-hex">${rule.color}</span>
        </div>
      </td>
      <td><button class="btn-icon remove-btn" title="Remove rule">✕</button></td>
    `;

    // Color picker sync
    const picker = tr.querySelector(".color-picker");
    const hex = tr.querySelector(".color-hex");
    picker.addEventListener("input", () => { hex.textContent = picker.value; });

    // Remove button
    tr.querySelector(".remove-btn").addEventListener("click", () => {
      rules.splice(i, 1);
      renderRules();
    });

    // Drag events
    tr.addEventListener("dragstart", (e) => {
      dragSrcRow = tr;
      tr.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    tr.addEventListener("dragend", () => {
      tr.classList.remove("dragging");
      document.querySelectorAll("tr.drag-over").forEach((el) => el.classList.remove("drag-over"));
    });

    tr.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (dragSrcRow !== tr) tr.classList.add("drag-over");
    });

    tr.addEventListener("dragleave", () => tr.classList.remove("drag-over"));

    tr.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragSrcRow === tr) return;
      const from = parseInt(dragSrcRow.dataset.index);
      const to = parseInt(tr.dataset.index);
      collectCurrentValues();
      const [moved] = rules.splice(from, 1);
      rules.splice(to, 0, moved);
      renderRules();
    });

    tbody.appendChild(tr);
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function collectCurrentValues() {
  const rows = document.querySelectorAll("#rules-body tr");
  rules = Array.from(rows).map((tr) => ({
    pattern: tr.querySelector(".pattern").value.trim(),
    label: tr.querySelector(".label").value.trim(),
    color: tr.querySelector(".color-picker").value,
  }));
}

function showStatus(msg = "Saved!", duration = 2000) {
  const el = document.getElementById("status-msg");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), duration);
}

// Load rules from storage
chrome.storage.sync.get({ rules: DEFAULT_RULES }, (data) => {
  rules = data.rules;
  renderRules();
});

document.getElementById("add-rule").addEventListener("click", () => {
  collectCurrentValues();
  rules.push({ pattern: "", label: "", color: "#6c7086" });
  renderRules();
  // Focus the new pattern input
  const inputs = document.querySelectorAll(".pattern");
  inputs[inputs.length - 1]?.focus();
});

document.getElementById("save").addEventListener("click", () => {
  collectCurrentValues();
  const valid = rules.filter((r) => r.pattern.trim());
  chrome.storage.sync.set({ rules: valid }, () => {
    rules = valid;
    renderRules();
    showStatus("Saved!");
  });
});

document.getElementById("export").addEventListener("click", () => {
  collectCurrentValues();
  const json = JSON.stringify(rules, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "organizer-ruels.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("import").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw new Error("Expected a JSON array");
      const valid = imported.filter(
        (r) => r && typeof r.pattern === "string" && typeof r.color === "string"
      );
      if (valid.length === 0) throw new Error("No valid rules found");
      collectCurrentValues();
      const merge = rules.length > 0 && confirm("Merge with existing rules? Click Cancel to replace all.");
      if (merge) {
        const existingPatterns = new Set(rules.map((r) => r.pattern));
        valid.forEach((r) => { if (!existingPatterns.has(r.pattern)) rules.push(r); });
      } else {
        rules = valid;
      }
      renderRules();
      showStatus(`Imported ${valid.length} rule(s)`);
    } catch (err) {
      alert("Import failed: " + err.message);
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

document.getElementById("reset").addEventListener("click", () => {
  if (!confirm("Reset all rules to defaults?")) return;
  rules = structuredClone(DEFAULT_RULES);
  chrome.storage.sync.set({ rules }, () => {
    renderRules();
    showStatus("Reset to defaults");
  });
});
