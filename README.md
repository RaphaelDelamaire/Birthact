# 🎯 Birthact

A personal networking app for Android. Keep track of the people you meet, never miss a birthday, and see where your contacts are from on an interactive world map.

> **Disclosure:** The source code for this application was generated with the assistance of **Claude (Anthropic)**, an AI assistant. The product concept, specifications, and functional decisions are my own — the code implementation was AI-assisted.

---

## Features

- **Contact management** — Name, phone, email, job title, company, city, where you met, free-form notes
- **Profile photos** — Add a photo from your gallery (e.g. a saved LinkedIn picture)
- **Custom fields** — Add your own categories (LinkedIn URL, hobby, relationship context, etc.)
- **Birthday notifications** — Native Android notification at 9 AM on each contact's birthday
- **Date input** — Dates auto-format as you type digits (DD/MM/YYYY)
- **Phone with country picker** — Select a country (flag + dial code) for each phone number; 120+ countries; default country configurable in settings
- **Global search** — Search across all fields instantly
- **Birthday tab** — Contacts sorted by upcoming birthday; contacts without a birthday shown at the bottom
- **World map** — Interactive map (CartoDB Positron tiles) showing your contacts' addresses with per-person pins and automatic clustering. Uses OpenStreetMap (no API key required)
- **Export / Import (JSON)** — Full backup and restore, including photos and custom fields
- **Quick actions** — Call, text, or email directly from a contact's profile
- **Multilingual UI** — English, French, Spanish, German; switchable from settings
- **Dark mode** — Toggle between light and dark theme in settings
- **Android back button** — Hardware back button works throughout the app

---

## Quick install (pre-built APK)

If you just want to try the app without building it yourself, download the latest APK here:

➡️ **[Download Birthact APK](https://expo.dev/accounts/raphaeldelamaire/projects/birthact/builds/a344b75c-5a36-4ca7-a18c-d40272d5e8be)**

1. Open the link **on your Android phone** and tap the download button
2. Tap the downloaded `.apk` file to install
3. If Android blocks the install, see Step 6 in the build guide below

---

## Installation guide (build from source)

### Prerequisites

Install on your **computer** (Windows, macOS, or Linux):

1. **Node.js v18 or later** — https://nodejs.org/
   ```bash
   node --version  # should show v18.x.x or higher
   ```

2. **A free Expo account** — https://expo.dev/signup

3. **Git** — https://git-scm.com/downloads

---

### Step 1 — Install the Expo build tools

```bash
npm install -g eas-cli
eas login
```

> macOS/Linux permission error: prefix with `sudo`

---

### Step 2 — Clone or download the project

```bash
git clone <repository-url>
cd Birthact
```

---

### Step 3 — Install dependencies

```bash
npm install
```

> **If you see `ETARGET No matching version found`:**
> ```bash
> npx expo install --check
> npm install
> ```

> **To install all Expo packages manually:**
> ```bash
> npx expo install expo-asset expo-constants expo-modules-core expo-font expo-status-bar expo-notifications expo-file-system expo-image-picker expo-sharing expo-document-picker @react-native-async-storage/async-storage react-native-safe-area-context react-native-webview @expo/vector-icons
> ```

---

### Step 4 — Link the project to your Expo account

Open `app.json` and delete the `extra` block at the bottom (including any trailing comma). Then:

```bash
eas init
```

EAS writes a real UUID into `app.json`. You should see:
```
✔ Project successfully linked (ID: <uuid>)
```

---

### Step 5 — Build the APK

```bash
eas build -p android --profile preview
```

The build runs in the Expo cloud (~10–15 min). On first build, accept the keystore and app ID prompts. Once complete, EAS gives a download URL for the `.apk`.

---

### Step 6 — Install the APK on your phone

1. Open the download URL on your Android phone
2. Download and tap the `.apk` to install

> **If Android blocks the install:** Settings → Apps → Special app access → Install unknown apps → enable for your browser

---

### Step 7 — Grant permissions

Accept notification permission on first launch to receive birthday reminders.

---

## Map feature — internet requirement

The world map uses [OpenStreetMap](https://www.openstreetmap.org/) tiles and [Nominatim](https://nominatim.org/) for city geocoding. An internet connection is required the first time each city is looked up. Coordinates are cached locally after that, so the map works offline for already-geocoded cities.

---

## Updating after code changes

```bash
git add .
git commit -m "Description"
git push
eas build -p android --profile preview
```

---

## Diagnosing crashes

### Development mode
```bash
npx expo start
```
Scan the QR code with **Expo Go** (Play Store) to see JS errors with stack traces.

### Logcat (native crashes)
```bash
adb logcat *:E ReactNativeJS:V
```
USB debugging must be enabled: Settings → About phone → tap Build number 7 times → Developer options → USB debugging.

---

## Switching phones

1. Current phone: open Birthact → Settings → Export → share the JSON file
2. New phone: install APK → Settings → Import → select the JSON file

---

## Project structure

```
Birthact/
├── index.js
├── App.js                              # Navigation, state, BackHandler
├── app.json
├── eas.json
├── package.json
├── assets/                             # App icon, adaptive icon, splash
└── src/
    ├── components/
    │   └── ContactCard.js
    ├── screens/
    │   ├── HomeScreen.js               # Contacts + Birthdays tabs, map button
    │   ├── ContactFormScreen.js        # Add/edit form with date picker + country picker
    │   ├── ContactDetailScreen.js
    │   ├── FieldManagerScreen.js
    │   ├── SettingsScreen.js           # Language, default country, export/import, fields
    │   └── MapScreen.js                # Interactive world map (Leaflet + WebView)
    └── utils/
        ├── constants.js
        ├── helpers.js                  # Date formatting, sortByBirthday, etc.
        ├── i18n.js                     # EN/FR translations
        ├── countries.js                # Country list with flags and dial codes
        ├── notifications.js
        └── storage.js
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

---

## Technology stack

- **React Native** + **Expo SDK 52**
- **AsyncStorage** — Local persistent storage
- **Expo Notifications** — Scheduled birthday reminders
- **Expo Image Picker** — Profile photo selection
- **Expo File System + Sharing** — JSON export
- **Expo Document Picker** — JSON import
- **react-native-webview** — World map (Leaflet.js + OpenStreetMap)

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `ETARGET No matching version found` | Incompatible version in `package.json` | `npx expo install --check` |
| `Invalid UUID appId` | Placeholder `projectId` in `app.json` | Delete `extra` block, run `eas init` |
| `Unable to resolve module <name>` | Missing package | `npx expo install <name>` |
| `Bundle JavaScript` fails in under 30s | `package-lock.json` out of sync | `npm install` |
| Map shows blank screen | Missing `react-native-webview` | `npx expo install react-native-webview` |
| Map shows no markers | City names not geocoded yet | Requires internet on first use |

---

Designed by Raphaël · Code assisted by Claude (Anthropic) · Birthact v1.2.0
