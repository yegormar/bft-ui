/**
 * Normalize answer value to array of option texts (single_choice stores string, multi_choice stores string[]).
 */
function toSelectedTexts(value) {
  if (Array.isArray(value)) return value;
  if (value != null && value !== '') return [value];
  return [];
}

/** Only Q3 (interests) and Q4 (how you like) drive cluster weights. Q4 counts 2× so scenario style follows "how you like" more. Q1, Q2, Q5 excluded so neutral/demographics don't inflate. */
const CLUSTER_QUESTION_WEIGHT = { 3: 1, 4: 2 };

/** Q7 drives preferred scenario settings only. */
const SETTINGS_QUESTION_ID = 7;

/** Q6 drives tone preference (toneInstruction) when present. */
const TONE_QUESTION_ID = 6;

/** All cluster names that can appear in Q3, Q4, Q5 options (for avoid list). */
const CLUSTER_NAMES_FROM_SURVEY = [
  'gaming', 'technical', 'creative', 'social', 'strategic', 'neutral',
  'adventurous', 'structured',
];

/** Tone instruction for LLM when Q5 (vibe) is not neutral. */
const TONE_INSTRUCTIONS = {
  adventurous: 'Prefer scenarios with some novelty or unpredictability.',
  structured: 'Prefer clear, step-by-step situations and predictable stakes.',
};

/** Tone instruction from Q6 (explicit tone preference). Overrides Q5-derived tone when set. */
const TONE_INSTRUCTIONS_Q6 = {
  casual_humor: 'Keep it casual and a bit funny; light tone.',
  friendly_direct: 'Friendly but straightforward; no jokes needed.',
  serious_direct: 'Serious and to the point; just get on with it.',
};

/** Complexity instruction from age group (Q2). Keys match current pre_survey Q2 option text. */
const COMPLEXITY_INSTRUCTIONS = {
  'Middle school (or younger)': 'Use simpler sentences and concrete, relatable examples.',
  'High school': 'Use simpler sentences and concrete, relatable examples.',
  'College or university': 'You may use more abstract or professional situations if they fit.',
  'Working or done with school': 'You may use more abstract or professional situations if they fit.',
};

/**
 * Computes cluster profile from pre-survey answers.
 * Weights from Q3 and Q4 only (Q4 weighted 2×). Ties broken by Q4 contribution. Q5 sets secondaryTone only.
 * Q6 sets toneInstruction when option has .tone; Q7 sets preferredSettings. Secondary clusters and avoidClusters derived for tailoring.
 */
export function computeClusterProfile(questions, answers) {
  const combined = {};
  const fromQ4 = {};

  for (const q of questions) {
    const mul = CLUSTER_QUESTION_WEIGHT[q.id];
    if (mul == null) continue;
    const selectedTexts = toSelectedTexts(answers[q.id]);
    if (selectedTexts.length === 0) continue;

    for (const opt of q.options) {
      if (!selectedTexts.includes(opt.text)) continue;
      for (const [cluster, w] of Object.entries(opt.scenario_clusters || {})) {
        const add = w * mul;
        combined[cluster] = (combined[cluster] ?? 0) + add;
        if (q.id === 4) fromQ4[cluster] = (fromQ4[cluster] ?? 0) + add;
      }
    }
  }

  const sorted = Object.entries(combined)
    .filter(([, w]) => w > 0)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return (fromQ4[b[0]] ?? 0) - (fromQ4[a[0]] ?? 0);
    });

  const maxWeight = sorted[0]?.[1] ?? 0;
  const dominant = sorted
    .filter(([, w]) => w === maxWeight)
    .map(([name]) => name);

  // Secondary clusters: next 2 by weight that are not in dominant
  const dominantSet = new Set(dominant);
  const secondary = sorted
    .filter(([name]) => !dominantSet.has(name))
    .slice(0, 2)
    .map(([name]) => name);

  // Avoid clusters: present in Q3/Q4/Q5 options but never selected; exclude neutral
  const selectedClusterSet = new Set(Object.keys(combined));
  const avoidClusters = CLUSTER_NAMES_FROM_SURVEY.filter(
    (name) => name !== 'neutral' && !selectedClusterSet.has(name)
  );

  // Secondary tone from Risk/Novelty (Q5)
  const q5 = questions.find((qu) => qu.id === 5);
  let secondaryTone = 'neutral';
  const q5Selected = toSelectedTexts(answers[5]);
  if (q5 && q5Selected.length > 0) {
    const opt = q5.options.find((o) => o.text === q5Selected[0]);
    if (opt?.scenario_clusters) {
      if (opt.scenario_clusters.adventurous) secondaryTone = 'adventurous';
      else if (opt.scenario_clusters.structured) secondaryTone = 'structured';
    }
  }
  // Tone: prefer explicit Q6 selection (.tone), else Q5 vibe (secondaryTone)
  let toneInstruction = null;
  const q6Tone = questions.find((qu) => qu.id === TONE_QUESTION_ID);
  const q6ToneSelected = toSelectedTexts(answers[TONE_QUESTION_ID]);
  if (q6Tone && q6ToneSelected.length > 0) {
    const toneOpt = q6Tone.options.find((o) => o.text === q6ToneSelected[0]);
    if (toneOpt?.tone && TONE_INSTRUCTIONS_Q6[toneOpt.tone]) {
      toneInstruction = TONE_INSTRUCTIONS_Q6[toneOpt.tone];
    }
  }
  if (toneInstruction == null && secondaryTone !== 'neutral') {
    toneInstruction = TONE_INSTRUCTIONS[secondaryTone] ?? null;
  }

  // Demographics (optional): gender (Q1), age/stage (Q2) for UI personalization and future API use
  const genderSelected = toSelectedTexts(answers[1]);
  const ageSelected = toSelectedTexts(answers[2]);
  const ageGroup = ageSelected.length > 0 ? ageSelected[0] : null;
  const demographics = {
    gender: genderSelected.length > 0 ? genderSelected[0] : null,
    ageGroup,
  };
  const complexityInstruction = ageGroup ? COMPLEXITY_INSTRUCTIONS[ageGroup] ?? null : null;

  // Preferred scenario settings from Q7
  let preferredSettings = [];
  const q7 = questions.find((qu) => qu.id === SETTINGS_QUESTION_ID);
  const q7Selected = toSelectedTexts(answers[SETTINGS_QUESTION_ID]);
  if (q7 && q7Selected.length > 0) {
    for (const opt of q7.options || []) {
      if (!q7Selected.includes(opt.text)) continue;
      const setting = opt.scenario_setting;
      if (setting && setting !== 'any') preferredSettings.push(setting);
    }
  }

  return {
    weights: Object.fromEntries(sorted),
    dominant: dominant.length > 0 ? dominant : ['neutral'],
    secondary,
    avoidClusters,
    secondaryTone,
    toneInstruction,
    complexityInstruction,
    preferredSettings,
    demographics,
  };
}
