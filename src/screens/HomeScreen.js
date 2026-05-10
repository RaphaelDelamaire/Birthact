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
import { exportData, importData } from '../utils/storage';

export default function HomeScreen({ contacts, fields, onNavigate, onRefresh, t }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('contacts');

  const birthdaysToday = contacts.filter((c) => isBirthdayToday(c.birthday));

  const searchLower = search.toLowerCase();
  const filtered = contacts.filter((c) => {
    if (!search) return true;
    return Object.values(c).some(
      (v) => typeof v === 'string' && v.toLowerCase().includes(searchLower)
    );
  });

  const sorted = tab === 'birthdays' ? sortByBirthday(filtered) : sortByName(filtered);

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
        dialogTitle: t.exportTitle,
      });
    } catch (e) {
      Alert.alert(t.error, t.exportError);
    }
  };

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
      Alert.alert(t.importSuccessTitle, t.importSuccess(count));
      onRefresh();
    } catch (e) {
      Alert.alert(t.error, t.importError);
    }
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{tab === 'birthdays' ? '🎂' : '👋'}</Text>
      <Text style={styles.emptyTitle}>
        {tab === 'birthdays'
          ? t.noBirthdaysTitle
          : search
          ? t.noResultsTitle
          : t.noContactsTitle}
      </Text>
      <Text style={styles.emptySub}>
        {tab === 'birthdays'
          ? t.noBirthdaysSub
          : search
          ? t.noResultsSub
          : t.noContactsSub}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>🎯 {t.appName}</Text>
            <Text style={styles.subtitle}>
              {t.contactCount(contacts.length)}
              {birthdaysToday.length > 0
                ? ` · 🎂 ${t.birthdayToday(birthdaysToday.length)}`
                : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate('settings')}
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
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
          <Text style={styles.toolText}>{t.export}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={handleImport}>
          <Ionicons name="push-outline" size={16} color={COLORS.dark} />
          <Text style={styles.toolText}>{t.import}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => onNavigate('fields')}>
          <Ionicons name="options-outline" size={16} color={COLORS.dark} />
          <Text style={styles.toolText}>{t.fields}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'contacts' && styles.tabActive]}
          onPress={() => setTab('contacts')}
        >
          <Ionicons name="people" size={16} color={tab === 'contacts' ? COLORS.accent : COLORS.gray} />
          <Text style={[styles.tabLabel, tab === 'contacts' && styles.tabLabelActive]}>
            {t.contacts}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'birthdays' && styles.tabActive]}
          onPress={() => setTab('birthdays')}
        >
          <Ionicons name="gift" size={16} color={tab === 'birthdays' ? COLORS.accent : COLORS.gray} />
          <Text style={[styles.tabLabel, tab === 'birthdays' && styles.tabLabelActive]}>
            {t.birthdays}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact List */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactCard contact={item} onPress={() => onNavigate('detail', item)} t={t} />
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
  container: { flex: 1, backgroundColor: COLORS.background },
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
  title: { fontSize: 26, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  settingsBtn: { padding: 6, marginTop: 2 },
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
  searchInput: { flex: 1, color: COLORS.white, fontSize: 14 },
  toolbar: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 14 },
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
  toolText: { fontSize: 12, fontWeight: '600', color: COLORS.dark },
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
  tabActive: { backgroundColor: COLORS.accentLight },
  tabLabel: { fontSize: 13, fontWeight: '600', color: COLORS.gray },
  tabLabelActive: { color: COLORS.accent },
  list: { padding: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 42, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.dark, marginBottom: 6 },
  emptySub: { fontSize: 13, color: COLORS.gray },
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
