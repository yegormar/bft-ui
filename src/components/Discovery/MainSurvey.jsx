import { Box, Button, Container, Progress, Spinner, Text, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { createSession, getNextQuestion, submitAnswers } from '../../services/surveyApi';
import PreSurveyQuestion from './PreSurveyQuestion';

function selectionToValue(question, value) {
  if (question.type === 'rank') {
    return Array.isArray(value) ? value : [];
  }
  const texts = Array.isArray(value) ? value : value ? [value] : [];
  return texts.map((text) => {
    const opt = question.options?.find((o) => o.text === text);
    return opt?.value ?? text;
  });
}

const RESULTS_SESSION_KEY = 'bft_results_session_id';

export default function MainSurvey({ clusterProfile }) {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [value, setValue] = useState('');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [completed, setCompleted] = useState(false);

  const fetchNext = useCallback(async (sid) => {
    const result = await getNextQuestion(sid);
    if (result.progress) setProgress(result.progress);
    if (result.completed) {
      setCompleted(true);
      setQuestion(null);
    } else {
      const q = result.nextQuestion;
      setQuestion(q);
      if (q.type === 'rank' && Array.isArray(q.options)) {
        setValue(q.options.map((o) => o.value));
      } else if (q.type === 'multi_choice') {
        setValue([]);
      } else {
        setValue('');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      setLoading(true);
      setError(null);
      try {
        sessionStorage.removeItem(RESULTS_SESSION_KEY);
        const session = await createSession(clusterProfile ?? null);
        if (cancelled) return;
        setSessionId(session.id);
        await fetchNext(session.id);
      } catch (err) {
        if (!cancelled) {
          const is503 = err.status === 503;
          setError(is503 && err.body?.message ? err.body.message : err.message || 'Failed to start survey');
          setServiceUnavailable(is503);
          if (is503 && err.body?.progress) setProgress(err.body.progress);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    start();
    return () => { cancelled = true; };
  }, [fetchNext]);

  const handleNext = async () => {
    if (!sessionId || !question) return;
    const payloadValue = selectionToValue(question, value);
    const singleVal =
      question.type === 'single_choice' ? payloadValue[0] : question.type === 'rank' ? payloadValue : payloadValue;
    setSubmitting(true);
    setError(null);
    setServiceUnavailable(false);
    try {
      await submitAnswers(sessionId, [
        { questionId: question.id, value: singleVal },
      ]);
      await fetchNext(sessionId);
    } catch (err) {
      const is503 = err.status === 503;
      setError(is503 && err.body?.message ? err.body.message : err.message || 'Failed to submit');
      setServiceUnavailable(is503);
      if (is503 && err.body?.progress) setProgress(err.body.progress);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryFetch = async () => {
    if (!sessionId) return;
    setRetrying(true);
    setError(null);
    setServiceUnavailable(false);
    try {
      await fetchNext(sessionId);
    } catch (err) {
      const is503 = err.status === 503;
      setError(is503 && err.body?.message ? err.body.message : err.message || 'Failed to load next question');
      setServiceUnavailable(is503);
      if (is503 && err.body?.progress) setProgress(err.body.progress);
    } finally {
      setRetrying(false);
    }
  };

  const canProceed = () => {
    if (question?.type === 'single_choice') return value != null && value !== '';
    if (question?.type === 'multi_choice') return Array.isArray(value) && value.length > 0;
    if (question?.type === 'rank') return Array.isArray(value) && value.length === (question.options?.length ?? 0);
    return false;
  };

  if (loading) {
    return (
      <Box py={{ base: 6, md: 10 }} px={4} data-testid="page-discovery">
        <Container maxW="2xl" centerContent>
          <VStack spacing={4}>
            <Spinner size="lg" colorScheme="brand" />
            <Text color="chakra-subtle-text">Starting your tailored interview...</Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (error && !question) {
    return (
      <Box py={{ base: 6, md: 10 }} px={4} data-testid="page-discovery">
        <Container maxW="2xl" centerContent>
          <VStack spacing={4} align="stretch" maxW="md">
            <Text color="red.500" fontWeight="medium">
              {error}
            </Text>
            {!serviceUnavailable && (
              <Text fontSize="sm" color="chakra-subtle-text">
                Start the API in another terminal: <code>{'cd bft-api && npm run dev'}</code>. The
                UI proxies /api to the API when both run locally.
              </Text>
            )}
            {sessionId && (
              <Button
                colorScheme="brand"
                onClick={handleRetryFetch}
                isLoading={retrying}
                loadingText="Loading..."
              >
                Try again
              </Button>
            )}
          </VStack>
        </Container>
      </Box>
    );
  }

  if (completed) {
    return (
      <Box py={{ base: 6, md: 10 }} px={4} data-testid="page-discovery">
        <Container maxW="2xl" centerContent>
          <Box
            p={{ base: 5, md: 8 }}
            w="full"
            maxW="xl"
            mx="auto"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="chakra-border-color"
            borderLeftWidth="4px"
            borderLeftColor="accent"
            bg="chakra-body-bg"
            boxShadow="sm"
          >
            <VStack spacing={6} align="stretch" w="full">
              {progress?.questionsAsked != null && (
                <Text fontSize="sm" color="chakra-subtle-text">
                  You answered {progress.questionsAsked} questions. Profile complete.
                </Text>
              )}
              <Text fontSize="lg" color="chakra-body-text" lineHeight="tall">
                You have completed this part of the discovery. Your answers will help shape your
                strength profile and careers.
              </Text>
              <Button
                colorScheme="brand"
                size="lg"
                minH="44px"
                onClick={() => {
                  if (sessionId) {
                    sessionStorage.setItem(RESULTS_SESSION_KEY, sessionId);
                    navigate('/results', { state: { sessionId } });
                  }
                }}
              >
                View results
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!question) {
    return (
      <Box py={{ base: 6, md: 10 }} px={4} data-testid="page-discovery">
        <Container maxW="2xl" centerContent>
          <VStack spacing={4} align="stretch" maxW="md">
            <Text color="red.500" fontWeight="medium">
              {error || 'No next question was returned. Your answer was saved.'}
            </Text>
            <Text fontSize="sm" color="chakra-subtle-text">
              You can try again to load the next question.
            </Text>
            {sessionId && (
              <Button
                colorScheme="brand"
                onClick={handleRetryFetch}
                isLoading={retrying}
                loadingText="Loading..."
              >
                Try again
              </Button>
            )}
          </VStack>
        </Container>
      </Box>
    );
  }

  const maxSelections = question.maxSelections ?? undefined;

  return (
    <Box py={{ base: 6, md: 10 }} px={4} data-testid="page-discovery">
      <Container maxW="2xl" centerContent>
        <VStack align="stretch" spacing={6} w="full">
          {progress && (
            <Box w="full">
              <Progress
                value={progress.percentComplete}
                size="sm"
                colorScheme="brand"
                borderRadius="full"
                hasStripe
                data-testid="interview-progress"
              />
              <Text fontSize="sm" color="chakra-subtle-text" mt={2}>
                {progress.questionsAsked > 0 && `Question ${progress.questionsAsked} · `}
                Building your profile: {progress.coveredDimensions}/{progress.totalDimensions} dimensions covered ({progress.percentComplete}%)
              </Text>
            </Box>
          )}
          {error && (
            <Text fontSize="sm" color="red.500">
              {error}
            </Text>
          )}
          <Box
            p={{ base: 4, md: 6 }}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="chakra-border-color"
            borderLeftWidth="4px"
            borderLeftColor="accent"
            bg="chakra-body-bg"
            boxShadow="sm"
          >
            <PreSurveyQuestion
              question={question}
              value={value}
              onChange={setValue}
              optional={false}
              maxSelections={maxSelections}
            />
            <Box w="full" display="flex" justifyContent="flex-end" mt={4} gap={3}>
              {serviceUnavailable ? (
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleRetryFetch}
                  minH="44px"
                  px={6}
                  isLoading={retrying}
                  loadingText="Loading..."
                  data-testid="main-survey-retry"
                >
                  Try again
                </Button>
              ) : (
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleNext}
                  isDisabled={!canProceed() || submitting}
                  minH="44px"
                  px={6}
                  isLoading={submitting}
                  loadingText="Submitting..."
                  data-testid="main-survey-next"
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
