import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
  FlatList,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../utils/constants';
import { generateId, getInitials, dateToDisplay, displayToISO, formatDateInput } from '../utils/helpers';
import { getFieldLabel } from '../utils/i18n';
import { COUNTRIES, getCountryByCode } from '../utils/countries';
import { loadDefaultCountry } from '../utils/storage';

function CityInput({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const timer = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  const search = async (text) => {
    if (text.length < 2) { setSuggestions([]); return; }
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5&addressdetails=1&accept-language=fr`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Birthact/1.0' } });
      const data = await res.json();
      const seen = new Set();
      const results = [];
      for (const item of data) {
        const a = item.address || {};
        const city = a.city || a.town || a.village || a.municipality || a.county || item.name;
        const region = a.state || a.county || '';
        const country = a.country || '';
        const key = `${city}|${country}`;
        if (city && !seen.has(key)) {
          seen.add(key);
          results.push({ id: item.place_id, city, region, country });
        }
      }
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    }
  };

  const handleChange = (text) => {
    setQuery(text);
    onChange(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(text), 400);
  };

  const select = (s) => {
    setQuery(s.city);
    onChange(s.city);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.grayLight}
        autoCapitalize="words"
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestionBox}>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.suggestionRow}
              onPress={() => select(s)}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={14} color={COLORS.accent} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionCity}>{s.city}</Text>
                <Text style={styles.suggestionSub} numberOfLines={1}>
                  {[s.region, s.country].filter(Boolean).join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ContactFormScreen({ contact, fields, onSave, onDelete, onCancel, t }) {
  const [form, setForm] = useState(contact || {});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const isEditing = !!contact;

  useEffect(() => {
    (async () => {
      const defaultCode = contact?.phoneCountry || await loadDefaultCountry();
      setSelectedCountry(getCountryByCode(defaultCode));
    })();
  }, []);

  const handleChange = (fieldId, value) => {
    setForm((f) => ({ ...f, [fieldId]: value }));
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permissionRequired, t.permissionMsg);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setForm((f) => ({ ...f, photo: `data:image/jpeg;base64,${asset.base64}` }));
    }
  };

  const removePhoto = () => {
    setForm((f) => {
      const updated = { ...f };
      delete updated.photo;
      return updated;
    });
  };

  const handleSave = () => {
    if (!form.firstName && !form.lastName) {
      Alert.alert(t.fieldRequired, t.fieldRequiredMsg);
      return;
    }
    // Strip internal display-only keys before saving
    const clean = Object.fromEntries(
      Object.entries(form).filter(([k]) => !k.startsWith('_'))
    );
    const data = isEditing
      ? clean
      : { ...clean, id: generateId(), createdAt: new Date().toISOString() };
    onSave(data);
  };

  const handleDelete = () => {
    const name = `${form.firstName || ''} ${form.lastName || ''}`.trim();
    Alert.alert(t.deleteConfirmTitle, t.deleteConfirmMsg(name), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => onDelete(contact.id) },
    ]);
  };

  const resolveLabel = (field) => getFieldLabel(field.id, t) || field.label;

  const handleCountrySelect = (country) => {
    const currentPhone = form.phone || '';
    let newPhone;
    if (currentPhone.startsWith('+')) {
      const withoutCode = currentPhone.replace(/^\+\d+\s?/, '');
      newPhone = withoutCode ? `${country.dialCode} ${withoutCode}` : country.dialCode + ' ';
    } else if (!currentPhone) {
      newPhone = country.dialCode + ' ';
    } else {
      newPhone = `${country.dialCode} ${currentPhone}`;
    }
    setSelectedCountry(country);
    setForm((f) => ({ ...f, phone: newPhone, phoneCountry: country.code }));
    setCountryModalVisible(false);
    setCountrySearch('');
  };

  const filteredCountries = countrySearch
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.nameEn.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dialCode.includes(countrySearch)
      )
    : COUNTRIES;

  const renderInput = (field) => {
    const value = form[field.id] || '';
    const label = resolveLabel(field);

    if (field.type === 'multiline') {
      return (
        <TextInput
          key={field.id}
          style={[styles.input, styles.textArea]}
          value={value}
          onChangeText={(v) => handleChange(field.id, v)}
          placeholder={`${label}...`}
          placeholderTextColor={COLORS.grayLight}
          multiline
          textAlignVertical="top"
        />
      );
    }

    if (field.id === 'city') {
      return (
        <CityInput
          key={field.id}
          value={value}
          onChange={(v) => handleChange(field.id, v)}
          placeholder={`${label}...`}
        />
      );
    }

    if (field.id === 'phone') {
      return (
        <View key={field.id} style={styles.phoneRow}>
          <TouchableOpacity
            style={styles.countryBtn}
            onPress={() => setCountryModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.countryFlag}>{selectedCountry?.flag || '🌍'}</Text>
            <Text style={styles.countryDial}>{selectedCountry?.dialCode || ''}</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.gray} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            value={value}
            onChangeText={(v) => handleChange(field.id, v)}
            placeholder="6 12 34 56 78"
            placeholderTextColor={COLORS.grayLight}
            keyboardType="phone-pad"
          />
        </View>
      );
    }

    if (field.type === 'date') {
      const displayVal = `_${field.id}_display` in form
        ? form[`_${field.id}_display`]
        : dateToDisplay(value);
      return (
        <TextInput
          key={field.id}
          style={styles.input}
          value={displayVal}
          onChangeText={(text) => {
            const formatted = formatDateInput(text);
            const iso = displayToISO(formatted);
            setForm((f) => {
              const updated = { ...f, [`_${field.id}_display`]: formatted };
              if (iso) updated[field.id] = iso;
              return updated;
            });
          }}
          placeholder={t.datePlaceholder}
          placeholderTextColor={COLORS.grayLight}
          keyboardType="numeric"
          maxLength={10}
        />
      );
    }

    let keyboardType = 'default';
    if (field.type === 'email') keyboardType = 'email-address';
    if (field.type === 'url') keyboardType = 'url';

    return (
      <TextInput
        key={field.id}
        style={styles.input}
        value={value}
        onChangeText={(v) => handleChange(field.id, v)}
        placeholder={`${label}...`}
        placeholderTextColor={COLORS.grayLight}
        keyboardType={keyboardType}
        autoCapitalize={field.type === 'email' || field.type === 'url' ? 'none' : 'sentences'}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? t.editContact : t.newContact}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickPhoto} style={styles.photoBtn} activeOpacity={0.7}>
            {form.photo ? (
              <Image source={{ uri: form.photo }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={28} color={COLORS.grayLight} />
                <Text style={styles.photoPlaceholderText}>{t.addPhoto}</Text>
              </View>
            )}
          </TouchableOpacity>
          {form.photo && (
            <TouchableOpacity onPress={removePhoto} style={styles.photoRemove}>
              <Ionicons name="close-circle" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          )}
          <Text style={styles.photoHint}>{t.photoHint}</Text>
        </View>

        {fields.map((field) => (
          <View key={field.id}>
            <Text style={styles.label}>{resolveLabel(field)}</Text>
            {renderInput(field)}
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Ionicons name="checkmark" size={20} color={COLORS.white} />
          <Text style={styles.saveBtnText}>{isEditing ? t.save : t.addContact}</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            <Text style={styles.deleteBtnText}>{t.deleteContact}</Text>
          </TouchableOpacity>
        )}

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
                <Ionicons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalSearch}
              placeholder="Rechercher..."
              placeholderTextColor={COLORS.grayLight}
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoFocus
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryRow, selectedCountry?.code === item.code && styles.countryRowActive]}
                  onPress={() => handleCountrySelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryRowFlag}>{item.flag}</Text>
                  <Text style={styles.countryRowName}>{item.name}</Text>
                  <Text style={styles.countryRowDial}>{item.dialCode}</Text>
                  {selectedCountry?.code === item.code && (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 54, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 40 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center', color: COLORS.dark },
  body: { padding: 20 },
  photoSection: { alignItems: 'center', marginBottom: 24, position: 'relative' },
  photoBtn: {
    width: 100, height: 100, borderRadius: 26, overflow: 'hidden',
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card, gap: 4,
  },
  photoPlaceholderText: { fontSize: 10, color: COLORS.grayLight, fontWeight: '500' },
  photoRemove: { position: 'absolute', top: -4, right: '33%', backgroundColor: COLORS.card, borderRadius: 12 },
  photoHint: {
    fontSize: 11, color: COLORS.grayLight, textAlign: 'center',
    marginTop: 8, paddingHorizontal: 20, fontStyle: 'italic',
  },
  label: {
    fontSize: 12, fontWeight: '600', color: COLORS.gray,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.dark, marginBottom: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  countryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 12,
  },
  countryFlag: { fontSize: 20 },
  countryDial: { fontSize: 13, fontWeight: '600', color: COLORS.dark },
  phoneInput: { flex: 1, marginBottom: 0 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, marginTop: 8,
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.danger, borderRadius: 12, paddingVertical: 12, marginTop: 12,
  },
  deleteBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: '600' },
  suggestionBox: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginTop: -12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  suggestionCity: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  suggestionSub: { fontSize: 12, color: COLORS.gray, marginTop: 1 },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
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
