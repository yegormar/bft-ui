import {
  Box,
  HStack,
  Progress,
  Text,
  Tooltip,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { useMemo } from 'react';

/** Dimension keys in display order, with labels (match ai_skills_ranking_model.json). */
const STRUCTURAL_DIMENSIONS = [
  { key: 'ai_resistance', label: 'AI Resistance' },
  { key: 'leverage_multiplier', label: 'Leverage Multiplier' },
  { key: 'authority_pathway', label: 'Authority Pathway' },
  { key: 'scarcity_durability', label: 'Scarcity Durability' },
  { key: 'transferability', label: 'Cross-Domain Transferability' },
  { key: 'time_to_compound', label: 'Time-to-Compound' },
];

const SCORE_MAX = 5;

function roundTo1(num) {
  const n = Number(num);
  if (Number.isNaN(n)) return String(num);
  return (Math.round(n * 10) / 10).toFixed(1);
}

function trendLabel(aiTrend) {
  if (!aiTrend) return null;
  const t = String(aiTrend).toLowerCase();
  if (t === 'grows') return 'Grows';
  if (t === 'stays') return 'Stays';
  if (t === 'decreasing') return 'Decreasing';
  if (t === 'mixed') return 'Mixed';
  return aiTrend;
}

function applicabilityScoreDisplay(applicability, maxApplicability) {
  if (applicability == null || applicability <= 0) return '-';
  if (maxApplicability == null || maxApplicability <= 0) return '-';
  const ratio = Math.min(1, applicability / maxApplicability);
  return `${roundTo1(1 + ratio * 4)}/5`;
}

function matchScoreBandLabel(applicability, maxApplicability) {
  if (applicability == null || applicability <= 0 || maxApplicability == null || maxApplicability <= 0) return null;
  const ratio = Math.min(1, applicability / maxApplicability);
  const s = 1 + ratio * 4;
  if (s >= 4.2) return 'Very High';
  if (s >= 3.4) return 'High';
  if (s >= 2.6) return 'Medium';
  if (s >= 1.8) return 'Low';
  return 'Very Low';
}

function dimensionHintText(dimMeta) {
  if (!dimMeta) return '';
  const parts = [];
  if (dimMeta.core_question) parts.push(dimMeta.core_question);
  if (dimMeta.why_it_matters) parts.push(dimMeta.why_it_matters);
  const scale = dimMeta.scoring_scale;
  if (scale && (scale['0'] || scale['5'])) {
    parts.push(`Scale: 0 = ${scale['0'] || '-'}, 5 = ${scale['5'] || '-'}`);
  }
  return parts.join('\n\n');
}

/**
 * Full skill details (description, at a glance, AI rationale, how measured, question hints, structural scores).
 * Used on Skills page and in the Careers skill definition modal (expanded "More" view).
 */
export function SkillDetailsContent({ skill, maxApplicability, structuralDimensionMeta = [] }) {
  const scores = skill?.structural_scores || {};
  const metaByKey = useMemo(() => {
    const map = {};
    (structuralDimensionMeta || []).forEach((d) => { map[d.key] = d; });
    return map;
  }, [structuralDimensionMeta]);

  const matchDisplay = applicabilityScoreDisplay(skill?.applicability, maxApplicability);
  const matchNum = matchDisplay === '-' ? matchDisplay : matchDisplay.replace('/5', '');
  const matchBand = matchScoreBandLabel(skill?.applicability, maxApplicability);

  const sectionProps = {
    p: 4,
    borderRadius: 'lg',
    borderWidth: '1px',
    borderColor: 'chakra-border-color',
    borderLeftWidth: '4px',
    borderLeftColor: 'accent',
    bg: 'blackAlpha.30',
    _dark: { bg: 'whiteAlpha.50' },
  };

  if (!skill) return null;

  return (
    <VStack align="stretch" spacing={5}>
      {skill.description && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Description
          </Text>
          <Text fontSize="sm" lineHeight="tall" color="chakra-body-text">
            {skill.description}
          </Text>
        </Box>
      )}

      <Box {...sectionProps}>
        <Text fontWeight="semibold" fontSize="xs" mb={3} color="accent">
          At a glance
        </Text>
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm" color="chakra-body-text">
            <Text as="span" fontWeight="medium" color="chakra-subtle-text">
              Your match{' '}
            </Text>
            <Text as="span" fontWeight="medium" color="accent">
              {matchNum}
            </Text>
            {matchBand && (
              <Text as="span" color="chakra-subtle-text">
                {' '}({matchBand})
              </Text>
            )}
          </Text>
          {typeof skill.ai_future_score === 'number' && (
            <Text fontSize="sm" color="chakra-body-text">
              <Text as="span" fontWeight="medium" color="chakra-subtle-text">
                AI future{' '}
              </Text>
              <Text as="span" fontWeight="medium">
                {roundTo1(1 + skill.ai_future_score * 4)}
              </Text>
              {trendLabel(skill.ai_trend) && (
                <Text as="span" color="chakra-subtle-text">
                  {' '}({trendLabel(skill.ai_trend)})
                </Text>
              )}
            </Text>
          )}
        </VStack>
      </Box>

      {skill.ai_future_rationale && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            AI future rationale
          </Text>
          <Text fontSize="sm" lineHeight="tall" color="chakra-body-text">
            {skill.ai_future_rationale}
          </Text>
        </Box>
      )}

      {skill.how_measured_or_observed && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            How measured or observed
          </Text>
          <Text fontSize="sm" lineHeight="tall" color="chakra-body-text">
            {skill.how_measured_or_observed}
          </Text>
        </Box>
      )}

      {Array.isArray(skill.question_hints) && skill.question_hints.length > 0 && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={2} color="accent">
            Question hints
          </Text>
          <UnorderedList spacing={2} pl={4}>
            {skill.question_hints.map((hint, i) => (
              <Text as="li" key={i} fontSize="sm" lineHeight="tall" color="chakra-body-text">
                {hint}
              </Text>
            ))}
          </UnorderedList>
        </Box>
      )}

      {STRUCTURAL_DIMENSIONS.some((d) => typeof scores[d.key] === 'number') && (
        <Box {...sectionProps}>
          <Text fontWeight="semibold" fontSize="sm" mb={3} color="accent">
            Structural scores (0-5)
          </Text>
          <VStack align="stretch" spacing={3}>
            {STRUCTURAL_DIMENSIONS.map(({ key, label }) => {
              const value = scores[key];
              if (typeof value !== 'number') return null;
              const pct = Math.min(100, Math.max(0, (value / SCORE_MAX) * 100));
              const dimMeta = metaByKey[key];
              const hint = dimensionHintText(dimMeta);
              const row = (
                <Box key={key} cursor={hint ? 'help' : undefined}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="xs" fontWeight="medium">
                      {label}
                    </Text>
                    <Text fontSize="xs" color="chakra-subtle-text">
                      {roundTo1(value)}/{SCORE_MAX}
                    </Text>
                  </HStack>
                  <Progress value={pct} size="sm" colorScheme="accent" borderRadius="full" />
                </Box>
              );
              return hint ? (
                <Tooltip key={key} label={hint} placement="top" hasArrow whiteSpace="pre-wrap" maxW="320px">
                  {row}
                </Tooltip>
              ) : (
                row
              );
            })}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}
