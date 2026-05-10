export const TRANSLATIONS = {
  en: {
    // Home
    appName: 'Birthact',
    contactCount: (n) => `${n} contact${n !== 1 ? 's' : ''}`,
    birthdayToday: (n) => `${n} birthday${n !== 1 ? 's' : ''} today`,
    searchPlaceholder: 'Search contacts...',
    export: 'Export',
    import: 'Import',
    fields: 'Fields',
    contacts: 'Contacts',
    birthdays: 'Birthdays',
    noBirthdaysTitle: 'No birthdays registered',
    noBirthdaysSub: 'Add a birthday date to your contacts',
    noResultsTitle: 'No results',
    noResultsSub: 'Try a different search term',
    noContactsTitle: 'No contacts yet',
    noContactsSub: 'Tap + to add your first contact',
    birthdayTodayBadge: 'Birthday today!',
    birthdayInDays: (d) => `In ${d} day${d > 1 ? 's' : ''}`,
    upcomingBirthdays: 'Upcoming birthdays',
    allContacts: 'All contacts',

    // Contact form
    newContact: 'New contact',
    editContact: 'Edit contact',
    addContact: 'Add contact',
    save: 'Save',
    deleteContact: 'Delete contact',
    deleteConfirmTitle: 'Delete contact',
    deleteConfirmMsg: (name) => `Are you sure you want to delete ${name}?`,
    cancel: 'Cancel',
    delete: 'Delete',
    fieldRequired: 'Required field',
    fieldRequiredMsg: 'Please enter at least a first or last name.',
    addPhoto: 'Add a photo',
    photoHint: 'Tip: save the LinkedIn photo to your gallery, then select it here',

    // Contact detail
    contact: 'Contact',
    happyBirthday: 'Happy birthday!',
    yearsOld: (n) => `${n} years old`,
    call: 'Call',
    sms: 'SMS',
    email: 'Email',

    // Field manager
    manageFields: 'Manage fields',
    currentFields: 'Current fields',
    addField: 'Add a field',
    fieldName: 'Field name',
    fieldNamePlaceholder: 'e.g. LinkedIn, Hobby, Relationship...',
    fieldType: 'Type',
    addThisField: 'Add this field',
    saveFields: 'Save',
    deleteFieldTitle: 'Delete field',
    deleteFieldMsg: 'This field will be removed from all contacts. Continue?',
    fieldNameRequired: 'Name required',
    fieldNameRequiredMsg: 'Please enter a name for the new field.',

    // Field types
    typeText: 'Text',
    typePhone: 'Phone',
    typeEmail: 'Email',
    typeDate: 'Date',
    typeUrl: 'URL / Link',
    typeMultiline: 'Long text',

    // Default field labels
    lastName: 'Last name',
    firstName: 'First name',
    phone: 'Phone',
    birthday: 'Birthday',
    metAt: 'Where we met',
    job: 'Job / Position',
    company: 'Company',
    emailField: 'Email',
    notes: 'Notes',

    // Import / Export
    exportError: 'Unable to export data.',
    importSuccess: (n) => `${n} new contact${n !== 1 ? 's' : ''} imported.`,
    importError: 'Invalid or corrupted file.',
    error: 'Error',
    importSuccessTitle: 'Import successful',
    exportTitle: 'Export Birthact contacts',

    // Notifications
    birthdayNotifTitle: (name) => `🎂 ${name}'s birthday!`,
    birthdayNotifBody: (name) => `Don't forget to wish ${name} a happy birthday today!`,
    channelName: 'Birthdays',
    permissionRequired: 'Permission required',
    permissionMsg: 'Gallery access is required to add a photo.',

    // Settings
    language: 'Language',
    settings: 'Settings',
    english: 'English',
    french: 'Français',
  },

  fr: {
    appName: 'Birthact',
    contactCount: (n) => `${n} contact${n !== 1 ? 's' : ''}`,
    birthdayToday: (n) => `${n} anniversaire${n !== 1 ? 's' : ''} aujourd'hui`,
    searchPlaceholder: 'Rechercher un contact...',
    export: 'Exporter',
    import: 'Importer',
    fields: 'Champs',
    contacts: 'Contacts',
    birthdays: 'Anniversaires',
    noBirthdaysTitle: 'Aucun anniversaire enregistré',
    noBirthdaysSub: 'Ajoutez une date à vos contacts',
    noResultsTitle: 'Aucun résultat',
    noResultsSub: 'Essayez un autre terme',
    noContactsTitle: 'Aucun contact',
    noContactsSub: 'Appuyez sur + pour commencer',
    birthdayTodayBadge: 'Anniversaire aujourd\'hui !',
    birthdayInDays: (d) => `Dans ${d} jour${d > 1 ? 's' : ''}`,
    upcomingBirthdays: 'Prochains anniversaires',
    allContacts: 'Tous les contacts',

    newContact: 'Nouveau contact',
    editContact: 'Modifier',
    addContact: 'Ajouter le contact',
    save: 'Enregistrer',
    deleteContact: 'Supprimer ce contact',
    deleteConfirmTitle: 'Supprimer le contact',
    deleteConfirmMsg: (name) => `Voulez-vous vraiment supprimer ${name} ?`,
    cancel: 'Annuler',
    delete: 'Supprimer',
    fieldRequired: 'Champ requis',
    fieldRequiredMsg: 'Veuillez entrer au moins un nom ou prénom.',
    addPhoto: 'Ajouter une photo',
    photoHint: 'Astuce : sauvegardez la photo LinkedIn dans votre galerie puis sélectionnez-la ici',

    contact: 'Contact',
    happyBirthday: 'Joyeux anniversaire !',
    yearsOld: (n) => `${n} ans`,
    call: 'Appeler',
    sms: 'SMS',
    email: 'Email',

    manageFields: 'Gérer les champs',
    currentFields: 'Champs actuels',
    addField: 'Ajouter un champ',
    fieldName: 'Nom du champ',
    fieldNamePlaceholder: 'Ex : LinkedIn, Hobby, Relation...',
    fieldType: 'Type',
    addThisField: 'Ajouter ce champ',
    saveFields: 'Sauvegarder',
    deleteFieldTitle: 'Supprimer le champ',
    deleteFieldMsg: 'Ce champ sera supprimé pour tous les contacts. Continuer ?',
    fieldNameRequired: 'Nom requis',
    fieldNameRequiredMsg: 'Entrez un nom pour le nouveau champ.',

    typeText: 'Texte',
    typePhone: 'Téléphone',
    typeEmail: 'Email',
    typeDate: 'Date',
    typeUrl: 'URL / Lien',
    typeMultiline: 'Texte long',

    lastName: 'Nom',
    firstName: 'Prénom',
    phone: 'Téléphone',
    birthday: 'Anniversaire',
    metAt: 'Lieu de rencontre',
    job: 'Métier / Poste',
    company: 'Entreprise',
    emailField: 'Email',
    notes: 'Notes',

    exportError: 'Impossible d\'exporter les données.',
    importSuccess: (n) => `${n} nouveau(x) contact(s) importé(s).`,
    importError: 'Fichier invalide ou corrompu.',
    error: 'Erreur',
    importSuccessTitle: 'Import réussi',
    exportTitle: 'Exporter contacts Birthact',

    birthdayNotifTitle: (name) => `🎂 Anniversaire de ${name} !`,
    birthdayNotifBody: (name) => `N'oubliez pas de souhaiter un joyeux anniversaire à ${name} aujourd'hui !`,
    channelName: 'Anniversaires',
    permissionRequired: 'Permission requise',
    permissionMsg: 'L\'accès à la galerie est nécessaire pour ajouter une photo.',

    language: 'Langue',
    settings: 'Réglages',
    english: 'English',
    french: 'Français',
  },
};

/**
 * Returns the localized label for a given field ID.
 */
export function getFieldLabel(fieldId, t) {
  const map = {
    lastName: t.lastName,
    firstName: t.firstName,
    phone: t.phone,
    birthday: t.birthday,
    metAt: t.metAt,
    job: t.job,
    company: t.company,
    email: t.emailField,
    notes: t.notes,
  };
  return map[fieldId] || null;
}

/**
 * Returns the localized label for a field type.
 */
export function getTypeLabel(typeValue, t) {
  const map = {
    text: t.typeText,
    phone: t.typePhone,
    email: t.typeEmail,
    date: t.typeDate,
    url: t.typeUrl,
    multiline: t.typeMultiline,
  };
  return map[typeValue] || typeValue;
}
