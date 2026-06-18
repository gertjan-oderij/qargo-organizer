function matchesPattern(hostname, pattern) {
  pattern = pattern.replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(2);
    return hostname === suffix || hostname.endsWith("." + suffix);
  }
  if (pattern.startsWith("*")) return hostname.includes(pattern.slice(1));
  if (pattern.endsWith("*")) return hostname.startsWith(pattern.slice(0, -1));
  return hostname === pattern || hostname.endsWith("." + pattern);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function renderRules(rules) {
  const list = document.getElementById("rules-list");
  if (!rules.length) {
    list.innerHTML = '<div class="empty-state">No rules configured yet.<br>Click "Manage Rules" to add some.</div>';
    return;
  }
  list.innerHTML = rules
    .map(
      (r) => `
    <div class="rule-item">
      <span class="color-dot" style="background:${r.color}"></span>
      <span class="rule-pattern">${r.pattern}</span>
      <span class="rule-badge" style="background:${r.color};color:${badgeTextColor(r.color)}">${r.label || ""}</span>
    </div>`
    )
    .join("");
}

function badgeTextColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#fff";
  const lum = luminance(rgb.r, rgb.g, rgb.b);
  return lum > 0.179 ? "#000" : "#fff";
}

function updateCurrentTab(rules) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab || !tab.url) return;
    let hostname;
    try {
      hostname = new URL(tab.url).hostname;
    } catch {
      return;
    }

    document.getElementById("tab-hostname").textContent = hostname || tab.url;

    const match = rules.find((r) => matchesPattern(hostname, r.pattern));
    const swatch = document.getElementById("tab-color-swatch");
    const label = document.getElementById("tab-rule-label");

    if (match) {
      swatch.style.background = match.color;
      swatch.style.borderColor = match.color;
      label.textContent = match.label || match.pattern;
      label.style.color = match.color;
    } else {
      swatch.style.background = "#45475a";
      swatch.style.borderColor = "#585b70";
      label.textContent = "no rule";
      label.style.color = "#6c7086";
    }
  });
}

import { DEFAULT_RULES } from "../shared/constants.js";

chrome.storage.sync.get({ rules: DEFAULT_RULES }, ({ rules }) => {
  renderRules(rules);
  updateCurrentTab(rules);
});

document.getElementById("open-options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
