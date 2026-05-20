import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContactCard from '../components/ContactCard';
import { COLORS } from '../utils/constants';
import { sortByName, sortByBirthday, isBirthdayToday } from '../utils/helpers';

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

  const withBirthday = filtered.filter((c) => !!c.birthday);
  const withoutBirthday = filtered.filter((c) => !c.birthday);

  const sorted =
    tab === 'birthdays' ? sortByBirthday(filtered) : sortByName(filtered);

  const renderBirthdayList = () => (
    <>
      {withBirthday.length === 0 && withoutBirthday.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎂</Text>
          <Text style={styles.emptyTitle}>{t.noBirthdaysTitle}</Text>
          <Text style={styles.emptySub}>{t.noBirthdaysSub}</Text>
        </View>
      )}
      {sortByBirthday(withBirthday).map((item) => (
        <ContactCard
          key={item.id}
          contact={item}
          onPress={() => onNavigate('detail', item)}
          t={t}
          birthdayMode
        />
      ))}
      {withoutBirthday.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{t.noBirthdayContacts}</Text>
          </View>
          {sortByName(withoutBirthday).map((item) => (
            <ContactCard
              key={item.id}
              contact={item}
              onPress={() => onNavigate('detail', item)}
              t={t}
              birthdayMode
            />
          ))}
        </>
      )}
    </>
  );

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
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => onNavigate('map')}
              style={styles.headerBtn}
            >
              <Ionicons name="map-outline" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onNavigate('settings')}
              style={styles.headerBtn}
            >
              <Ionicons name="settings-outline" size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
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
      {tab === 'birthdays' ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {renderBirthdayList()}
        </ScrollView>
      ) : (
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
      )}

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
  headerActions: { flexDirection: 'row', gap: 4, marginTop: 2 },
  headerBtn: { padding: 6 },
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
  sectionHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.gray,
  },
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
