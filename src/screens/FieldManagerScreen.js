import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { generateId } from '../utils/helpers';

const FIELD_TYPES = [
  { value: 'text', label: 'Texte' },
  { value: 'phone', label: 'Téléphone' },
  { value: 'email', label: 'Email' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL / Lien' },
  { value: 'multiline', label: 'Texte long' },
];

export default function FieldManagerScreen({ fields, onSave, onCancel }) {
  const [localFields, setLocalFields] = useState(fields);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');

  const addField = () => {
    if (!newLabel.trim()) {
      Alert.alert('Nom requis', 'Entrez un nom pour le nouveau champ.');
      return;
    }
    const id = 'custom_' + generateId();
    setLocalFields([...localFields, { id, label: newLabel.trim(), type: newType, removable: true }]);
    setNewLabel('');
    setNewType('text');
  };

  const removeField = (id) => {
    Alert.alert(
      'Supprimer le champ',
      'Ce champ sera supprimé pour tous les contacts. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setLocalFields(localFields.filter((f) => f.id !== id)),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Gérer les champs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Current fields */}
        <Text style={styles.sectionTitle}>Champs actuels</Text>
        {localFields.map((f) => (
          <View key={f.id} style={styles.fieldRow}>
            <View style={styles.fieldInfo}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <Text style={styles.fieldType}>
                {FIELD_TYPES.find((t) => t.value === f.type)?.label || f.type}
              </Text>
            </View>
            {f.removable ? (
              <TouchableOpacity onPress={() => removeField(f.id)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
              </TouchableOpacity>
            ) : (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={12} color={COLORS.grayLight} />
              </View>
            )}
          </View>
        ))}

        {/* Add new field */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Ajouter un champ</Text>

        <Text style={styles.label}>Nom du champ</Text>
        <TextInput
          style={styles.input}
          value={newLabel}
          onChangeText={setNewLabel}
          placeholder="Ex: LinkedIn, Hobby, Relation..."
          placeholderTextColor={COLORS.grayLight}
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeGrid}>
          {FIELD_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.typeChip, newType === t.value && styles.typeChipActive]}
              onPress={() => setNewType(t.value)}
            >
              <Text style={[styles.typeChipText, newType === t.value && styles.typeChipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={addField} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.addBtnText}>Ajouter ce champ</Text>
        </TouchableOpacity>

        {/* Save all */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => onSave(localFields)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={20} color={COLORS.white} />
          <Text style={styles.saveBtnText}>Sauvegarder</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, width: 40 },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.dark,
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: COLORS.gray,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  fieldType: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  removeBtn: {
    padding: 6,
  },
  lockBadge: {
    padding: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.dark,
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  typeChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray,
  },
  typeChipTextActive: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.dark,
    borderRadius: 12,
    paddingVertical: 14,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
