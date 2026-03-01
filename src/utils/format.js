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

/**
 * Strip markdown formatting for plain-text display (e.g. LLM output shown in HTML).
 * Removes **bold**, __bold__, *italic*, _italic_ so raw asterisks don't show.
 */
export function stripMarkdown(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .trim();
}
