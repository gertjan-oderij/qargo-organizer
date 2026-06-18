# Qargo Organizer

A browser extension (Chrome & Firefox) that visually tags Qargo environments in your tab favicons and titles to prevent accidental changes in the wrong environment.

When you visit a URL that matches a configured rule, the extension:
- Replaces the tab **favicon** with the Qargo logo recoloured in the rule's colour
- Prefixes the **tab title** with a bold label, e.g. 【𝗣𝗿𝗼𝗱】 My Page

---

## Installation

> No technical experience required — just follow the steps below.

The repository contains a separate, ready-to-load folder for each browser:

| Browser | Folder |
|---|---|
| Chrome (and Edge/Brave/other Chromium browsers) | `chrome/` |
| Firefox | `firefox/` |

### Step 1 — Download the extension

1. Go to the [repository page](https://github.com/geroderij/qargo-organizer) on GitHub
2. Click the green **Code** button → **Download ZIP**
3. Unzip the downloaded file somewhere easy to find (e.g. your Desktop)

### Step 2 — Load it in your browser

#### Chrome / Edge / Brave

1. In the address bar, type `chrome://extensions` and press **Enter**
2. Toggle on **Developer mode** (top-right corner)
3. Click **Load unpacked** (top-left)
4. Select the **`chrome`** folder inside the unzipped `qargo-organizer` folder

#### Firefox

1. In the address bar, type `about:debugging` and press **Enter**
2. Click **This Firefox** in the left sidebar
3. Click **Load Temporary Add-on…**
4. Open the **`firefox`** folder inside the unzipped `qargo-organizer` folder and select its **`manifest.json`**

> Note: Firefox unloads temporary add-ons when it restarts, so you'll need to load it again after relaunching. A permanently installed, signed version can be distributed via [addons.mozilla.org](https://addons.mozilla.org) later.

The extension is now installed. You'll see the Qargo Organizer icon appear in your browser toolbar.

---

## Configuration

Click the extension icon in the toolbar, then click **Manage Rules** to open the settings page.

Each rule has three fields:

| Field | Description | Example |
|---|---|---|
| **Pattern** | The hostname to match | `app.qargo.io`, `*.staging.qargo.io` |
| **Label** | Short text shown in the tab title | `Prod`, `Staging`, `Dev` |
| **Colour** | The colour used for the favicon and label | pick from the colour picker |

### Pattern matching

| Pattern | Matches |
|---|---|
| `app.qargo.io` | Exact hostname and any subdomain |
| `*.staging.qargo.io` | Any subdomain of `staging.qargo.io` |
| `staging*` | Any hostname starting with `staging` |

### Saving changes

Click **Save** after making changes. Open tabs will update automatically.
To reset everything back to the defaults, click **Reset to Defaults**.

---

## Updating the extension

When a new version is available:

1. Download and unzip the new version (same as Step 1 above), replacing the old folder
2. **Chrome:** go to `chrome://extensions`, find **Qargo Organizer** and click the **↺ refresh** icon.
   **Firefox:** go to `about:debugging` → **This Firefox**, and click **Reload** next to Qargo Organizer (or load it again if Firefox was restarted)
3. Reload any open tabs you want the update to apply to
