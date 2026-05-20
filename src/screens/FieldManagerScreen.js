import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { generateId } from '../utils/helpers';
import { getFieldLabel, getTypeLabel } from '../utils/i18n';

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
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 8,
  },
  fieldInfo: { flex: 1 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.dark },
  fieldType: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  removeBtn: { padding: 6 },
  lockBadge: { padding: 6 },
  label: {
    fontSize: 12, fontWeight: '600', color: COLORS.gray,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1.5,
    borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: COLORS.dark, marginBottom: 16,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  typeChipActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
  typeChipText: { fontSize: 13, fontWeight: '500', color: COLORS.gray },
  typeChipTextActive: { color: COLORS.accent, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.dark, borderRadius: 12, paddingVertical: 14,
  },
  addBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, marginTop: 24,
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});

export default function FieldManagerScreen({ fields, onSave, onCancel, colors, t }) {
  const C = colors || COLORS;
  const styles = makeStyles(C);
  const [localFields, setLocalFields] = useState(fields);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');

  const FIELD_TYPES = [
    { value: 'text', label: t.typeText },
    { value: 'phone', label: t.typePhone },
    { value: 'email', label: t.typeEmail },
    { value: 'date', label: t.typeDate },
    { value: 'url', label: t.typeUrl },
    { value: 'multiline', label: t.typeMultiline },
  ];

  const addField = () => {
    if (!newLabel.trim()) {
      Alert.alert(t.fieldNameRequired, t.fieldNameRequiredMsg);
      return;
    }
    const id = 'custom_' + generateId();
    setLocalFields([...localFields, { id, label: newLabel.trim(), type: newType, removable: true }]);
    setNewLabel('');
    setNewType('text');
  };

  const removeField = (id) => {
    Alert.alert(t.deleteFieldTitle, t.deleteFieldMsg, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => setLocalFields(localFields.filter((f) => f.id !== id)),
      },
    ]);
  };

  const resolveLabel = (field) => getFieldLabel(field.id, t) || field.label;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.manageFields}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t.currentFields}</Text>
        {localFields.map((f) => (
          <View key={f.id} style={styles.fieldRow}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>{resolveLabel(f)}</Text>
              <Text style={styles.fieldType}>{getTypeLabel(f.type, t)}</Text>
            </View>
            {f.removable ? (
              <TouchableOpacity onPress={() => removeField(f.id)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={16} color={C.danger} />
              </TouchableOpacity>
            ) : (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={12} color={C.grayLight} />
              </View>
            )}
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>{t.addField}</Text>
        <Text style={styles.label}>{t.fieldName}</Text>
        <TextInput
          style={styles.input}
          value={newLabel}
          onChangeText={setNewLabel}
          placeholder={t.fieldNamePlaceholder}
          placeholderTextColor={C.grayLight}
        />

        <Text style={styles.label}>{t.fieldType}</Text>
        <View style={styles.typeGrid}>
          {FIELD_TYPES.map((ft) => (
            <TouchableOpacity
              key={ft.value}
              style={[styles.typeChip, newType === ft.value && styles.typeChipActive]}
              onPress={() => setNewType(ft.value)}
            >
              <Text style={[styles.typeChipText, newType === ft.value && styles.typeChipTextActive]}>
                {ft.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={addField} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color={C.white} />
          <Text style={styles.addBtnText}>{t.addThisField}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(localFields)} activeOpacity={0.8}>
          <Ionicons name="checkmark" size={20} color={C.white} />
          <Text style={styles.saveBtnText}>{t.saveFields}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

