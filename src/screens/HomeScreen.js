import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import ContactCard from '../components/ContactCard';
import { COLORS } from '../utils/constants';
import { sortByName, sortByBirthday, isBirthdayToday } from '../utils/helpers';
import { exportData, importData, loadContacts, loadFields } from '../utils/storage';

export default function HomeScreen({ contacts, fields, onNavigate, onRefresh }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('contacts'); // contacts | birthdays

  const birthdaysToday = contacts.filter((c) => isBirthdayToday(c.birthday));

  // Filter
  const searchLower = search.toLowerCase();
  const filtered = contacts.filter((c) => {
    if (!search) return true;
    return Object.values(c).some(
      (v) => typeof v === 'string' && v.toLowerCase().includes(searchLower)
    );
  });

  // Sort
  const sorted = tab === 'birthdays' ? sortByBirthday(filtered) : sortByName(filtered);

  // Export handler
  const handleExport = async () => {
    try {
      const json = await exportData();
      const fileUri =
        FileSystem.documentDirectory +
        `birthact_export_${new Date().toISOString().slice(0, 10)}.json`;
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Exporter contacts Birthact',
      });
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'exporter les données.");
    }
  };

  // Import handler
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      const count = await importData(content);
      Alert.alert('Import réussi', `${count} nouveau(x) contact(s) importé(s).`);
      onRefresh();
    } catch (e) {
      Alert.alert('Erreur', 'Fichier invalide ou corrompu.');
    }
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{tab === 'birthdays' ? '🎂' : '👋'}</Text>
      <Text style={styles.emptyTitle}>
        {tab === 'birthdays'
          ? 'Aucun anniversaire enregistré'
          : search
          ? 'Aucun résultat'
          : 'Aucun contact'}
      </Text>
      <Text style={styles.emptySub}>
        {tab === 'birthdays'
          ? 'Ajoutez une date à vos contacts'
          : search
          ? 'Essayez un autre terme'
          : 'Appuyez sur + pour commencer'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>🎯 Birthact</Text>
            <Text style={styles.subtitle}>
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
              {birthdaysToday.length > 0
                ? ` · 🎂 ${birthdaysToday.length} anniv. aujourd'hui`
                : ''}
            </Text>
          </View>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un contact..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={handleExport}>
          <Ionicons name="download-outline" size={16} color={COLORS.dark} />
          <Text style={styles.toolText}>Exporter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleImport}>
          <Ionicons name="push-outline" size={16} color={COLORS.dark} />
          <Text style={styles.toolText}>Importer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => onNavigate('fields')}>
          <Ionicons name="settings-outline" size={16} color={COLORS.dark} />
          <Text style={styles.toolText}>Champs</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'contacts' && styles.tabActive]}
          onPress={() => setTab('contacts')}
        >
          <Ionicons
            name="people"
            size={16}
            color={tab === 'contacts' ? COLORS.accent : COLORS.gray}
          />
          <Text style={[styles.tabLabel, tab === 'contacts' && styles.tabLabelActive]}>
            Contacts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'birthdays' && styles.tabActive]}
          onPress={() => setTab('birthdays')}
        >
          <Ionicons
            name="gift"
            size={16}
            color={tab === 'birthdays' ? COLORS.accent : COLORS.gray}
          />
          <Text style={[styles.tabLabel, tab === 'birthdays' && styles.tabLabelActive]}>
            Anniversaires
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact List */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactCard contact={item} onPress={() => onNavigate('detail', item)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => onNavigate('add')} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.dark,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
  },
  tabActive: {
    backgroundColor: COLORS.accentLight,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  tabLabelActive: {
    color: COLORS.accent,
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.gray,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
