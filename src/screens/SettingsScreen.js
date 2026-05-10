import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function SettingsScreen({ language, onChangeLanguage, onBack, t }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.settings}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>{t.language}</Text>

        <TouchableOpacity
          style={[styles.option, language === 'en' && styles.optionActive]}
          onPress={() => onChangeLanguage('en')}
          activeOpacity={0.7}
        >
          <Text style={styles.optionFlag}>🇬🇧</Text>
          <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>
            {t.english}
          </Text>
          {language === 'en' && (
            <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, language === 'fr' && styles.optionActive]}
          onPress={() => onChangeLanguage('fr')}
          activeOpacity={0.7}
        >
          <Text style={styles.optionFlag}>🇫🇷</Text>
          <Text style={[styles.optionText, language === 'fr' && styles.optionTextActive]}>
            {t.french}
          </Text>
          {language === 'fr' && (
            <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    letterSpacing: 1.2, color: COLORS.gray, marginBottom: 14,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.card, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: 16, marginBottom: 10,
  },
  optionActive: {
    borderColor: COLORS.accent, backgroundColor: COLORS.accentLight,
  },
  optionFlag: { fontSize: 24 },
  optionText: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.dark },
  optionTextActive: { fontWeight: '600', color: COLORS.accent },
});
