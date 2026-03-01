/**
 * Pure formatting helpers.
 */

export function formatDate(date) {
  if (!(date instanceof Date)) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

export function slugify(text) {
  if (typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
