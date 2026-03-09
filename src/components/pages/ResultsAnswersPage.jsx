import {
  Box,
  Button,
  Container,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import PreSurveyQuestion from '../Discovery/PreSurveyQuestion';
import TriangleQuestion from '../Discovery/TriangleQuestion';
import { getAssessment, replaceAnswers } from '../../services/surveyApi';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

/** Short display name for a dimension id (e.g. value_mastery_growth -> Mastery growth). */
function dimensionShortName(dimensionId) {
  if (typeof dimensionId !== 'string') return '';
  const parts = dimensionId.replace(/^(value_|trait_|aptitude_)/, '').split('_');
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

/** For a triangle answer, return how it was interpreted: scores 1-5 per dimension and a one-line summary. */
function triangleInterpretation(item, userAnswer) {
  if (item?.type !== 'triangle' || !item.vertices || typeof userAnswer !== 'object') return null;
  const va = item.vertices.a || {};
  const vb = item.vertices.b || {};
  const vc = item.vertices.c || {};
  const a = Math.max(0, Math.min(1, Number(userAnswer.a) || 1 / 3));
  const b = Math.max(0, Math.min(1, Number(userAnswer.b) || 1 / 3));
  const c = Math.max(0, Math.min(1, Number(userAnswer.c) || 1 / 3));
  const sum = a + b + c;
  const na = sum > 0 ? a / sum : 1 / 3;
  const nb = sum > 0 ? b / sum : 1 / 3;
  const nc = sum > 0 ? c / sum : 1 / 3;
  const score = (coord) => Math.round((coord * 4 + 1) * 100) / 100;
  const band = (s) => (s <= 2 ? 'low' : s >= 4 ? 'high' : 'medium');
  return {
    a: { id: va.dimensionId, name: dimensionShortName(va.dimensionId), pct: Math.round(na * 100), score: score(na), band: band(score(na)) },
    b: { id: vb.dimensionId, name: dimensionShortName(vb.dimensionId), pct: Math.round(nb * 100), score: score(nb), band: band(score(nb)) },
    c: { id: vc.dimensionId, name: dimensionShortName(vc.dimensionId), pct: Math.round(nc * 100), score: score(nc), band: band(score(nc)) },
  };
}

function formatAnswer(question, userAnswer) {
  if (userAnswer == null || userAnswer === '') return 'No answer';
  if (question?.type === 'triangle' && typeof userAnswer === 'object' && userAnswer.a != null && userAnswer.b != null && userAnswer.c != null) {
    const a = Math.round((userAnswer.a ?? 0) * 100);
    const b = Math.round((userAnswer.b ?? 0) * 100);
    const c = Math.round((userAnswer.c ?? 0) * 100);
    return `Position: A ${a}%, B ${b}%, C ${c}%`;
  }
  if (Array.isArray(userAnswer)) {
    return userAnswer
      .map((v, i) => {
        const opt = question?.options?.find((o) => o.value === v || o.text === v);
        return `${i + 1}. ${opt ? opt.text : String(v)}`;
      })
      .join(', ');
  }
  const opt = question?.options?.find((o) => o.value === userAnswer || o.text === userAnswer);
  return opt ? (opt.text || String(userAnswer)) : String(userAnswer);
}

/** Convert stored value (API format) to what PreSurveyQuestion expects (text for single/multi, values for rank). */
function toDisplayValue(item, rawValue) {
  if (item.type === 'triangle') return rawValue && typeof rawValue === 'object' ? rawValue : { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  if (item.type === 'rank') return Array.isArray(rawValue) ? rawValue : [];
  if (item.type === 'multi_choice' && Array.isArray(rawValue)) {
    return rawValue.map((v) => {
      const opt = item.options?.find((o) => o.value === v);
      return opt ? opt.text : String(v);
    });
  }
  const opt = item.options?.find((o) => o.value === rawValue);
  return opt ? opt.text : (rawValue != null ? String(rawValue) : '');
}

/** Convert PreSurveyQuestion output back to API format (value or array of values). */
function fromDisplayValue(item, displayValue) {
  if (item.type === 'triangle') return displayValue && typeof displayValue === 'object' ? displayValue : { a: 1 / 3, b: 1 / 3, c: 1 / 3 };
  if (item.type === 'rank') return Array.isArray(displayValue) ? displayValue : [];
  if (item.type === 'multi_choice' && Array.isArray(displayValue)) {
    return displayValue.map((t) => {
      const opt = item.options?.find((o) => o.text === t);
      return opt ? opt.value : t;
    });
  }
  const opt = item.options?.find((o) => o.text === displayValue);
  return opt ? opt.value : (displayValue != null ? String(displayValue) : '');
}

function canProceed(item, value) {
  if (item?.type === 'triangle') {
    return (
      value && typeof value.a === 'number' && typeof value.b === 'number' && typeof value.c === 'number' &&
      Math.abs((value.a + value.b + value.c) - 1) < 0.01
    );
  }
  if (item?.type === 'single_choice') return value != null && value !== '';
  if (item?.type === 'multi_choice') return Array.isArray(value) && value.length > 0;
  if (item?.type === 'rank') return Array.isArray(value) && value.length === (item.options?.length ?? 0);
  return false;
}

export default function ResultsAnswersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  /** Local overrides: questionId -> value (API format: string or array). */
  const [localOverrides, setLocalOverrides] = useState({});
  /** Modal: which item is being edited and draft display value. */
  const [editModal, setEditModal] = useState({ open: false, item: null, draftValue: null });
  const [recalculating, setRecalculating] = useState(false);
  const [recalcError, setRecalcError] = useState(null);

  const resolvedSessionId =
    location.state?.sessionId ?? sessionStorage.getItem(RESULTS_SESSION_KEY);

  const fetchAssessment = useCallback(async (sid) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssessment(sid);
      setAssessment(data);
    } catch (err) {
      setError(err.message || 'We couldn\'t load your answers. Try again or start a new discovery.');
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resolvedSessionId) {
      fetchAssessment(resolvedSessionId);
    } else {
      setLoading(false);
    }
  }, [resolvedSessionId, fetchAssessment]);

  const openChangeAnswer = (item) => {
    const raw = localOverrides[item.questionId] ?? item.userAnswer;
    setEditModal({
      open: true,
      item,
      draftValue: toDisplayValue(item, raw),
    });
  };

  const closeChangeAnswer = () => {
    setEditModal({ open: false, item: null, draftValue: null });
  };

  const saveChangeAnswer = () => {
    if (!editModal.item) return;
    const apiValue = fromDisplayValue(editModal.item, editModal.draftValue);
    setLocalOverrides((prev) => ({ ...prev, [editModal.item.questionId]: apiValue }));
    closeChangeAnswer();
  };

  const hasAnyOverride = Object.keys(localOverrides).length > 0;

  const handleRecalculate = async () => {
    if (!resolvedSessionId || !hasAnyOverride) return;
    setRecalculating(true);
    setRecalcError(null);
    try {
      const asked = assessment?.askedQuestionsWithAnswers ?? [];
      const answers = asked.map((item) => ({
        questionId: item.questionId,
        value: localOverrides[item.questionId] ?? item.userAnswer,
      }));
      await replaceAnswers(resolvedSessionId, { answers });
      sessionStorage.setItem(RESULTS_SESSION_KEY, resolvedSessionId);
      navigate('/results', { state: { sessionId: resolvedSessionId } });
    } catch (err) {
      setRecalcError(err.message || 'Failed to recalculate. Try again.');
    } finally {
      setRecalculating(false);
    }
  };

  if (!resolvedSessionId) {
    return (
      <>
        <PageHero title="Your answers" tagline="Questions you answered" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-answers">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4} align="center" textAlign="center">
              <Text color="chakra-subtle-text">Complete a discovery to see your answers.</Text>
              <Button as={RouterLink} to="/discovery" colorScheme="brand" size="lg" px={8}>
                Start discovery
              </Button>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHero title="Your answers" tagline="Questions you answered" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-answers">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="brand" />
              <Text color="chakra-subtle-text">Loading your answers...</Text>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Your answers" tagline="Questions you answered" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-answers">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4} align="center" textAlign="center">
              <Text color="red.500">{error}</Text>
              <Button as={RouterLink} to="/discovery" colorScheme="brand" size="lg" px={8}>
                Start discovery
              </Button>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  const asked = assessment?.askedQuestionsWithAnswers ?? [];
  const hasContent = asked.length > 0;

  return (
    <>
      <PageHero title="Your answers" tagline="Questions you answered" />
      <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-answers">
        <Container maxW="2xl">
          <VStack align="stretch" spacing={6}>
            <Button
              as={RouterLink}
              to="/results"
              state={{ sessionId: resolvedSessionId }}
              variant="ghost"
              size="sm"
              alignSelf="flex-start"
            >
              ← Back to results
            </Button>
            <Box
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="chakra-border-color"
              bg="blackAlpha.50"
              _dark={{ bg: 'whiteAlpha.50' }}
            >
              <Text fontSize="sm" color="chakra-subtle-text" mb={2}>
                No test is perfect, but that is why you can keep doing new tests again and again to
                see emerging patterns. Tests are different each time; use the button below to start
                over.
              </Text>
              <Button
                as={RouterLink}
                to="/discovery"
                colorScheme="brand"
                size="md"
              >
                Start over
              </Button>
            </Box>
            {hasContent ? (
              <VStack align="stretch" spacing={4}>
                <Heading size="sm" color="chakra-subtle-text">
                  Asked questions and your choices ({asked.length})
                </Heading>
                {asked.map((item, i) => {
                  const effectiveAnswer = localOverrides[item.questionId] ?? item.userAnswer;
                  const isUpdated = item.questionId in localOverrides;
                  return (
                    <Box
                      key={item.questionId ?? i}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor="chakra-border-color"
                      bg="white"
                      _dark={{ bg: 'whiteAlpha.100' }}
                    >
                      {item.title && (
                        <Text fontWeight="semibold" fontSize="sm" mb={2}>
                          {item.title}
                        </Text>
                      )}
                      {item.description && (
                        <Text fontSize="xs" color="chakra-subtle-text" mb={2}>
                          {item.description}
                        </Text>
                      )}
                      <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
                        <Text fontSize="sm" color="chakra-subtle-text">
                          You chose: {formatAnswer(item, effectiveAnswer)}
                          {isUpdated && (
                            <Text as="span" ml={2} fontSize="xs" color="accent">
                              (updated)
                            </Text>
                          )}
                        </Text>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="brand"
                          onClick={() => openChangeAnswer(item)}
                          data-testid={`change-answer-${i}`}
                        >
                          Change answer
                        </Button>
                      </Box>
                      {item.type === 'triangle' && (() => {
                        const interp = triangleInterpretation(item, effectiveAnswer);
                        if (!interp) return null;
                        return (
                          <Text fontSize="xs" color="chakra-subtle-text" mt={2} lineHeight="tall">
                            How this was interpreted: A = {interp.a.name} ({interp.a.band}, score {interp.a.score}), B = {interp.b.name} ({interp.b.band}, score {interp.b.score}), C = {interp.c.name} ({interp.c.band}, score {interp.c.score}). Your profile combines all triangles; this question is one input.
                          </Text>
                        );
                      })()}
                    </Box>
                  );
                })}
                <Box pt={4} w="full">
                  {recalcError && (
                    <Text fontSize="sm" color="red.500" mb={2}>
                      {recalcError}
                    </Text>
                  )}
                  <Button
                    colorScheme="brand"
                    size="lg"
                    minH="44px"
                    isDisabled={!hasAnyOverride}
                    isLoading={recalculating}
                    loadingText="Recalculating..."
                    onClick={handleRecalculate}
                    data-testid="recalculate-results"
                  >
                    Recalculate results
                  </Button>
                </Box>
              </VStack>
            ) : (
              <Text color="chakra-subtle-text">No answers yet. Complete a discovery first.</Text>
            )}
          </VStack>
        </Container>
      </Box>

      <Modal isOpen={editModal.open} onClose={closeChangeAnswer} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change your answer</ModalHeader>
          <ModalBody>
            {editModal.item && (
              editModal.item.type === 'triangle' ? (
                <TriangleQuestion
                  question={{
                    id: editModal.item.questionId,
                    title: editModal.item.title,
                    prompt: editModal.item.prompt,
                    vertices: editModal.item.vertices ?? {},
                  }}
                  value={editModal.draftValue}
                  onChange={(v) => setEditModal((prev) => ({ ...prev, draftValue: v }))}
                />
              ) : (
                <PreSurveyQuestion
                  question={{
                    id: editModal.item.questionId,
                    title: editModal.item.title,
                    description: editModal.item.description,
                    type: editModal.item.type || 'single_choice',
                    options: editModal.item.options ?? [],
                  }}
                  value={editModal.draftValue}
                  onChange={(v) => setEditModal((prev) => ({ ...prev, draftValue: v }))}
                  optional={false}
                  maxSelections={editModal.item.maxSelections}
                />
              )
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeChangeAnswer}>
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              onClick={saveChangeAnswer}
              isDisabled={!editModal.item || !canProceed(editModal.item, editModal.draftValue)}
              data-testid="change-answer-save"
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
