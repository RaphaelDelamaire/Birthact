import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../utils/constants';
import { generateId, getInitials } from '../utils/helpers';
import { getFieldLabel } from '../utils/i18n';

export default function ContactFormScreen({ contact, fields, onSave, onDelete, onCancel, t }) {
  const [form, setForm] = useState(contact || {});
  const isEditing = !!contact;

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
      const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
      setForm((f) => ({ ...f, photo: base64Uri }));
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
    const data = isEditing
      ? { ...form }
      : { ...form, id: generateId(), createdAt: new Date().toISOString() };
    onSave(data);
  };

  const handleDelete = () => {
    const name = `${form.firstName || ''} ${form.lastName || ''}`.trim();
    Alert.alert(t.deleteConfirmTitle, t.deleteConfirmMsg(name), [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => onDelete(contact.id) },
    ]);
  };

  const resolveLabel = (field) => {
    // Built-in fields get a translated label; custom fields use their stored label
    return getFieldLabel(field.id, t) || field.label;
  };

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

    let keyboardType = 'default';
    if (field.type === 'phone') keyboardType = 'phone-pad';
    if (field.type === 'email') keyboardType = 'email-address';
    if (field.type === 'url') keyboardType = 'url';

    return (
      <TextInput
        key={field.id}
        style={styles.input}
        value={value}
        onChangeText={(v) => handleChange(field.id, v)}
        placeholder={field.type === 'date' ? 'YYYY-MM-DD' : `${label}...`}
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
        {/* Photo picker */}
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
});
