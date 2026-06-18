import { DEFAULT_RULES } from "../shared/constants.js";

async function getRules() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ rules: DEFAULT_RULES }, (data) => resolve(data.rules));
  });
}

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

// Content script asks background for the rule matching its hostname
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "GET_RULE") return;
  getRules().then((rules) => {
    const match = rules.find((r) => matchesPattern(msg.hostname, r.pattern));
    sendResponse(match || null);
  });
  return true; // keep channel open for async response
});

// Re-inject content script into all open tabs when rules change
chrome.storage.onChanged.addListener((changes) => {
  if (!changes.rules) return;
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) return;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      }).catch(() => {}); // ignore tabs we can't inject into
    });
  });
});
