import { describe, it, expect } from 'vitest';
import { getAppInfo } from '../../src/services/exampleService';
import appConfig from '../../src/data/appConfig.json';

/**
 * Integration: data flows from static data through service.
 */
describe('integration: data flow from data to service', () => {
  it('service getAppInfo matches appConfig.json', () => {
    const info = getAppInfo();
    expect(info.name).toBe(appConfig.appName);
    expect(info.version).toBe(appConfig.version);
  });
});
