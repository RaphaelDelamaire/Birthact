import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, Alert, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ContactFormScreen from './src/screens/ContactFormScreen';
import ContactDetailScreen from './src/screens/ContactDetailScreen';
import FieldManagerScreen from './src/screens/FieldManagerScreen';

import { loadContacts, saveContacts, loadFields, saveFields } from './src/utils/storage';
import { requestPermissions, configureNotifications, scheduleBirthdayNotifications } from './src/utils/notifications';
import { DEFAULT_FIELDS } from './src/utils/constants';

// Suppress the timer warning from Expo
LogBox.ignoreLogs(['Setting a timer']);

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [screen, setScreen] = useState('home');
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    (async () => {
      configureNotifications();
      const [c, f] = await Promise.all([loadContacts(), loadFields()]);
      setContacts(c);
      setFields(f);
      setLoading(false);

      // Request notification permissions
      const granted = await requestPermissions();
      if (granted && c.length > 0) {
        await scheduleBirthdayNotifications(c);
      }
    })();
  }, []);

  // Refresh data from storage
  const refresh = useCallback(async () => {
    const [c, f] = await Promise.all([loadContacts(), loadFields()]);
    setContacts(c);
    setFields(f);
  }, []);

  // Navigation handler
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
      default:
        setScreen('home');
    }
  }, []);

  // Save a new contact
  const handleAddContact = useCallback(
    async (form) => {
      const updated = [...contacts, form];
      setContacts(updated);
      await saveContacts(updated);
      await scheduleBirthdayNotifications(updated);
      navigate('home');
    },
    [contacts, navigate]
  );

  // Update an existing contact
  const handleEditContact = useCallback(
    async (form) => {
      const updated = contacts.map((c) => (c.id === form.id ? form : c));
      setContacts(updated);
      await saveContacts(updated);
      await scheduleBirthdayNotifications(updated);
      setSelectedContact(form);
      setScreen('detail');
    },
    [contacts]
  );

  // Delete a contact
  const handleDeleteContact = useCallback(
    async (id) => {
      const updated = contacts.filter((c) => c.id !== id);
      setContacts(updated);
      await saveContacts(updated);
      await scheduleBirthdayNotifications(updated);
      navigate('home');
    },
    [contacts, navigate]
  );

  // Save fields
  const handleSaveFields = useCallback(
    async (newFields) => {
      setFields(newFields);
      await saveFields(newFields);
      setScreen('home');
    },
    []
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
        />
      )}

      {screen === 'add' && (
        <ContactFormScreen
          fields={fields}
          onSave={handleAddContact}
          onCancel={() => navigate('home')}
        />
      )}

      {screen === 'edit' && selectedContact && (
        <ContactFormScreen
          contact={selectedContact}
          fields={fields}
          onSave={handleEditContact}
          onDelete={handleDeleteContact}
          onCancel={() => navigate('detail', selectedContact)}
        />
      )}

      {screen === 'detail' && selectedContact && (
        <ContactDetailScreen
          contact={selectedContact}
          fields={fields}
          onEdit={() => navigate('edit', selectedContact)}
          onBack={() => navigate('home')}
        />
      )}

      {screen === 'fields' && (
        <FieldManagerScreen
          fields={fields}
          onSave={handleSaveFields}
          onCancel={() => navigate('home')}
        />
      )}
    </SafeAreaProvider>
  );
}
