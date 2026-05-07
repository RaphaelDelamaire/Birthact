import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { isBirthdayToday, formatDate, getAge, getInitials } from '../utils/helpers';

export default function ContactDetailScreen({ contact, fields, onEdit, onBack }) {
  const isToday = isBirthdayToday(contact.birthday);
  const age = getAge(contact.birthday);
  const initials = getInitials(contact.firstName, contact.lastName);

  const handleCall = () => {
    if (contact.phone) Linking.openURL(`tel:${contact.phone}`);
  };
  const handleSMS = () => {
    if (contact.phone) Linking.openURL(`sms:${contact.phone}`);
  };
  const handleEmail = () => {
    if (contact.email) Linking.openURL(`mailto:${contact.email}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Ionicons name="create-outline" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profile}>
          <View style={[styles.avatar, isToday && styles.avatarBirthday]}>
            {contact.photo ? (
              <Image source={{ uri: contact.photo }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <Text style={styles.name}>
            {contact.firstName} {contact.lastName}
          </Text>
          {!!contact.job && (
            <Text style={styles.jobLine}>
              {contact.job}
              {contact.company ? ` · ${contact.company}` : ''}
            </Text>
          )}
          {isToday && (
            <View style={styles.birthdayBadge}>
              <Ionicons name="gift" size={14} color={COLORS.dark} />
              <Text style={styles.birthdayText}>
                Joyeux anniversaire !{age !== null ? ` ${age} ans` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        {(contact.phone || contact.email) && (
          <View style={styles.actions}>
            {!!contact.phone && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                <Ionicons name="call" size={20} color={COLORS.accent} />
                <Text style={styles.actionLabel}>Appeler</Text>
              </TouchableOpacity>
            )}
            {!!contact.phone && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleSMS}>
                <Ionicons name="chatbubble" size={20} color={COLORS.accent} />
                <Text style={styles.actionLabel}>SMS</Text>
              </TouchableOpacity>
            )}
            {!!contact.email && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleEmail}>
                <Ionicons name="mail" size={20} color={COLORS.accent} />
                <Text style={styles.actionLabel}>Email</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Details */}
        <View style={styles.details}>
          {fields.map((field) => {
            const val = contact[field.id];
            if (!val) return null;
            if (field.id === 'firstName' || field.id === 'lastName') return null;

            let display = val;
            if (field.id === 'birthday') {
              display = formatDate(val) + (age !== null ? ` (${age} ans)` : '');
            }

            return (
              <View key={field.id} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{field.label}</Text>
                <Text style={styles.detailValue}>{display}</Text>
              </View>
            );
          })}
        </View>

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
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.dark,
  },
  editBtn: { padding: 4, width: 40, alignItems: 'flex-end' },
  profile: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBirthday: {
    backgroundColor: COLORS.birthday,
    shadowColor: COLORS.birthday,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 14,
  },
  jobLine: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  birthdayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.birthday,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  birthdayText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accent,
  },
  details: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  detailRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.dark,
  },
});
