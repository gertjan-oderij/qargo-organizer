(async function () {
  if (window.self !== window.top) return;

  const SIZE = 32;
  const LOGO_URL = chrome.runtime.getURL("icons/logo.png");

  // ─── Color utils ───────────────────────────────────────────────────────────

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    if (s === 0) {
      const v = Math.round(l * 255);
      return [v, v, v];
    }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [
      Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    ];
  }

  // ─── Favicon ────────────────────────────────────────────────────────────────

  function getFaviconLinkEl() {
    let el = document.head.querySelector('link[rel~="icon"]');
    if (!el) {
      el = document.createElement("link");
      el.rel = "icon";
      document.head.appendChild(el);
    }
    return el;
  }

  function getCurrentFaviconUrl() {
    const selectors = [
      'link[rel="icon"][sizes="32x32"]',
      'link[rel="icon"][sizes="16x16"]',
      'link[rel~="icon"]',
      'link[rel="shortcut icon"]',
    ];
    for (const sel of selectors) {
      const el = document.head.querySelector(sel);
      if (el?.href) return el.href;
    }
    return `${location.origin}/favicon.ico`;
  }

  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Recolor the logo by shifting every non-transparent pixel's hue/saturation
  // to match the target color, while preserving the original lightness structure.
  function recolorLogo(img, color) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, SIZE, SIZE);

    const rgb = hexToRgb(color);
    if (!rgb) return canvas.toDataURL("image/png");

    const [targetH, targetS] = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue; // skip fully transparent pixels
      const [, , l] = rgbToHsl(d[i], d[i + 1], d[i + 2]);
      const [nr, ng, nb] = hslToRgb(targetH, targetS, l);
      d[i] = nr;
      d[i + 1] = ng;
      d[i + 2] = nb;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  }

  // ─── Title prefix ───────────────────────────────────────────────────────────

  const PREFIX_RE = /^【[^】]+】\s*/;

  // Convert alphanumeric chars to Unicode Mathematical Bold Sans-Serif equivalents
  // so the label appears visually bold in plain-text tab titles.
  function toBold(str) {
    return [...str].map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90)  return String.fromCodePoint(0x1D5D4 + code - 65); // A-Z
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + code - 97); // a-z
      if (code >= 48 && code <= 57)  return String.fromCodePoint(0x1D7EC + code - 48); // 0-9
      return c;
    }).join("");
  }

  function applyTitlePrefix(label) {
    const base = document.title.replace(PREFIX_RE, "");
    document.title = `【${toBold(label)}】 ${base}`;
  }

  function watchTitle(label) {
    const titleEl = document.querySelector("title");
    if (!titleEl) return;
    const obs = new MutationObserver(() => {
      if (PREFIX_RE.test(document.title)) return; // already prefixed
      applyTitlePrefix(label);
    });
    obs.observe(titleEl, { childList: true });
  }

  // ─── Apply / restore ────────────────────────────────────────────────────────

  const originalFaviconHref = getCurrentFaviconUrl();
  const originalTitle = document.title;
  let logoImg = null; // cached original logo

  async function applyRule(rule) {
    const faviconEl = getFaviconLinkEl();
    if (!rule) {
      faviconEl.href = originalFaviconHref;
      document.title = originalTitle;
      return;
    }

    if (!logoImg) logoImg = await loadImage(LOGO_URL);
    if (logoImg) faviconEl.href = recolorLogo(logoImg, rule.color);

    applyTitlePrefix(rule.label || rule.pattern);
  }

  // ─── Main ───────────────────────────────────────────────────────────────────

  const rule = await chrome.runtime.sendMessage({
    type: "GET_RULE",
    hostname: location.hostname,
  }).catch(() => null);

  await applyRule(rule);

  if (rule) {
    watchTitle(rule.label || rule.pattern);

    // Re-apply favicon if the page swaps it (SPAs)
    let applying = false;
    const favObs = new MutationObserver(async (mutations) => {
      if (applying) return;
      const changed = mutations.some((m) =>
        Array.from(m.addedNodes).some((n) => n.nodeName === "LINK" && /icon/i.test(n.rel))
      );
      if (!changed) return;
      applying = true;
      await applyRule(rule);
      applying = false;
    });
    favObs.observe(document.head, { childList: true, subtree: true });
  }
})();
