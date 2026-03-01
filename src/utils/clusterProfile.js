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

/**
 * Computes cluster profile from pre-survey answers.
 * Weights from Q3 and Q4 only (Q4 weighted 2×). Ties broken by Q4 contribution. Q5 sets secondaryTone only.
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

  // Demographics (optional): gender (Q1), age/stage (Q2) — for UI personalization and future API use
  const genderSelected = toSelectedTexts(answers[1]);
  const ageSelected = toSelectedTexts(answers[2]);
  const demographics = {
    gender: genderSelected.length > 0 ? genderSelected[0] : null,
    ageGroup: ageSelected.length > 0 ? ageSelected[0] : null,
  };

  return {
    weights: Object.fromEntries(sorted),
    dominant: dominant.length > 0 ? dominant : ['neutral'],
    secondaryTone,
    demographics,
  };
}
