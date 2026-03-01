/**
 * Persists pre-survey answers and step in localStorage so they are restored when the user
 * restarts or returns to the survey (e.g. refresh or navigate back).
 */

const STORAGE_KEY = 'bft_pre_survey';

/**
 * @param {Record<number, string | string[]>} answers - question id -> value (string for single_choice, string[] for multi_choice)
 * @param {number} step - current step (0 = intro, 1..n = question index + 1)
 * @param {number} maxStep - max valid step (QUESTIONS.length)
 */
export function savePreSurveyProgress(answers, step, maxStep) {
  try {
    const safeStep = Math.max(0, Math.min(step, maxStep));
    const payload = JSON.stringify({ answers, step: safeStep });
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (e) {
    // localStorage full or disabled
  }
}

/**
 * @param {number} maxStep - max valid step (QUESTIONS.length)
 * @returns {{ answers: Record<number, string | string[]>, step: number } | null}
 */
export function loadPreSurveyProgress(maxStep) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.step !== 'number' || !data.answers || typeof data.answers !== 'object') {
      return null;
    }
    const step = Math.max(0, Math.min(Math.floor(data.step), maxStep));
    const answers = { ...data.answers };
    return { answers, step };
  } catch {
    return null;
  }
}
