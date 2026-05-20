import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, LogBox, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ContactFormScreen from './src/screens/ContactFormScreen';
import ContactDetailScreen from './src/screens/ContactDetailScreen';
import FieldManagerScreen from './src/screens/FieldManagerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MapScreen from './src/screens/MapScreen';

import {
  loadContacts,
  saveContacts,
  loadFields,
  saveFields,
  loadLanguage,
  saveLanguage,
  loadDefaultCountry,
  saveDefaultCountry,
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
  const [defaultCountry, setDefaultCountry] = useState('FR');
  const [screen, setScreen] = useState('home');
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  useEffect(() => {
    (async () => {
      try { configureNotifications(); } catch {}

      let loadedContacts = [];
      let loadedLang = 'en';

      try {
        const results = await Promise.all([
          loadContacts().catch(() => []),
          loadFields().catch(() => DEFAULT_FIELDS),
          loadLanguage().catch(() => 'en'),
          loadDefaultCountry().catch(() => 'FR'),
        ]);
        loadedContacts = results[0] || [];
        loadedLang = results[2] || 'en';
        setContacts(loadedContacts);
        setFields(results[1] || DEFAULT_FIELDS);
        setLanguage(loadedLang);
        setDefaultCountry(results[3] || 'FR');
      } catch {}

      setLoading(false);

      try {
        const granted = await requestPermissions();
        if (granted && loadedContacts.length > 0) {
          await scheduleBirthdayNotifications(loadedContacts, TRANSLATIONS[loadedLang]);
        }
      } catch {}
    })();
  }, []);

  // Android hardware back button
  useEffect(() => {
    const onBack = () => {
      if (screen === 'home') return false; // let system handle (exit app)
      if (screen === 'detail') { setScreen('home'); setSelectedContact(null); return true; }
      if (screen === 'edit') { setScreen('detail'); return true; }
      if (screen === 'add') { setScreen('home'); return true; }
      if (screen === 'fields') { setScreen('settings'); return true; }
      if (screen === 'settings') { setScreen('home'); return true; }
      if (screen === 'map') { setScreen('home'); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [screen]);

  const refresh = useCallback(async () => {
    try {
      const [c, f] = await Promise.all([loadContacts(), loadFields()]);
      setContacts(c);
      setFields(f);
    } catch {}
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
      case 'map':
        setScreen('map');
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
      } catch {}
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
      } catch {}
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
      } catch {}
      navigate('home');
    },
    [contacts, navigate, t]
  );

  const handleSaveFields = useCallback(async (newFields) => {
    setFields(newFields);
    try { await saveFields(newFields); } catch {}
    setScreen('settings');
  }, []);

  const handleChangeLanguage = useCallback(
    async (lang) => {
      setLanguage(lang);
      try {
        await saveLanguage(lang);
        await scheduleBirthdayNotifications(contacts, TRANSLATIONS[lang]);
      } catch {}
    },
    [contacts]
  );

  const handleChangeDefaultCountry = useCallback(async (code) => {
    setDefaultCountry(code);
    try { await saveDefaultCountry(code); } catch {}
  }, []);

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
          onCancel={() => navigate('settings')}
          t={t}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          language={language}
          onChangeLanguage={handleChangeLanguage}
          onBack={() => navigate('home')}
          onNavigateFields={() => navigate('fields')}
          defaultCountry={defaultCountry}
          onChangeDefaultCountry={handleChangeDefaultCountry}
          onRefresh={refresh}
          t={t}
        />
      )}

      {screen === 'map' && (
        <MapScreen
          contacts={contacts}
          onBack={() => navigate('home')}
          t={t}
        />
      )}
    </SafeAreaProvider>
  );
}
