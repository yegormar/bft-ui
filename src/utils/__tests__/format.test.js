import { describe, it, expect } from 'vitest';
import { formatDate, slugify } from '../format';

describe('formatDate', () => {
  it('returns ISO date string (YYYY-MM-DD) for a Date', () => {
    const d = new Date('2025-02-28T12:00:00Z');
    expect(formatDate(d)).toBe('2025-02-28');
  });

  it('returns empty string for non-Date', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('2025-02-28')).toBe('');
  });
});

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips non-alphanumeric except hyphen', () => {
    expect(slugify('Test! @# string')).toBe('test--string');
  });

  it('returns empty string for non-string', () => {
    expect(slugify(null)).toBe('');
  });
});
