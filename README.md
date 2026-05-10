# 🎯 Birthact

A personal networking app for Android. Keep track of the people you meet, never miss a birthday, and maintain your professional network effortlessly.

> **Disclosure:** The source code for this application was generated with the assistance of **Claude (Anthropic)**, an AI assistant. The product concept, specifications, and functional decisions are my own — the code implementation was AI-assisted. This project reflects my ability to design a product, define requirements, and leverage AI tooling to bring a vision to life.

---

## Features

- **Contact management** — Store name, phone, email, job title, company, where you met, and free-form notes for every contact.
- **Profile photos** — Add a photo from your gallery (e.g. a saved LinkedIn picture). Photos are stored as base64 and included in exports.
- **Custom fields** — Add your own categories (LinkedIn URL, hobby, relationship context, etc.). Custom fields apply globally to all contacts; any field can be left blank.
- **Birthday notifications** — Receive a native Android notification at 9 AM on each contact's birthday.
- **Global search** — Search across all fields instantly.
- **Export / Import (JSON)** — Back up and restore your entire contact database, including photos and custom fields. Duplicates are automatically filtered on import.
- **Quick actions** — Call, text, or email a contact directly from their profile.
- **Bilingual UI** — Switch between English and French from the in-app settings.

---

## Installation guide (Android)

### Prerequisites

You will need a **computer** (Windows, macOS, or Linux) with the following installed:

1. **Node.js v18 or later**
   - Download from https://nodejs.org/ (LTS version recommended).
   - After installation, verify by running in a terminal:
     ```bash
     node --version
     ```
     You should see `v18.x.x` or higher.

2. **A free Expo account**
   - Sign up at https://expo.dev/signup

3. **Git** (optional but recommended)
   - Download from https://git-scm.com/downloads

---

### Step 1 — Install the Expo build tools

Open a terminal (PowerShell on Windows, Terminal on macOS/Linux):

```bash
npm install -g eas-cli
```

Then log in to your Expo account:

```bash
eas login
```

> **Troubleshooting — `npm` not found:**
> This means Node.js is not installed or not in your PATH. On Windows, close and reopen PowerShell after installing Node.js. On macOS/Linux, try opening a new terminal window.

> **Troubleshooting — permission errors on macOS/Linux:**
> Prefix the command with `sudo`:
> ```bash
> sudo npm install -g eas-cli
> ```

---

### Step 2 — Set up the project

Navigate to the project folder and install dependencies:

```bash
cd birthact-app
npm install
```

> **Troubleshooting — `npm install` fails or hangs:**
> 1. Delete the `node_modules` folder and `package-lock.json`, then run `npm install` again.
> 2. Make sure you are inside the `birthact-app` directory (not a parent folder).
> 3. Check your internet connection — npm needs to download packages.

---

### Step 3 — Build the APK

```bash
eas build -p android --profile preview
```

This command sends your project to the Expo cloud build service. **You do not need Android Studio.**

During the first build, EAS will ask a few questions:
- **"Generate a new Android Keystore?"** → Yes
- **"What would you like your Android application id to be?"** → Press Enter to accept the default (`com.birthact.app`)

The build typically takes **10–15 minutes**. Once complete, EAS will display a download URL for the `.apk` file.

> **Troubleshooting — "Not logged in" error:**
> Run `eas login` again and enter your Expo credentials.

> **Troubleshooting — "EAS project not found" or "slug" error:**
> Run `eas init` inside the project folder before building. This links the project to your Expo account.

> **Troubleshooting — Build fails with dependency errors:**
> 1. Make sure you ran `npm install` successfully (no errors in the output).
> 2. Try clearing the cache: `npx expo start --clear`, then cancel (Ctrl+C) and re-run the build.
> 3. Check that your Node.js version is 18+.

---

### Step 4 — Install the APK on your phone

1. Copy the download URL from the build output.
2. Open the URL **on your Android phone** using Chrome or any browser.
3. Download the `.apk` file.
4. Tap the downloaded file to install it.

> **Troubleshooting — "Install blocked" or "Unknown sources":**
> Android blocks apps from outside the Play Store by default. To allow installation:
> 1. Go to **Settings → Apps → Special app access → Install unknown apps** (path varies by device).
> 2. Select your browser (e.g. Chrome).
> 3. Enable **"Allow from this source"**.
> 4. Try tapping the APK again.

> **Troubleshooting — "App not installed" error:**
> - Make sure you are not trying to install a debug build over a release build (or vice versa). Uninstall any previous version of Birthact first.
> - Check that your phone has enough storage space.

---

### Step 5 — Grant permissions

On first launch, Birthact will request permission to send notifications. **Accept this** to receive birthday reminders.

---

## Development mode (optional)

To test and iterate on the app in real time without building an APK:

1. Install **Expo Go** on your Android phone from the Play Store.
2. Run the development server on your computer:
   ```bash
   npx expo start
   ```
3. Scan the QR code displayed in the terminal using Expo Go.

> **Note:** Some features (such as notifications) may behave differently in Expo Go compared to a standalone APK build.

---

## Switching phones

1. On your current phone, open Birthact → tap **Export** → share the JSON file to Google Drive, email, or any cloud storage.
2. On your new phone, install the Birthact APK → tap **Import** → select the JSON file.
3. All contacts, custom fields, and profile photos will be restored. Duplicates are automatically skipped.

---

## Project structure

```
birthact-app/
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

The exported file is a standard JSON document:

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

Designed by Raphaël · Code generated with the assistance of Claude (Anthropic) · Birthact v1.0.0
