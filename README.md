# 🎯 Birthact

A personal networking app for Android. Keep track of the people you meet, never miss a birthday, and maintain your professional network effortlessly.

> **Disclosure:** The source code for this application was generated with the assistance of **Claude (Anthropic)**, an AI assistant. The product concept, specifications, and functional decisions are my own — the code implementation was AI-assisted. This project reflects my ability to design a product, define requirements, and leverage AI tooling to bring a vision to life.

---

## Features

- **Contact management** — Name, phone, email, job title, company, where you met, free-form notes
- **Profile photos** — Add a photo from your gallery (e.g. a saved LinkedIn picture). Photos are stored as base64 and included in exports
- **Custom fields** — Add your own categories (LinkedIn URL, hobby, relationship context, etc.). Custom fields apply globally to all contacts; any field can be left blank
- **Birthday notifications** — Receive a native Android notification at 9 AM on each contact's birthday
- **Global search** — Search across all fields instantly
- **Export / Import (JSON)** — Back up and restore your entire contact database, including photos and custom fields. Duplicates are automatically filtered on import
- **Quick actions** — Call, text, or email a contact directly from their profile
- **Bilingual UI** — Switch between English (default) and French from the in-app settings

---

## Installation guide (Android)

### Prerequisites

You will need a **computer** (Windows, macOS, or Linux) with the following installed:

1. **Node.js v18 or later** — https://nodejs.org/ (LTS version recommended)
   Verify with `node --version` (should show `v18.x.x` or higher).

2. **A free Expo account** — https://expo.dev/signup

3. **Git** (optional but recommended) — https://git-scm.com/downloads

---

### Step 1 — Install the Expo build tools

```bash
npm install -g eas-cli
eas login
```

> **`npm` not found?** Node.js is not installed or not in your PATH. On Windows, close and reopen PowerShell after installing Node.js.
>
> **Permission errors on macOS/Linux?** Prefix with `sudo`: `sudo npm install -g eas-cli`

---

### Step 2 — Set up the project

```bash
cd Birthact
npm install
```

> **`npm install` errors with `ETARGET No matching version found`?**
> This happens when a package version doesn't exist for your Expo SDK. Fix it with:
> ```bash
> npx expo install --check
> ```
> Then run `npm install` again. `npx expo install` automatically picks versions compatible with your SDK.

---

### Step 3 — Link the project to your Expo account

```bash
eas init
```

This writes a unique `projectId` into `app.json`.

> **"Project already linked" but the build fails with "Invalid UUID appId"?**
> The `projectId` is a placeholder, not a real UUID. Manually delete the entire `extra.eas` block from `app.json`, then run `eas init` again to let it generate a valid UUID.

---

### Step 4 — Build the APK

```bash
eas build -p android --profile preview
```

During the first build, EAS will ask:
- **"Generate a new Android Keystore?"** → Yes
- **Application id** → Press Enter to accept `com.birthact.app`

The build takes **10–15 minutes**. Once complete, EAS displays a download URL for the `.apk` file.

---

### Step 5 — Troubleshooting common build failures

**Always use `npx expo install` to add packages.** Manual version pinning often causes incompatibilities with the Expo SDK.

| Error in build logs | Fix |
|---|---|
| `Unable to resolve module expo-asset` | `npx expo install expo-asset` |
| `Unable to resolve module expo-font` | `npx expo install expo-font` |
| `Unable to resolve module <name>` | `npx expo install <name>` |
| `No matching version found for <package>@<version>` | Remove that line from `package.json`, run `npx expo install <package>` |
| `Bundle JavaScript build phase` (under 30s) | A JS module is missing or `package-lock.json` is out of sync. Run `npm install` and commit the lockfile |
| `Invalid UUID appId` | Delete `extra.eas` from `app.json`, run `eas init` |
| `Manifest merger failed` | Conflicting permissions in `app.json`; check for duplicates |

After any fix, always:
```bash
git add .
git commit -m "Fix build"
git push
eas build -p android --profile preview
```

---

### Step 6 — Install the APK on your phone

1. Open the download URL from the build output **on your Android phone**
2. Download and tap the `.apk` file
3. If blocked: **Settings → Apps → Special app access → Install unknown apps** → enable for your browser

---

### Step 7 — Grant permissions

On first launch, Birthact requests permission to send notifications. **Accept** to receive birthday reminders.

---

## Diagnosing app crashes

If the app crashes on launch or during use, here is how to find the cause:

### Method A — Development mode (recommended)

Run the app via Expo Go to see JavaScript errors with full stack traces:

```bash
npx expo start
```

1. Install **Expo Go** on your Android phone (Play Store)
2. Scan the QR code from the terminal with Expo Go
3. Errors display in red, on screen, with line numbers

### Method B — Android Logcat (for native crashes)

With your phone connected via USB and **USB debugging** enabled:

```bash
adb logcat *:E ReactNativeJS:V
```

Relaunch the app and watch the terminal — crash stack traces appear in real time.

To enable USB debugging:
- **Settings → About phone** → tap "Build number" 7 times to unlock Developer options
- **Settings → Developer options** → enable **USB debugging**

### Method C — Android crash reports

**Settings → Apps → Birthact → Storage** → some devices expose a "Bug report" or "Crash info" section.

---

## Switching phones

1. On your current phone: open Birthact → tap **Export** → share the JSON file (Google Drive, email, etc.)
2. On your new phone: install the Birthact APK → tap **Import** → select the JSON file
3. All contacts, custom fields, and profile photos are restored. Duplicates are automatically skipped

---

## Project structure

```
Birthact/
├── App.js                              # Entry point, navigation, state management
├── app.json                            # Expo configuration
├── eas.json                            # EAS Build profiles
├── package.json                        # Dependencies
├── babel.config.js
├── assets/                             # App icon and splash screen
└── src/
    ├── components/
    │   └── ContactCard.js              # Contact list card component
    ├── screens/
    │   ├── HomeScreen.js               # Main screen (list, search, tabs)
    │   ├── ContactFormScreen.js        # Add / edit contact form
    │   ├── ContactDetailScreen.js      # Contact detail view
    │   ├── FieldManagerScreen.js       # Custom field management
    │   └── SettingsScreen.js           # Language settings
    └── utils/
        ├── constants.js                # Colors, storage keys, default fields
        ├── helpers.js                  # Date utilities, sorting, formatting
        ├── i18n.js                     # English and French translations
        ├── notifications.js            # Birthday notification scheduling
        └── storage.js                  # AsyncStorage read/write operations
```

---

## Export format

```json
{
  "app": "Birthact",
  "version": "1.0.0",
  "exportedAt": "2026-05-10T12:00:00.000Z",
  "contacts": [...],
  "fields": [...]
}
```

Profile photos are embedded as base64 strings within each contact object.

---

## Technology stack

- **React Native** + **Expo SDK 52**
- **AsyncStorage** — Local persistent storage
- **Expo Notifications** — Scheduled birthday reminders
- **Expo Image Picker** — Profile photo selection
- **Expo File System + Sharing** — JSON export
- **Expo Document Picker** — JSON import

---

Designed by Raphaël · Code generated with the assistance of Claude (Anthropic) · Birthact v1.0.0
