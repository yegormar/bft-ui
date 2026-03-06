import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  Spinner,
  Text,
  Tooltip,
  UnorderedList,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import SkillsRadarChart from '../SkillsRadarChart';
import { getReport } from '../../services/surveyApi';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

const SORT_DESC = 'desc';
const SORT_ASC = 'asc';

function trendLabel(aiTrend) {
  if (!aiTrend) return null;
  const t = String(aiTrend).toLowerCase();
  if (t === 'grows') return 'Grows';
  if (t === 'stays') return 'Stays';
  if (t === 'decreasing') return 'Decreasing';
  if (t === 'mixed') return 'Mixed';
  return aiTrend;
}

/** Label used on the radar chart so list and graph match. */
function chartLabel(skill) {
  return (skill.short_label && skill.short_label.trim()) ? skill.short_label.trim() : skill.name;
}

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

/** Format a number to one decimal place for display in tooltips and descriptions. */
function roundTo1(num) {
  const n = Number(num);
  if (Number.isNaN(n)) return String(num);
  return (Math.round(n * 10) / 10).toFixed(1);
}

/**
 * Your-match score on a 1-5 scale (same as AI future) for display.
 * Returns "—" when applicability is missing or not comparable (no max).
 */
function applicabilityScoreDisplay(applicability, maxApplicability) {
  if (applicability == null || applicability <= 0) return '—';
  if (maxApplicability == null || maxApplicability <= 0) return '—';
  const ratio = Math.min(1, applicability / maxApplicability);
  return `${roundTo1(1 + ratio * 4)}/5`;
}

/** Band label for a 1-5 match score (e.g. "Very High"). Returns null when no score. */
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
    parts.push(`Scale: 0 = ${scale['0'] || '–'}, 5 = ${scale['5'] || '–'}`);
  }
  return parts.join('\n\n');
}

function SkillDetailsContent({ skill, maxApplicability, applicabilityScoreDisplay, trendLabel, structuralDimensionMeta }) {
  const scores = skill.structural_scores || {};
  const metaByKey = useMemo(() => {
    const map = {};
    (structuralDimensionMeta || []).forEach((d) => { map[d.key] = d; });
    return map;
  }, [structuralDimensionMeta]);

  const matchDisplay = applicabilityScoreDisplay(skill.applicability, maxApplicability);
  const matchNum = matchDisplay === '—' ? matchDisplay : matchDisplay.replace('/5', '');
  const matchBand = matchScoreBandLabel(skill.applicability, maxApplicability);

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
            Structural scores (0–5)
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

export default function SkillsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState(SORT_DESC);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  const resolvedSessionId =
    location.state?.sessionId ?? sessionStorage.getItem(RESULTS_SESSION_KEY);

  const fetchReport = useCallback(async (sid) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReport(sid);
      setReport(data);
    } catch (err) {
      setError(err.message || 'We couldn\'t load your skills. Try again or start a new discovery.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resolvedSessionId) {
      fetchReport(resolvedSessionId);
    } else {
      setLoading(false);
    }
  }, [resolvedSessionId, fetchReport]);

  const rawSkills = report?.skillDevelopmentRoadmap ?? [];
  const maxApplicability = useMemo(() => {
    if (rawSkills.length === 0) return 0;
    return Math.max(...rawSkills.map((s) => s.applicability ?? 0), 0);
  }, [rawSkills]);

  const sortedSkills = useMemo(() => {
    const list = [...rawSkills];
    if (sortOrder === SORT_ASC) {
      list.sort((a, b) => (a.applicability ?? 0) - (b.applicability ?? 0));
    } else {
      list.sort((a, b) => (b.applicability ?? 0) - (a.applicability ?? 0));
    }
    return list;
  }, [rawSkills, sortOrder]);

  const openSkillDetails = useCallback((skill) => {
    setSelectedSkill(skill);
    onDetailsOpen();
  }, [onDetailsOpen]);

  const closeSkillDetails = useCallback(() => {
    onDetailsClose();
    setSelectedSkill(null);
  }, [onDetailsClose]);

  if (!resolvedSessionId) {
    return (
      <>
        <PageHero title="Skills for you" tagline="Skills that match your strengths." />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-skills">
          <Container maxW="2xl" centerContent>
            <Box
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="chakra-border-color"
              borderLeftWidth="4px"
              borderLeftColor="accent"
              bg="chakra-body-bg"
              boxShadow="sm"
              w="full"
              maxW="md"
            >
              <VStack spacing={4} align="center" textAlign="center">
                <Text color="chakra-subtle-text">
                  Complete a discovery to see skills that fit you.
                </Text>
                <Button as={RouterLink} to="/discovery" colorScheme="brand" size="lg" px={8}>
                  Start discovery
                </Button>
              </VStack>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHero title="Skills for you" tagline="Skills that match your strengths." />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-skills">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="brand" />
              <Text color="chakra-subtle-text">Loading your skills...</Text>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Skills for you" tagline="Skills that match your strengths." />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-skills">
          <Container maxW="2xl" centerContent>
            <Box
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="chakra-border-color"
              borderLeftWidth="4px"
              borderLeftColor="accent"
              bg="chakra-body-bg"
              boxShadow="sm"
              w="full"
              maxW="md"
            >
              <VStack spacing={4} align="center" textAlign="center">
                <Text color="red.500">{error}</Text>
                <Button as={RouterLink} to="/discovery" colorScheme="brand" size="lg" px={8}>
                  Start discovery
                </Button>
              </VStack>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <PageHero title="Skills for you" tagline="Skills that match your strengths." />
      <Box as="main" py={4} px={4} bg="chakra-body-bg" data-testid="page-skills">
        <Container maxW="2xl">
          <VStack align="stretch" spacing={{ base: 2, md: 4 }} w="full">
            <Box>
              <Button
                variant="link"
                size="sm"
                minH="36px"
                onClick={() => navigate('/results', { state: { sessionId: resolvedSessionId } })}
                mb={1}
                color="accent"
                _hover={{ textDecoration: 'underline' }}
              >
                ← Back to results
              </Button>
            </Box>

            {rawSkills.length > 0 && (
              <Box w="full">
                <Text fontWeight="medium" fontSize="sm" mb={1} color="chakra-subtle-text">
                  You (blue) vs what'll matter with AI (red). Further out = better.
                </Text>
                <SkillsRadarChart skills={rawSkills} maxApplicability={maxApplicability} />
              </Box>
            )}

            <Box w="full">
              <Text color="chakra-subtle-text" fontSize="sm" mb={2}>
                Skills that fit you. Higher score = better fit.
              </Text>
              <HStack spacing={3} flexWrap="wrap">
                <Button
                  size="lg"
                  minH="44px"
                  minW="140px"
                  colorScheme={sortOrder === SORT_DESC ? 'brand' : 'gray'}
                  variant={sortOrder === SORT_DESC ? 'solid' : 'outline'}
                  onClick={() => setSortOrder(SORT_DESC)}
                  aria-pressed={sortOrder === SORT_DESC}
                  data-testid="sort-desc"
                >
                  Best to worst
                </Button>
                <Button
                  size="lg"
                  minH="44px"
                  minW="140px"
                  colorScheme={sortOrder === SORT_ASC ? 'brand' : 'gray'}
                  variant={sortOrder === SORT_ASC ? 'solid' : 'outline'}
                  onClick={() => setSortOrder(SORT_ASC)}
                  aria-pressed={sortOrder === SORT_ASC}
                  data-testid="sort-asc"
                >
                  Worst to best
                </Button>
              </HStack>
            </Box>

            {sortedSkills.length === 0 ? (
              <Box
                p={6}
                borderRadius="lg"
                borderWidth="1px"
                borderColor="chakra-border-color"
                borderLeftWidth="4px"
                borderLeftColor="accent"
                bg="chakra-body-bg"
                boxShadow="sm"
              >
                <Text color="chakra-subtle-text">
                  No skills data yet. Complete your discovery to see skills that fit your profile.
                </Text>
              </Box>
            ) : (
              <VStack as="ul" align="stretch" spacing={2} listStyleType="none" pl={0} w="full">
                {sortedSkills.map((skill) => {
                  const matchDisplay = applicabilityScoreDisplay(skill.applicability, maxApplicability);
                  const matchNum = matchDisplay === '—' ? matchDisplay : matchDisplay.replace('/5', '');
                  const matchBand = matchScoreBandLabel(skill.applicability, maxApplicability);
                  const trend = trendLabel(skill.ai_trend);
                  const labelOnChart = chartLabel(skill);
                  const matchLabel = matchBand ? `${matchNum} (${matchBand})` : matchNum;
                  return (
                    <Box
                      as="li"
                      key={skill.id}
                      id={`skill-${skill.id}`}
                      p={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      borderColor="chakra-border-color"
                      borderLeftWidth="4px"
                      borderLeftColor="accent"
                      bg="chakra-body-bg"
                      boxShadow="sm"
                      cursor="pointer"
                      onClick={() => openSkillDetails(skill)}
                      _hover={{ bg: 'blackAlpha.50', _dark: { bg: 'whiteAlpha.50' } }}
                      transition="background 0.15s"
                    >
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between" flexWrap="wrap" gap={2}>
                          <VStack align="stretch" spacing={0} flex={1} minH={skill.name && skill.name !== labelOnChart ? undefined : '28px'}>
                            <Heading as="h3" size="sm" fontWeight="semibold">
                              {labelOnChart}
                            </Heading>
                            {skill.name && skill.name !== labelOnChart ? (
                              <Text fontSize="sm" fontWeight="normal" color="chakra-subtle-text">
                                [{skill.name}]
                              </Text>
                            ) : null}
                          </VStack>
                          <HStack spacing={2}>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color={matchLabel === '—' ? 'chakra-subtle-text' : 'accent'}
                              title={matchLabel === '—' ? 'Not linked to your discovery answers' : undefined}
                            >
                              {matchLabel}
                            </Text>
                            {trend && (
                              <Box
                                as="span"
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                borderRadius="md"
                                bg="blackAlpha.100"
                                _dark={{ bg: 'whiteAlpha.100' }}
                                color="chakra-subtle-text"
                              >
                                Demand {trend}
                              </Box>
                            )}
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>
                  );
                })}
              </VStack>
            )}

            <Modal isOpen={isDetailsOpen} onClose={closeSkillDetails} size="xl" scrollBehavior="inside">
              <ModalOverlay bg="blackAlpha.600" _dark={{ bg: 'blackAlpha.700' }} />
              <ModalContent
                maxH="90vh"
                bg="chakra-body-bg"
                borderWidth="1px"
                borderColor="chakra-border-color"
                borderRadius="xl"
                boxShadow="xl"
              >
                <ModalHeader
                  borderBottomWidth="1px"
                  borderColor="chakra-border-color"
                  pb={4}
                  bg="blackAlpha.20"
                  _dark={{ bg: 'whiteAlpha.50' }}
                  borderTopRadius="xl"
                >
                  {selectedSkill && (
                    <>
                      <Text as="span" color="chakra-body-text" fontWeight="semibold">
                        {chartLabel(selectedSkill)}
                      </Text>
                      {selectedSkill.name && selectedSkill.name !== chartLabel(selectedSkill) && (
                        <Text as="span" fontWeight="normal" color="chakra-subtle-text">
                          {' '}[{selectedSkill.name}]
                        </Text>
                      )}
                    </>
                  )}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6} pt={4} bg="chakra-body-bg">
                  {selectedSkill && (
                    <SkillDetailsContent
                      skill={selectedSkill}
                      maxApplicability={maxApplicability}
                      applicabilityScoreDisplay={applicabilityScoreDisplay}
                      trendLabel={trendLabel}
                      structuralDimensionMeta={report?.structuralDimensionMeta ?? []}
                    />
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>

            <Box pt={3} borderTopWidth="1px" borderColor="chakra-border-color">
              <Button
                variant="link"
                size="sm"
                minH="36px"
                onClick={() => navigate('/results', { state: { sessionId: resolvedSessionId } })}
                color="accent"
                _hover={{ textDecoration: 'underline' }}
              >
                ← Back to results
              </Button>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
}
