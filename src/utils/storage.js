import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_FIELDS } from './constants';

/**
 * Load contacts from storage.
 */
export async function loadContacts() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.contacts);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading contacts:', e);
    return [];
  }
}

/**
 * Save contacts to storage.
 */
export async function saveContacts(contacts) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(contacts));
  } catch (e) {
    console.error('Error saving contacts:', e);
  }
}

/**
 * Load custom fields from storage.
 */
export async function loadFields() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.fields);
    return data ? JSON.parse(data) : DEFAULT_FIELDS;
  } catch (e) {
    console.error('Error loading fields:', e);
    return DEFAULT_FIELDS;
  }
}

/**
 * Save custom fields to storage.
 */
export async function saveFields(fields) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.fields, JSON.stringify(fields));
  } catch (e) {
    console.error('Error saving fields:', e);
  }
}

/**
 * Load language preference. Defaults to 'en'.
 */
export async function loadLanguage() {
  try {
    const lang = await AsyncStorage.getItem(STORAGE_KEYS.language);
    return lang || 'en';
  } catch (e) {
    return 'en';
  }
}

/**
 * Save language preference.
 */
export async function saveLanguage(lang) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.language, lang);
  } catch (e) {
    console.error('Error saving language:', e);
  }
}

/**
 * Export all data as a JSON string.
 */
export async function exportData() {
  const contacts = await loadContacts();
  const fields = await loadFields();
  return JSON.stringify(
    {
      app: 'Birthact',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      contacts,
      fields,
    },
    null,
    2
  );
}

/**
 * Import data from a JSON string. Merges contacts and fields
 * without creating duplicates. Returns the number of new contacts added.
 */
export async function importData(jsonString) {
  const data = JSON.parse(jsonString);
  if (!data.contacts) throw new Error('Invalid format');

  const existingContacts = await loadContacts();
  const existingFields = await loadFields();

  const existingIds = new Set(existingContacts.map((c) => c.id));
  const newContacts = data.contacts.filter((c) => !existingIds.has(c.id));
  const mergedContacts = [...existingContacts, ...newContacts];
  await saveContacts(mergedContacts);

  if (data.fields) {
    const existingFieldIds = new Set(existingFields.map((f) => f.id));
    const newFields = data.fields.filter((f) => !existingFieldIds.has(f.id));
    const mergedFields = [...existingFields, ...newFields];
    await saveFields(mergedFields);
  }

  return newContacts.length;
}
