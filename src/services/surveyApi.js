/**
 * Survey/session API client. In dev with proxy, use empty apiBaseUrl (relative /api). Otherwise set VITE_API_BASE_URL.
 */

import { ulid } from 'ulid';
import { appConfig } from '../config/env';

const baseUrl = appConfig.apiBaseUrl ?? '';
const BASE = (baseUrl || '').replace(/\/$/, '') + '/api';

async function request(method, path, body) {
  const url = `${BASE}${path}`;
  const opts = { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include' };
  if (body != null) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = new Error(res.statusText || `HTTP ${res.status}`);
    err.status = res.status;
    err.response = res;
    try {
      err.body = await res.json();
    } catch {
      err.body = null;
    }
    throw err;
  }
  return res.json();
}

export async function createSession(preSurveyProfile = null) {
  const id = ulid();
  const body = { id };
  if (preSurveyProfile != null) body.preSurveyProfile = preSurveyProfile;
  return request('POST', '/sessions', body);
}

export async function submitAnswers(sessionId, answers) {
  return request('POST', `/sessions/${sessionId}/assessment/answers`, { answers });
}

export async function getNextQuestion(sessionId) {
  return request('GET', `/sessions/${sessionId}/assessment/next`);
}

export async function getAssessment(sessionId) {
  return request('GET', `/sessions/${sessionId}/assessment`);
}

export async function getReport(sessionId) {
  return request('GET', `/sessions/${sessionId}/report`);
}
