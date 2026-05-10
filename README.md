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

## Quick install (pre-built APK)

If you just want to try the app without building it yourself, download the latest APK here:

➡️ **[Download Birthact APK](https://expo.dev/accounts/raphaeldelamaire/projects/birthact/builds/503d9206-dd28-41cb-bbf7-44adf638d314)**

1. Open the link **on your Android phone** and tap the download button
2. Tap the downloaded `.apk` file to install
3. If Android blocks the install, see Step 6 in the build guide below

---

## Installation guide (build from source)

This guide is written to avoid every known pitfall. **Follow the steps in order. Do not skip ahead.**

### Prerequisites

Install on your **computer** (Windows, macOS, or Linux):

1. **Node.js v18 or later** — https://nodejs.org/ (LTS version recommended)
   After installation, open a **new** terminal and verify:
   ```bash
   node --version
   ```
   You should see `v18.x.x` or higher. If you see "command not found", reopen your terminal — the PATH needs to refresh.

2. **A free Expo account** — https://expo.dev/signup

3. **Git** — https://git-scm.com/downloads

---

### Step 1 — Install the Expo build tools

```bash
npm install -g eas-cli
eas login
```

Enter your Expo credentials when prompted.

> **Permission errors on macOS/Linux:** prefix with `sudo`:
> ```bash
> sudo npm install -g eas-cli
> ```

---

### Step 2 — Clone or download the project

If using Git:
```bash
git clone <repository-url>
cd Birthact
```

Otherwise, download the project and open a terminal inside the `Birthact` folder.

---

### Step 3 — Install dependencies the safe way

**This is the most important step.** Manually editing version numbers in `package.json` causes most installation errors. Always let Expo choose the versions.

```bash
npm install
```

If this succeeds with no errors, skip to Step 4.

> **If you see `ETARGET No matching version found for ...`:**
>
> This means a package version listed in `package.json` doesn't exist in the npm registry. Fix it with:
>
> ```bash
> npx expo install --check
> ```
>
> This compares your `package.json` against the versions known to be compatible with your Expo SDK and offers to fix them automatically. Press `y` to accept the fixes.
>
> Then run `npm install` again.

> **If `npm install` is missing a specific Expo package** (e.g. `expo-notifications`, `expo-asset`, `expo-font`):
>
> Add the missing packages using `npx expo install` — never `npm install`:
>
> ```bash
> npx expo install expo-asset expo-constants expo-modules-core expo-font expo-status-bar expo-notifications expo-file-system expo-image-picker expo-sharing expo-document-picker @react-native-async-storage/async-storage react-native-safe-area-context @expo/vector-icons
> ```
>
> `npx expo install` automatically picks the version compatible with your SDK. This is the recommended way to add any Expo package to a project.

---

### Step 4 — Link the project to your Expo account

Open `app.json` and locate the `extra` block at the bottom:

```json
"extra": {
  "eas": {
    "projectId": "..."
  }
}
```

**Delete this entire `extra` block** (including the trailing comma above it if needed to keep valid JSON). Save the file.

Then run:

```bash
eas init
```

EAS will create or link the project under your Expo account and **automatically write a real UUID** into `app.json`. The output should display something like:

```
✔ Project successfully linked (ID: <a-real-uuid-here>)
```

> **If `eas init` says "Project already linked":** the placeholder `projectId` was not deleted from `app.json`. Re-open `app.json`, remove the `extra` block, save, and run `eas init` again.

---

### Step 5 — Build the APK

```bash
eas build -p android --profile preview
```

During the first build, EAS asks:
- **"Generate a new Android Keystore?"** → press Enter for **Yes**
- **Application id** → press Enter to accept `com.birthact.app`

The build runs in the Expo cloud and takes **10–15 minutes**. You do not need Android Studio. Once complete, EAS displays a download URL for the `.apk` file.

> **If the build fails with `Invalid UUID appId`:** the `projectId` in `app.json` is a placeholder, not a real UUID. Repeat Step 4.
>
> **If the build fails during "Bundle JavaScript" in under 30 seconds:** a JS module is missing or `package-lock.json` is out of sync. Run:
> ```bash
> npx expo install --check
> npm install
> ```
> Then retry the build.

---

### Step 6 — Install the APK on your phone

1. Open the download URL from the build output **on your Android phone** in a browser
2. Download the `.apk` file
3. Tap the file to install

> **If Android blocks the install with "For your security..." or "Unknown sources":**
>
> 1. **Settings → Apps → Special app access → Install unknown apps** (the menu path varies by manufacturer; on Samsung it may be **Settings → Biometrics and security → Install unknown apps**)
> 2. Select the browser you used to download the APK (Chrome, Samsung Internet, etc.)
> 3. Enable **Allow from this source**
> 4. Tap the downloaded APK again

> **If the install fails with "App not installed":** uninstall any previous version of Birthact, then retry.

---

### Step 7 — Grant permissions

On first launch, Birthact requests permission to send notifications. **Accept** to receive birthday reminders. The app also requests gallery access the first time you add a profile photo.

---

## Updating the app after code changes

After modifying any code, the workflow is:

```bash
git add .
git commit -m "Description of your changes"
git push
eas build -p android --profile preview
```

You do not need to re-run `eas init` or modify `app.json` for subsequent builds.

---

## Diagnosing app crashes

If the app crashes on launch or during use, here is how to find the cause.

### Method A — Development mode (recommended)

Run the app via Expo Go to see JavaScript errors with full stack traces:

```bash
npx expo start
```

1. Install **Expo Go** on your Android phone (Play Store)
2. Scan the QR code from the terminal using Expo Go
3. Errors display in red, on screen, with line numbers

### Method B — Android Logcat (for native crashes)

With your phone connected via USB and **USB debugging** enabled:

```bash
adb logcat *:E ReactNativeJS:V
```

Relaunch the app and watch the terminal — crash stack traces appear in real time.

To enable USB debugging on your phone:
- **Settings → About phone** → tap "Build number" 7 times to unlock Developer options
- **Settings → Developer options** → enable **USB debugging**

### Method C — Android bug report

If the app crashes silently and you cannot use the methods above:

- **Settings → About phone → Software information** → tap **Build number** 7 times to enable Developer options
- **Settings → Developer options → Bug report**
- Select **Interactive report**, wait for it to generate, then share the ZIP file

The bug report contains the exact crash stack trace inside the `dumpstate.txt` file, searchable for your app package name (`com.birthact.app`).

---

## Switching phones

1. On your current phone: open Birthact → tap **Export** → share the JSON file (Google Drive, email, etc.)
2. On your new phone: install the Birthact APK → tap **Import** → select the JSON file
3. All contacts, custom fields, and profile photos are restored. Duplicates are automatically skipped

---

## Project structure

```
Birthact/
├── index.js                            # Entry point — registers App as root component
├── App.js                              # Main app component, navigation, state
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

Profile photos are embedded as base64 strings within each contact object, ensuring portability across devices.

---

## Technology stack

- **React Native** + **Expo SDK 52**
- **AsyncStorage** — Local persistent storage
- **Expo Notifications** — Scheduled birthday reminders
- **Expo Image Picker** — Profile photo selection
- **Expo File System + Sharing** — JSON export
- **Expo Document Picker** — JSON import

---

## Troubleshooting reference

| Error | Cause | Fix |
|---|---|---|
| `ETARGET No matching version found` | Hardcoded version in `package.json` doesn't exist | `npx expo install --check` |
| `Invalid UUID appId` | Placeholder `projectId` in `app.json` | Delete `extra` block in `app.json`, run `eas init` |
| `Project already linked` | Old `projectId` blocking `eas init` | Delete `extra` block in `app.json`, run `eas init` |
| `Failed to resolve plugin for module "expo-notifications"` | Package not in `node_modules` | `npm install`, then verify with `dir node_modules\expo-notifications` |
| `Unable to resolve module <name>` | Missing package | `npx expo install <name>` |
| `Bundle JavaScript` fails in under 30s | `package-lock.json` out of sync | `npm install` and commit the lockfile |
| `"main" has not been registered` | Missing `index.js` with `registerRootComponent` | Ensure `main` in `package.json` is `index.js` |
| App crashes immediately on launch | Native/JS error | Use the diagnostic methods above |

---

Designed by Raphaël · Code generated with the assistance of Claude (Anthropic) · Birthact v1.0.0
