import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { isBirthdayToday, isBirthdaySoon, daysUntilBirthday, getInitials } from '../utils/helpers';

export default function ContactCard({ contact, onPress, t }) {
  const isToday = isBirthdayToday(contact.birthday);
  const soon = !isToday && isBirthdaySoon(contact.birthday);
  const days = daysUntilBirthday(contact.birthday);
  const initials = getInitials(contact.firstName, contact.lastName);

  return (
    <TouchableOpacity
      style={[styles.card, isToday && styles.cardBirthday]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, isToday && styles.avatarBirthday]}>
        {contact.photo ? (
          <Image source={{ uri: contact.photo }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.firstName} {contact.lastName}
        </Text>
        <View style={styles.meta}>
          {!!contact.job && (
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={12} color={COLORS.gray} />
              <Text style={styles.metaText} numberOfLines={1}>{contact.job}</Text>
            </View>
          )}
          {!!contact.metAt && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={COLORS.gray} />
              <Text style={styles.metaText} numberOfLines={1}>{contact.metAt}</Text>
            </View>
          )}
        </View>
        {isToday && (
          <View style={styles.badgeRow}>
            <View style={styles.badgeToday}>
              <Ionicons name="gift" size={11} color={COLORS.dark} />
              <Text style={styles.badgeText}>{t.birthdayTodayBadge}</Text>
            </View>
          </View>
        )}
        {soon && (
          <View style={styles.badgeRow}>
            <View style={styles.badgeSoon}>
              <Ionicons name="gift-outline" size={11} color={COLORS.dark} />
              <Text style={styles.badgeText}>{t.birthdayInDays(days)}</Text>
            </View>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardBirthday: {
    borderColor: COLORS.birthday,
    borderWidth: 2,
    shadowColor: COLORS.birthday,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  avatarBirthday: {
    backgroundColor: COLORS.birthday,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 3,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.gray,
    maxWidth: 120,
  },
  badgeRow: {
    marginTop: 6,
  },
  badgeToday: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.birthday,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.birthdayBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.dark,
  },
});
