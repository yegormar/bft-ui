import { describe, it, expect } from 'vitest';
import { formatAppTitle } from '../../src/services/exampleService';

/**
 * Regression: golden output for formatAppTitle.
 * Update expected value only when the contract intentionally changes.
 */
describe('regression: formatAppTitle output', () => {
  it('produces expected title format', () => {
    const title = formatAppTitle();
    expect(title).toBe('BFT UI v0.0.1');
  });
});
