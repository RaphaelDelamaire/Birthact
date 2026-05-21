import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Modal, FlatList, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../utils/constants';
import { exportData, importData } from '../utils/storage';
import { COUNTRIES, getCountryByCode } from '../utils/countries';

const makeStyles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 54, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 40 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center', color: COLORS.dark },
  body: { padding: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1.2, color: COLORS.gray, marginBottom: 12,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: 16, marginBottom: 10,
  },
  optionActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  optionFlag: { fontSize: 24 },
  optionText: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.dark },
  optionTextActive: { fontWeight: '600', color: COLORS.accent },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 14, marginBottom: 10,
  },
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: COLORS.dark },
  rowValue: { fontSize: 14, color: COLORS.gray, marginRight: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.background, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '80%', paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.dark },
  modalSearch: {
    margin: 16, backgroundColor: COLORS.card, borderRadius: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: COLORS.dark,
  },
  countryRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  countryRowActive: { backgroundColor: COLORS.accentLight },
  countryRowFlag: { fontSize: 22 },
  countryRowName: { flex: 1, fontSize: 15, color: COLORS.dark },
  countryRowDial: { fontSize: 13, color: COLORS.gray },
});

export default function SettingsScreen({
  language,
  onChangeLanguage,
  onBack,
  onNavigateFields,
  defaultCountry,
  onChangeDefaultCountry,
  theme,
  onChangeTheme,
  onRefresh,
  colors,
  t,
}) {
  const C = colors || COLORS;
  const styles = makeStyles(C);

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const currentCountry = getCountryByCode(defaultCountry || 'FR');

  const filteredCountries = countrySearch
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.nameEn.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dialCode.includes(countrySearch)
      )
    : COUNTRIES;

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
    } catch {
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
      if (onRefresh) onRefresh();
    } catch {
      Alert.alert(t.error, t.importError);
    }
  };

  const handleCountrySelect = (country) => {
    onChangeDefaultCountry(country.code);
    setCountryModalVisible(false);
    setCountrySearch('');
  };

  const SettingRow = ({ icon, label, value, onPress, chevron = true }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={C.accent} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {chevron && <Ionicons name="chevron-forward" size={16} color={C.border} />}
    </TouchableOpacity>
  );

  const LANGUAGES = [
    { code: 'en', flag: '🇬🇧', label: t.english },
    { code: 'fr', flag: '🇫🇷', label: t.french },
    { code: 'es', flag: '🇪🇸', label: t.spanish },
    { code: 'de', flag: '🇩🇪', label: t.german },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.settings}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Language */}
        <Text style={styles.sectionTitle}>{t.language}</Text>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.option, language === lang.code && styles.optionActive]}
            onPress={() => onChangeLanguage(lang.code)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionFlag}>{lang.flag}</Text>
            <Text style={[styles.optionText, language === lang.code && styles.optionTextActive]}>
              {lang.label}
            </Text>
            {language === lang.code && (
              <Ionicons name="checkmark-circle" size={22} color={C.accent} />
            )}
          </TouchableOpacity>
        ))}

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t.appearance}</Text>
        <TouchableOpacity
          style={[styles.option, theme === 'light' && styles.optionActive]}
          onPress={() => onChangeTheme('light')}
          activeOpacity={0.7}
        >
          <Ionicons name="sunny-outline" size={24} color={theme === 'light' ? C.accent : C.gray} />
          <Text style={[styles.optionText, theme === 'light' && styles.optionTextActive]}>
            {t.lightMode}
          </Text>
          {theme === 'light' && <Ionicons name="checkmark-circle" size={22} color={C.accent} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, theme === 'dark' && styles.optionActive]}
          onPress={() => onChangeTheme('dark')}
          activeOpacity={0.7}
        >
          <Ionicons name="moon-outline" size={24} color={theme === 'dark' ? C.accent : C.gray} />
          <Text style={[styles.optionText, theme === 'dark' && styles.optionTextActive]}>
            {t.darkMode}
          </Text>
          {theme === 'dark' && <Ionicons name="checkmark-circle" size={22} color={C.accent} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, theme === 'system' && styles.optionActive]}
          onPress={() => onChangeTheme('system')}
          activeOpacity={0.7}
        >
          <Ionicons name="phone-portrait-outline" size={24} color={theme === 'system' ? C.accent : C.gray} />
          <Text style={[styles.optionText, theme === 'system' && styles.optionTextActive]}>
            {t.systemMode}
          </Text>
          {theme === 'system' && <Ionicons name="checkmark-circle" size={22} color={C.accent} />}
        </TouchableOpacity>

        {/* Phone default country */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t.phoneCountry}</Text>
        <SettingRow
          icon="call-outline"
          label={t.defaultCountryLabel}
          value={`${currentCountry.flag} ${currentCountry.dialCode}`}
          onPress={() => setCountryModalVisible(true)}
        />

        {/* Data */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t.dataManagement}</Text>
        <SettingRow
          icon="options-outline"
          label={t.manageFieldsShort}
          onPress={onNavigateFields}
        />
        <SettingRow
          icon="download-outline"
          label={t.export}
          onPress={handleExport}
        />
        <SettingRow
          icon="push-outline"
          label={t.import}
          onPress={handleImport}
        />
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Country picker modal */}
      <Modal
        visible={countryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.selectCountry}</Text>
              <TouchableOpacity onPress={() => { setCountryModalVisible(false); setCountrySearch(''); }}>
                <Ionicons name="close" size={24} color={C.dark} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalSearch}
              placeholder="Rechercher..."
              placeholderTextColor={C.grayLight}
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoFocus
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryRow, currentCountry.code === item.code && styles.countryRowActive]}
                  onPress={() => handleCountrySelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryRowFlag}>{item.flag}</Text>
                  <Text style={styles.countryRowName}>{item.name}</Text>
                  <Text style={styles.countryRowDial}>{item.dialCode}</Text>
                  {currentCountry.code === item.code && (
                    <Ionicons name="checkmark-circle" size={18} color={C.accent} />
                  )}
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
