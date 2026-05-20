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
  headerBg: '#1A1A2E',
  birthday: '#FFD700',
  birthdayBg: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#10B981',
  white: '#FFFFFF',
};

export const DARK_COLORS = {
  accent: '#E8572A',
  accentDark: '#D94420',
  accentLight: '#3D1A0A',
  dark: '#F0F0F8',
  darkSecondary: '#C0C0D0',
  gray: '#9CA3AF',
  grayLight: '#6B7280',
  background: '#0F0F1A',
  card: '#1A1A2E',
  border: '#2D2D42',
  headerBg: '#0A0A14',
  birthday: '#FFD700',
  birthdayBg: '#2A2210',
  danger: '#EF4444',
  dangerLight: '#2A0F0F',
  success: '#10B981',
  white: '#FFFFFF',
};

export const STORAGE_KEYS = {
  contacts: '@birthact_contacts',
  fields: '@birthact_fields',
  notifScheduled: '@birthact_notif_scheduled',
  language: '@birthact_language',
  defaultCountry: '@birthact_default_country',
  geocodeCache: '@birthact_geocache',
  theme: '@birthact_theme',
};

export const DEFAULT_FIELDS = [
  { id: 'lastName', label: 'lastName', type: 'text', icon: 'person-outline', removable: false },
  { id: 'firstName', label: 'firstName', type: 'text', icon: 'person-outline', removable: false },
  { id: 'phone', label: 'phone', type: 'phone', icon: 'call-outline', removable: false },
  { id: 'birthday', label: 'birthday', type: 'date', icon: 'gift-outline', removable: false },
  { id: 'city', label: 'city', type: 'text', icon: 'map-outline', removable: true },
  { id: 'metAt', label: 'metAt', type: 'text', icon: 'location-outline', removable: true },
  { id: 'job', label: 'job', type: 'text', icon: 'briefcase-outline', removable: true },
  { id: 'company', label: 'company', type: 'text', icon: 'business-outline', removable: true },
  { id: 'email', label: 'email', type: 'email', icon: 'mail-outline', removable: true },
  { id: 'notes', label: 'notes', type: 'multiline', icon: 'document-text-outline', removable: true },
];
