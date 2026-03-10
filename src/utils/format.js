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

/** Allowed HTML tags for LLM-generated profile summary (headings, paragraphs, bold, table). */
const ALLOWED_PROFILE_HTML_TAGS = new Set(['h2', 'h3', 'p', 'b', 'table', 'tbody', 'tr', 'td', 'th']);

/**
 * Sanitize HTML so only allowed tags remain. All attributes are stripped to avoid XSS.
 * Use for profile summary content that may contain <h2>, <h3>, <b>, <table>, etc.
 * @param {string} html
 * @returns {string} Safe HTML with only allowed tags (no attributes).
 */
export function sanitizeProfileHtml(html) {
  if (typeof html !== 'string') return '';
  return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match) => {
    const tag = (match.match(/<\/?([a-z][a-z0-9]*)/i) || [])[1];
    if (!tag || !ALLOWED_PROFILE_HTML_TAGS.has(tag.toLowerCase())) return '';
    return match.startsWith('</') ? `</${tag.toLowerCase()}>` : `<${tag.toLowerCase()}>`;
  });
}

/**
 * Return true if the string looks like it contains allowed profile HTML (so we render as HTML).
 */
export function hasProfileHtml(text) {
  if (typeof text !== 'string') return false;
  return /<\/?(h2|h3|p|b|table|tbody|tr|td|th)\b/i.test(text);
}
