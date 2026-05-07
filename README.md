# 🎯 Birthact

**Application de networking personnel** — Gère tes contacts pro, suis les anniversaires, et ne perds jamais le fil de ton réseau.

> ⚠️ **Transparence** : Le code source de cette application a été généré avec l'aide de **Claude (Anthropic)**, une intelligence artificielle. L'idée, le concept, le cahier des charges et les choix fonctionnels sont les miens — la rédaction du code a été assistée par IA. Ce projet représente ma capacité à concevoir un produit, définir des spécifications et piloter un outil d'IA pour concrétiser une vision.

---

## Fonctionnalités

- **Gestion de contacts** : nom, prénom, téléphone, email, métier, entreprise, lieu de rencontre, notes
- **Photos de profil** : ajoute une photo depuis ta galerie (ex : screenshot LinkedIn) — sauvegardée dans les données et incluse dans l'export
- **Champs personnalisés** : ajoute tes propres catégories (LinkedIn, hobby, relation...) qui s'appliquent à tous les contacts
- **Notifications d'anniversaire** : reçois une notif à 9h le jour de l'anniversaire de chaque contact
- **Recherche globale** : cherche sur n'importe quel champ
- **Export / Import JSON** : sauvegarde et restaure tous tes contacts (photos incluses en base64)
- **Actions rapides** : appeler, envoyer un SMS ou un email directement depuis la fiche contact

---

## Installation sur ton téléphone Android

### Prérequis

Tu as besoin d'un **ordinateur** (Windows, Mac ou Linux) avec :

1. **Node.js** (version 18 ou plus) → https://nodejs.org/
2. **Un compte Expo** (gratuit) → https://expo.dev/signup

### Étape 1 — Installer les outils

Ouvre un terminal (ou PowerShell sur Windows) et tape :

```bash
# Installer EAS CLI (le builder d'Expo)
npm install -g eas-cli

# Se connecter à Expo
eas login
```

### Étape 2 — Préparer le projet

```bash
# Va dans le dossier du projet (ajuste le chemin selon où tu l'as décompressé)
cd birthact-app

# Installer les dépendances
npm install
```

### Étape 3 — Builder l'APK

```bash
# Lancer le build APK (se fait dans le cloud Expo, pas besoin d'Android Studio !)
eas build -p android --profile preview
```

> ⏳ Le premier build prend environ **10-15 minutes**. Expo te demande de confirmer la création du package Android — dis oui à tout.

### Étape 4 — Installer sur ton téléphone

1. Une fois le build terminé, Expo te donne un **lien de téléchargement** de l'APK
2. Ouvre ce lien **sur ton téléphone Android** (ou transfère le fichier .apk)
3. Tape sur le fichier pour l'installer
4. Si Android bloque l'installation → va dans **Paramètres > Sécurité** et active **"Sources inconnues"** ou **"Installer des apps inconnues"** pour ton navigateur

### Étape 5 — Profiter ! 🎉

L'app est installée. Au premier lancement, elle te demandera la permission d'envoyer des notifications — accepte pour recevoir les rappels d'anniversaire.

---

## Mode développement (optionnel)

Si tu veux tester et modifier l'app en temps réel :

```bash
# Installer l'app Expo Go sur ton téléphone (Play Store)
# Puis lancer le serveur de dev :
npx expo start

# Scanne le QR code avec Expo Go
```

---

## Structure du projet

```
birthact-app/
├── App.js                          # Point d'entrée, navigation
├── app.json                        # Config Expo
├── eas.json                        # Config de build
├── package.json                    # Dépendances
├── babel.config.js
├── assets/                         # Icône et splash screen
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash.png
│   └── favicon.png
└── src/
    ├── components/
    │   └── ContactCard.js          # Carte de contact
    ├── screens/
    │   ├── HomeScreen.js           # Écran principal (liste + recherche)
    │   ├── ContactFormScreen.js    # Formulaire ajout/édition
    │   ├── ContactDetailScreen.js  # Fiche contact détaillée
    │   └── FieldManagerScreen.js   # Gestion des champs personnalisés
    └── utils/
        ├── constants.js            # Couleurs, champs par défaut
        ├── helpers.js              # Fonctions utilitaires (dates, tri...)
        ├── notifications.js        # Notifications d'anniversaire
        └── storage.js              # Stockage local (AsyncStorage)
```

---

## Format d'export

Le fichier exporté est un JSON avec cette structure :

```json
{
  "app": "Birthact",
  "version": "1.0.0",
  "exportedAt": "2026-05-07T12:00:00.000Z",
  "contacts": [...],
  "fields": [...]
}
```

Tu peux importer ce fichier sur un autre téléphone — les doublons sont automatiquement filtrés.

---

## Technologies

- **React Native** + **Expo SDK 52**
- **AsyncStorage** pour le stockage local
- **Expo Notifications** pour les rappels d'anniversaire
- **Expo Image Picker** pour les photos de profil
- **Expo File System + Sharing** pour l'export
- **Expo Document Picker** pour l'import

---

## Changer de téléphone sans rien perdre

1. Sur l'ancien téléphone : ouvre Birthact → **Exporter** → envoie-toi le fichier JSON (Drive, email, WhatsApp...)
2. Sur le nouveau téléphone : installe l'APK → **Importer** → sélectionne le fichier
3. Tous tes contacts, champs personnalisés **et photos de profil** sont restaurés (les photos sont encodées en base64 dans le fichier JSON)

---

Conçu par Raphaël · Code généré avec l'aide de Claude (Anthropic) · Birthact v1.0.0
