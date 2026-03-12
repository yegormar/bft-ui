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
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import SkillsRadarChart from '../SkillsRadarChart';
import { SkillDetailsContent } from '../SkillDetailsContent';
import { getReport, getAppConfig } from '../../services/surveyApi';
import { getBandForScore } from '../../utils/bandsRanges';

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

/** Raw score 1-5 from API (no UI scaling). Used only for band lookup. */
function rawScore(applicability) {
  if (applicability == null || applicability <= 0) return null;
  return Math.max(1, Math.min(5, applicability));
}

/** Band label for a 1-5 match score. Uses API value only; bands config for labels when provided. */
function matchScoreBandLabel(applicability, bands) {
  const score = rawScore(applicability);
  if (score == null) return null;
  if (bands != null && Array.isArray(bands) && bands.length > 0) {
    const band = getBandForScore(score, bands);
    return band ? band.label : null;
  }
  if (score >= 4.5) return 'Very High';
  if (score >= 3.4) return 'High';
  if (score >= 2.6) return 'Medium';
  if (score >= 1.8) return 'Low';
  return 'Very Low';
}

/** Display applicability as from API (1-5). No scaling. */
function applicabilityScoreDisplay(applicability) {
  if (applicability == null || applicability <= 0) return '-';
  const score = Math.max(1, Math.min(5, applicability));
  return `${(Math.round(score * 10) / 10).toFixed(1)}/5`;
}

export default function SkillsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [appConfig, setAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState(SORT_DESC);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const bands = appConfig?.bandsRanges ?? null;

  const [searchParams] = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');
  const resolvedSessionId =
    urlSessionId ?? location.state?.sessionId ?? sessionStorage.getItem(RESULTS_SESSION_KEY);

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
    getAppConfig().then((data) => setAppConfig(data)).catch(() => setAppConfig(null));
  }, []);

  useEffect(() => {
    if (resolvedSessionId) {
      fetchReport(resolvedSessionId);
    } else {
      setLoading(false);
    }
  }, [resolvedSessionId, fetchReport]);

  const rawSkills = report?.skillDevelopmentRoadmap ?? [];
  const { minApplicability, maxApplicability } = useMemo(() => {
    if (rawSkills.length === 0) return { minApplicability: 0, maxApplicability: 0 };
    const vals = rawSkills.map((s) => s.applicability ?? 0).filter((v) => v > 0);
    const min = vals.length ? Math.min(...vals) : 0;
    const max = vals.length ? Math.max(...vals) : 0;
    return { minApplicability: min, maxApplicability: max };
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
        <PageHero title="Skills for you" tagline="Skills to grow that match your aptitudes." />
        <Box as="main" py={0} px={0} bg="chakra-body-bg" data-testid="page-skills">
          <Container maxW="2xl" centerContent p={0}>
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
        <PageHero title="Skills for you" tagline="Skills to grow that match your aptitudes." />
        <Box as="main" py={0} px={0} bg="chakra-body-bg" data-testid="page-skills">
          <Container maxW="2xl" centerContent p={0}>
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
        <PageHero title="Skills for you" tagline="Skills to grow that match your aptitudes." />
        <Box as="main" py={0} px={0} bg="chakra-body-bg" data-testid="page-skills">
          <Container maxW="2xl" centerContent p={0}>
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
      <PageHero title="Skills for you" tagline="Skills to grow that match your aptitudes." />
      <Box as="main" py={0} px={0} bg="chakra-body-bg" data-testid="page-skills">
        <Container maxW="2xl" p={0}>
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
                <HStack fontWeight="medium" fontSize="sm" mb={2} color="chakra-subtle-text" spacing={1.5} flexWrap="wrap" align="center" as="p">
                  <Text as="span">You</Text>
                  <Box as="span" w={3} h={3} borderRadius="sm" bg="blue.400" flexShrink={0} />
                  <Text as="span"> vs what'll matter with AI</Text>
                  <Box as="span" w={3} h={3} borderRadius="sm" bg="red.400" flexShrink={0} />
                  <Text as="span">. Further out = better.</Text>
                </HStack>
                <SkillsRadarChart skills={rawSkills} minApplicability={minApplicability} maxApplicability={maxApplicability} bandsRanges={bands} />
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
                  const matchDisplay = applicabilityScoreDisplay(skill.applicability);
                  const matchNum = matchDisplay === '-' ? matchDisplay : matchDisplay.replace('/5', '');
                  const matchBand = matchScoreBandLabel(skill.applicability, bands);
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
                              color={matchLabel === '-' ? 'chakra-subtle-text' : 'accent'}
                              title={matchLabel === '-' ? 'Not linked to your discovery answers' : undefined}
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
                      minApplicability={minApplicability}
                      maxApplicability={maxApplicability}
                      structuralDimensionMeta={report?.structuralDimensionMeta ?? []}
                      bandsRanges={bands}
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
