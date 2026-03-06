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

/** Default tone for all users (no tone question in pre-survey). */
const DEFAULT_TONE_INSTRUCTION = 'Friendly but straightforward; no jokes needed.';

/** All cluster names that can appear in Q3, Q4, Q5 options (for avoid list). */
const CLUSTER_NAMES_FROM_SURVEY = [
  'gaming', 'technical', 'creative', 'social', 'strategic', 'neutral',
  'adventurous', 'structured',
];

/** Complexity instruction from age group (Q2). Keys match current pre_survey Q2 option text. */
const COMPLEXITY_INSTRUCTIONS = {
  'Middle school': 'Use simpler sentences and concrete, relatable examples.',
  'Middle school (or younger)': 'Use simpler sentences and concrete, relatable examples.',
  'High school': 'Use simpler sentences and concrete, relatable examples.',
  'College or university': 'You may use more abstract or professional situations if they fit.',
  'Working or done with school': 'You may use more abstract or professional situations if they fit.',
};

/**
 * Computes cluster profile from pre-survey answers.
 * Weights from Q3 and Q4 only (Q4 weighted 2×). Ties broken by Q4 contribution. Q5 sets secondaryTone only.
 * toneInstruction is always the default. Secondary clusters and avoidClusters derived for tailoring.
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
  // Tone: always use default (no tone question in pre-survey)
  const toneInstruction = DEFAULT_TONE_INSTRUCTION;

  // Demographics (optional): gender (Q1), age/stage (Q2) for UI personalization and future API use
  const genderSelected = toSelectedTexts(answers[1]);
  const ageSelected = toSelectedTexts(answers[2]);
  const ageGroup = ageSelected.length > 0 ? ageSelected[0] : null;
  const demographics = {
    gender: genderSelected.length > 0 ? genderSelected[0] : null,
    ageGroup,
  };
  const complexityInstruction = ageGroup ? COMPLEXITY_INSTRUCTIONS[ageGroup] ?? null : null;

  return {
    weights: Object.fromEntries(sorted),
    dominant: dominant.length > 0 ? dominant : ['neutral'],
    secondary,
    avoidClusters,
    secondaryTone,
    toneInstruction,
    complexityInstruction,
    preferredSettings: [],
    demographics,
  };
}
