/**
 * Sample service: business logic / API client pattern.
 * Services can depend on src/data and src/config.
 */

import appConfig from '../data/appConfig.json';

export function getAppInfo() {
  return {
    name: appConfig.appName,
    version: appConfig.version,
  };
}

export function formatAppTitle() {
  const info = getAppInfo();
  return `${info.name} v${info.version}`;
}
