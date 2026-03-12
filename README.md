# Qargo Organizer

A Chrome extension that visually tags Qargo environments in your tab favicons and titles to prevent accidental changes in the wrong environment.

When you visit a URL that matches a configured rule, the extension:
- Replaces the tab **favicon** with the Qargo logo recoloured in the rule's colour
- Prefixes the **tab title** with a bold label, e.g. 【𝗣𝗿𝗼𝗱】 My Page

---

## Installation

> No technical experience required — just follow the steps below.

### Step 1 — Download the extension

1. Go to the [repository page](https://github.com/geroderij/qargo-organizer) on GitHub
2. Click the green **Code** button → **Download ZIP**
3. Unzip the downloaded file somewhere easy to find (e.g. your Desktop)

### Step 2 — Open Chrome Extensions

1. Open **Google Chrome**
2. In the address bar, type `chrome://extensions` and press **Enter**

### Step 3 — Enable Developer Mode

In the top-right corner of the Extensions page, toggle on **Developer mode**.

### Step 4 — Load the extension

1. Click the **Load unpacked** button that appears in the top-left
2. In the file picker, navigate to and select the unzipped `qargo-organizer` folder
3. Click **Select** (or **Open**)

The extension is now installed. You'll see the Qargo Organizer icon appear in your Chrome toolbar.

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
2. Go to `chrome://extensions`
3. Find **Qargo Organizer** and click the **↺ refresh** icon
4. Reload any open tabs you want the update to apply to
