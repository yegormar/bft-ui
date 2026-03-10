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

/**
 * Replace all answers for a session (e.g. after user changed one or more on "Your answers" page).
 * Rebuilds coverage and dimension scores on the server.
 * @param {string} sessionId
 * @param {{ answers: Array<{ questionId: string, value: string | string[] }> }} payload
 */
export async function replaceAnswers(sessionId, payload) {
  return request('PUT', `/sessions/${sessionId}/assessment/answers`, payload);
}

export async function getNextQuestion(sessionId) {
  return request('GET', `/sessions/${sessionId}/assessment/next`);
}

export async function getAssessment(sessionId) {
  return request('GET', `/sessions/${sessionId}/assessment`);
}

/**
 * Get report. By default returns core only (dimensions, skills; no LLM).
 * Pass { includeLlm: true } for profile summary (triggers LLM). Careers use core report + occupations API.
 * Uses a cache-busting query param so skills/dimension data always reflects current answers.
 */
export async function getReport(sessionId, options = {}) {
  const includeFull = options.includeLlm === true;
  const params = new URLSearchParams();
  if (includeFull) params.set('include', 'full');
  params.set('_', String(Date.now()));
  const reportPath = `/sessions/${sessionId}/report?${params.toString()}`;
  return request('GET', reportPath);
}

/**
 * Get session payload for LLM: single JSON with questions_and_answers, dimensions (with scores and metadata),
 * skills (with applicability), and personality_cluster (pre_survey_profile + Q&A). Use for Profile Summary
 * evidence sections, fallback when LLM summary is missing, or as input to summary/recommendations LLM.
 * See bft-doc/session-payload-for-llm.md and bft-doc/profile-summary-page-and-payload.md.
 */
export async function getReportPayload(sessionId) {
  return request('GET', `/sessions/${sessionId}/report/payload`);
}

/**
 * Get occupations scored by selected skill IDs (legacy; no bucket or dimension fit).
 * With groupByCategory true, returns { groups: [ { categoryKey, categoryLabel, occupations } ] }.
 * Otherwise returns flat [{ nocCode, name, matchScore, categoryKey, categoryLabel }].
 */
export async function getOccupationsBySkillIds(skillIds, groupByCategory = true) {
  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    return groupByCategory ? { groups: [] } : [];
  }
  const q = new URLSearchParams();
  skillIds.forEach((id) => q.append('skillIds', id));
  if (groupByCategory) q.set('groupBy', 'category');
  return request('GET', `/occupations?${q.toString()}`);
}

/**
 * Match occupations by skills (with bucket and applicability) and dimension scores.
 * skills: [{ id, bucket: 'low'|'medium'|'high', applicability }], dimensionScores: { traits: [...], values: [...] }.
 * Returns { groups } when groupByCategory true; each occupation has matchScore and aiRelevanceFromSkills.
 */
export async function matchOccupations(skills, dimensionScores, groupByCategory = true) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return groupByCategory ? { groups: [] } : [];
  }
  return request('POST', '/occupations/match', {
    skills,
    dimensionScores: dimensionScores || { traits: [], values: [] },
    groupBy: groupByCategory ? 'category' : undefined,
  });
}

/**
 * Get full occupation by NOC code (for detail modal).
 */
export async function getOccupationByNocCode(nocCode) {
  if (!nocCode) throw new Error('nocCode is required');
  return request('GET', `/occupations/${encodeURIComponent(nocCode)}`);
}

/**
 * Get app config for the frontend. Required for Careers page loading state.
 */
export async function getAppConfig() {
  return request('GET', '/config');
}

/**
 * Generate career paths via LLM.
 * Time-investment buckets: high = user will invest a lot; low = minimal. High-bucket skills are weighted much more.
 * @param {string} sessionId
 * @param {Array<{ id: string, bucket: 'high'|'medium'|'low' }>} skills - Selected skills with bucket per skill.
 * @returns {Promise<{ paths: Array<{ study: string, initialJob: string, ultimateJob: string, rationale?: string }> }>}
 */
export async function postCareerPaths(sessionId, skills) {
  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
    throw new Error('sessionId is required');
  }
  if (!Array.isArray(skills)) {
    throw new Error('skills must be an array of { id, bucket }');
  }
  const valid = skills.filter((s) => s && typeof s.id === 'string' && s.id.trim() !== '' && ['high', 'medium', 'low'].includes(s.bucket));
  if (valid.length === 0 && skills.length > 0) {
    throw new Error('Each skill must have id and bucket (high, medium, or low).');
  }
  return request('POST', `/sessions/${encodeURIComponent(sessionId)}/career-paths`, {
    skills: valid,
  });
}

/**
 * Submit user feedback (rating 1-5, optional improve/good text).
 * Marks feedback as submitted in localStorage so the results-page pulse stops.
 */
export async function submitFeedback(payload) {
  const { rating, improve, good } = payload ?? {};
  if (rating == null || rating < 1 || rating > 5) {
    throw new Error('Rating must be 1 to 5');
  }
  return request('POST', '/feedback', {
    rating: Number(rating),
    improve: improve && String(improve).trim() || undefined,
    good: good && String(good).trim() || undefined,
  });
}
