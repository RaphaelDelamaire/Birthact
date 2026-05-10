// Birthact Design Tokens
export const COLORS = {
  accent: '#E8572A',
  accentDark: '#D94420',
  accentLight: '#FFF0EB',
  dark: '#1A1A2E',
  darkSecondary: '#16213E',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  background: '#FAFAF9',
  card: '#FFFFFF',
  border: '#E8E8E4',
  birthday: '#FFD700',
  birthdayBg: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#10B981',
  white: '#FFFFFF',
};

export const STORAGE_KEYS = {
  contacts: '@birthact_contacts',
  fields: '@birthact_fields',
  notifScheduled: '@birthact_notif_scheduled',
  language: '@birthact_language',
};

export const DEFAULT_FIELDS = [
  { id: 'lastName', label: 'lastName', type: 'text', icon: 'person-outline', removable: false },
  { id: 'firstName', label: 'firstName', type: 'text', icon: 'person-outline', removable: false },
  { id: 'phone', label: 'phone', type: 'phone', icon: 'call-outline', removable: false },
  { id: 'birthday', label: 'birthday', type: 'date', icon: 'gift-outline', removable: false },
  { id: 'metAt', label: 'metAt', type: 'text', icon: 'location-outline', removable: false },
  { id: 'job', label: 'job', type: 'text', icon: 'briefcase-outline', removable: false },
  { id: 'company', label: 'company', type: 'text', icon: 'business-outline', removable: false },
  { id: 'email', label: 'email', type: 'email', icon: 'mail-outline', removable: false },
  { id: 'notes', label: 'notes', type: 'multiline', icon: 'document-text-outline', removable: false },
];
