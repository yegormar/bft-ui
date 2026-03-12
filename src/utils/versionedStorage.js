/**
 * Versioned localStorage flags. Stored value includes build version so that when
 * a new UI version is deployed (new build), old flags are ignored and effectively reset.
 * Uses virtual:build-version ('dev' in dev, ISO timestamp in production build).
 */

import { version as currentVersion } from 'virtual:build-version';

const PREFIX = 'bft_v_';

/** Key for "user has submitted feedback" (stops pulse on results page). */
export const FEEDBACK_FLAG_KEY = 'feedback_submitted';

/** Key for "user has completed triangle tutorial" (skip explainer next time). */
export const TRIANGLE_TUTORIAL_FLAG_KEY = 'triangle_tutorial_done';

function storageKey(key) {
  return `${PREFIX}${key}`;
}

/**
 * Read a versioned boolean flag. Returns true only if the flag was set in this build version.
 * If stored version differs (e.g. after deploy) or value is invalid, clears storage and returns false.
 * Handles legacy keys that stored plain 'true' (no version): treats as invalid and clears.
 */
export function getVersionedFlag(key) {
  if (typeof localStorage === 'undefined') return false;
  if (key === FEEDBACK_FLAG_KEY) {
    try {
      localStorage.removeItem('bft_feedback_submitted');
    } catch {
      // ignore
    }
  }
  const raw = localStorage.getItem(storageKey(key));
  if (raw == null || raw === '') return false;
  if (raw === 'true') {
    localStorage.removeItem(storageKey(key));
    return false;
  }
  try {
    const o = JSON.parse(raw);
    if (o.version !== currentVersion || o.value !== true) {
      localStorage.removeItem(storageKey(key));
      return false;
    }
    return true;
  } catch {
    localStorage.removeItem(storageKey(key));
    return false;
  }
}

/**
 * Set a versioned boolean flag. Survives refresh and tab close; cleared when app version changes.
 */
export function setVersionedFlag(key) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(storageKey(key), JSON.stringify({ version: currentVersion, value: true }));
}
