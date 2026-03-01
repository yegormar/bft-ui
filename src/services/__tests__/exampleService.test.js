import { describe, it, expect } from 'vitest';
import { getAppInfo, formatAppTitle } from '../exampleService';

describe('exampleService', () => {
  it('getAppInfo returns name and version', () => {
    const info = getAppInfo();
    expect(info).toHaveProperty('name');
    expect(info).toHaveProperty('version');
    expect(typeof info.name).toBe('string');
    expect(typeof info.version).toBe('string');
  });

  it('formatAppTitle returns "Name vVersion"', () => {
    const title = formatAppTitle();
    expect(title).toMatch(/v\d+\.\d+\.\d+/);
  });
});
