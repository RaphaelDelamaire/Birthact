/**
 * Generate a unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Check if a birthday date string is today
 */
export function isBirthdayToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const bd = new Date(dateStr);
  return bd.getDate() === today.getDate() && bd.getMonth() === today.getMonth();
}

/**
 * Check if birthday is within the next N days
 */
export function isBirthdaySoon(dateStr, days = 7) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYear = today.getFullYear();
  let bd = new Date(dateStr);
  bd.setFullYear(thisYear);
  bd.setHours(0, 0, 0, 0);
  if (bd < today) bd.setFullYear(thisYear + 1);
  const diff = (bd - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

/**
 * Get the number of days until the next birthday
 */
export function daysUntilBirthday(dateStr) {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYear = today.getFullYear();
  let bd = new Date(dateStr);
  bd.setFullYear(thisYear);
  bd.setHours(0, 0, 0, 0);
  if (bd < today) bd.setFullYear(thisYear + 1);
  return Math.round((bd - today) / (1000 * 60 * 60 * 24));
}

/**
 * Format a date string to French locale
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Calculate age from a birthday date string
 */
export function getAge(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  const bd = new Date(dateStr);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age >= 0 ? age : null;
}

/**
 * Get initials from first and last name
 */
export function getInitials(firstName, lastName) {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?';
}

/**
 * Convert ISO date "YYYY-MM-DD" to display format "DD/MM/YYYY"
 */
export function dateToDisplay(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
}

/**
 * Convert display format "DD/MM/YYYY" to ISO "YYYY-MM-DD"
 */
export function displayToISO(displayStr) {
  if (!displayStr) return '';
  const parts = displayStr.split('/');
  if (parts.length !== 3 || parts[2].length !== 4) return '';
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * Auto-format date input to DD/MM/YYYY as user types digits
 */
export function formatDateInput(text) {
  const digits = text.replace(/[^0-9]/g, '');
  let result = '';
  for (let i = 0; i < digits.length && i < 8; i++) {
    if (i === 2 || i === 4) result += '/';
    result += digits[i];
  }
  return result;
}

/**
 * Sort contacts by name
 */
export function sortByName(contacts) {
  return [...contacts].sort((a, b) => {
    const nameA = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
    const nameB = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Sort contacts by upcoming birthday
 */
export function sortByBirthday(contacts) {
  return [...contacts]
    .filter((c) => c.birthday)
    .sort((a, b) => daysUntilBirthday(a.birthday) - daysUntilBirthday(b.birthday));
}
