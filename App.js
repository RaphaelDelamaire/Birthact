import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, LogBox, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ContactFormScreen from './src/screens/ContactFormScreen';
import ContactDetailScreen from './src/screens/ContactDetailScreen';
import FieldManagerScreen from './src/screens/FieldManagerScreen';
import SettingsScreen from './src/screens/SettingsScreen';

import {
  loadContacts,
  saveContacts,
  loadFields,
  saveFields,
  loadLanguage,
  saveLanguage,
} from './src/utils/storage';
import {
  requestPermissions,
  configureNotifications,
  scheduleBirthdayNotifications,
} from './src/utils/notifications';
import { DEFAULT_FIELDS } from './src/utils/constants';
import { TRANSLATIONS } from './src/utils/i18n';

LogBox.ignoreLogs(['Setting a timer']);

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [language, setLanguage] = useState('en');
  const [screen, setScreen] = useState('home');
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Initial load wrapped in try/catch to prevent startup crashes
  useEffect(() => {
    (async () => {
      try {
        configureNotifications();
      } catch (e) {
        console.warn('configureNotifications failed:', e?.message);
      }

      let loadedContacts = [];
      let loadedFields = DEFAULT_FIELDS;
      let loadedLang = 'en';

      try {
        const results = await Promise.all([
          loadContacts().catch(() => []),
          loadFields().catch(() => DEFAULT_FIELDS),
          loadLanguage().catch(() => 'en'),
        ]);
        loadedContacts = results[0] || [];
        loadedFields = results[1] || DEFAULT_FIELDS;
        loadedLang = results[2] || 'en';
      } catch (e) {
        console.warn('Storage load error:', e?.message);
      }

      setContacts(loadedContacts);
      setFields(loadedFields);
      setLanguage(loadedLang);
      setLoading(false);

      // Notifications run AFTER the UI is shown, so even if they fail,
      // the user can still use the app.
      try {
        const granted = await requestPermissions();
        if (granted && loadedContacts.length > 0) {
          await scheduleBirthdayNotifications(loadedContacts, TRANSLATIONS[loadedLang]);
        }
      } catch (e) {
        console.warn('Notification setup failed:', e?.message);
      }
    })();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [c, f] = await Promise.all([loadContacts(), loadFields()]);
      setContacts(c);
      setFields(f);
    } catch (e) {
      console.warn('Refresh error:', e?.message);
    }
  }, []);

  const navigate = useCallback((target, data) => {
    switch (target) {
      case 'home':
        setScreen('home');
        setSelectedContact(null);
        break;
      case 'add':
        setScreen('add');
        setSelectedContact(null);
        break;
      case 'edit':
        setScreen('edit');
        if (data) setSelectedContact(data);
        break;
      case 'detail':
        setScreen('detail');
        setSelectedContact(data);
        break;
      case 'fields':
        setScreen('fields');
        break;
      case 'settings':
        setScreen('settings');
        break;
      default:
        setScreen('home');
    }
  }, []);

  const handleAddContact = useCallback(
    async (form) => {
      const updated = [...contacts, form];
      setContacts(updated);
      try {
        await saveContacts(updated);
        await scheduleBirthdayNotifications(updated, t);
      } catch (e) {
        console.warn('Save error:', e?.message);
      }
      navigate('home');
    },
    [contacts, navigate, t]
  );

  const handleEditContact = useCallback(
    async (form) => {
      const updated = contacts.map((c) => (c.id === form.id ? form : c));
      setContacts(updated);
      try {
        await saveContacts(updated);
        await scheduleBirthdayNotifications(updated, t);
      } catch (e) {
        console.warn('Edit error:', e?.message);
      }
      setSelectedContact(form);
      setScreen('detail');
    },
    [contacts, t]
  );

  const handleDeleteContact = useCallback(
    async (id) => {
      const updated = contacts.filter((c) => c.id !== id);
      setContacts(updated);
      try {
        await saveContacts(updated);
        await scheduleBirthdayNotifications(updated, t);
      } catch (e) {
        console.warn('Delete error:', e?.message);
      }
      navigate('home');
    },
    [contacts, navigate, t]
  );

  const handleSaveFields = useCallback(async (newFields) => {
    setFields(newFields);
    try {
      await saveFields(newFields);
    } catch (e) {
      console.warn('Save fields error:', e?.message);
    }
    setScreen('home');
  }, []);

  const handleChangeLanguage = useCallback(
    async (lang) => {
      setLanguage(lang);
      try {
        await saveLanguage(lang);
        await scheduleBirthdayNotifications(contacts, TRANSLATIONS[lang]);
      } catch (e) {
        console.warn('Language change error:', e?.message);
      }
    },
    [contacts]
  );

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      {screen === 'home' && (
        <HomeScreen
          contacts={contacts}
          fields={fields}
          onNavigate={navigate}
          onRefresh={refresh}
          t={t}
        />
      )}

      {screen === 'add' && (
        <ContactFormScreen
          fields={fields}
          onSave={handleAddContact}
          onCancel={() => navigate('home')}
          t={t}
        />
      )}

      {screen === 'edit' && selectedContact && (
        <ContactFormScreen
          contact={selectedContact}
          fields={fields}
          onSave={handleEditContact}
          onDelete={handleDeleteContact}
          onCancel={() => navigate('detail', selectedContact)}
          t={t}
        />
      )}

      {screen === 'detail' && selectedContact && (
        <ContactDetailScreen
          contact={selectedContact}
          fields={fields}
          onEdit={() => navigate('edit', selectedContact)}
          onBack={() => navigate('home')}
          t={t}
        />
      )}

      {screen === 'fields' && (
        <FieldManagerScreen
          fields={fields}
          onSave={handleSaveFields}
          onCancel={() => navigate('home')}
          t={t}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          language={language}
          onChangeLanguage={handleChangeLanguage}
          onBack={() => navigate('home')}
          t={t}
        />
      )}
    </SafeAreaProvider>
  );
}
