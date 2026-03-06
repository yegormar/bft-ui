import {
  Box,
  Button,
  Container,
  Heading,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import { getAssessment } from '../../services/surveyApi';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

function formatAnswer(question, userAnswer) {
  if (userAnswer == null || userAnswer === '') return 'No answer';
  if (Array.isArray(userAnswer)) {
    return userAnswer.map((v, i) => `${i + 1}. ${String(v)}`).join(', ');
  }
  const opt = question?.options?.find((o) => o.value === userAnswer || o.text === userAnswer);
  return opt ? (opt.text || String(userAnswer)) : String(userAnswer);
}

export default function ResultsAnswersPage() {
  const location = useLocation();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                To change an answer and recalculate your results, start a new discovery. Your new
                answers will produce updated skills, traits, and career directions.
              </Text>
              <Button
                as={RouterLink}
                to="/discovery"
                colorScheme="brand"
                size="md"
              >
                Change answers and recalculate
              </Button>
            </Box>
            {hasContent ? (
              <VStack align="stretch" spacing={4}>
                <Heading size="sm" color="chakra-subtle-text">
                  Asked questions and your choices ({asked.length})
                </Heading>
                {asked.map((item, i) => (
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
                    <Text fontSize="sm" color="chakra-subtle-text">
                      You chose: {formatAnswer(item, item.userAnswer)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="chakra-subtle-text">No answers yet. Complete a discovery first.</Text>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
}
