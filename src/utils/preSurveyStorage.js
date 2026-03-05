/**
 * Persists pre-survey answers and step in localStorage so they are restored when the user
 * restarts or returns to the survey (e.g. refresh or navigate back).
 */

const STORAGE_KEY = 'bft_pre_survey';
const COMPLETED_FLAG_KEY = 'bft_pre_survey_completed';

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
    
    // Mark as completed if at the end
    if (step === maxStep) {
      localStorage.setItem(COMPLETED_FLAG_KEY, 'true');
    }
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

/**
 * @returns {boolean} - true if user has fully completed the pre-survey
 */
export function hasCompletedPreSurvey(maxStep) {
  try {
    const completed = localStorage.getItem(COMPLETED_FLAG_KEY);
    if (completed !== 'true') return false;
    
    const progress = loadPreSurveyProgress(maxStep);
    return progress && progress.step === maxStep;
  } catch {
    return false;
  }
}

/**
 * Clear the pre-survey completion status
 */
export function clearPreSurveyCompletion() {
  try {
    localStorage.removeItem(COMPLETED_FLAG_KEY);
  } catch {
    // ignore
  }
}
