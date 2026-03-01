import { Box, Button, Container, Spinner, Text, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createSession, getNextQuestion, submitAnswers } from '../../services/surveyApi';
import PreSurveyQuestion from './PreSurveyQuestion';

function selectionToValue(question, value) {
  const texts = Array.isArray(value) ? value : value ? [value] : [];
  return texts.map((text) => {
    const opt = question.options?.find((o) => o.text === text);
    return opt?.value ?? text;
  });
}

export default function MainSurvey({ clusterProfile }) {
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  const fetchNext = useCallback(async (sid) => {
    const result = await getNextQuestion(sid);
    if (result.completed) {
      setCompleted(true);
      setQuestion(null);
    } else {
      setQuestion(result.nextQuestion);
      setValue(result.nextQuestion.type === 'multi_choice' ? [] : '');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      setLoading(true);
      setError(null);
      try {
        const session = await createSession(clusterProfile ?? null);
        if (cancelled) return;
        setSessionId(session.id);
        await fetchNext(session.id);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to start survey');
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
    const singleVal = question.type === 'single_choice' ? payloadValue[0] : payloadValue;
    setSubmitting(true);
    setError(null);
    try {
      await submitAnswers(sessionId, [
        { questionId: question.id, value: singleVal },
      ]);
      await fetchNext(sessionId);
    } catch (err) {
      setError(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (question?.type === 'single_choice') return value != null && value !== '';
    if (question?.type === 'multi_choice') return Array.isArray(value) && value.length > 0;
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
            <Text fontSize="sm" color="chakra-subtle-text">
              Start the API in another terminal: <code>{'cd bft-api && npm run dev'}</code>. The
              UI proxies /api to the API when both run locally.
            </Text>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (completed) {
    return (
      <Box py={{ base: 6, md: 10 }} px={4} data-testid="page-discovery">
        <Container maxW="2xl" centerContent>
          <VStack spacing={6} w="full">
            <Text fontSize="lg" color="chakra-body-text">
              You have completed this part of the discovery. Your answers will help shape your
              strength profile and recommendations.
            </Text>
            <Button as={RouterLink} to="/results" colorScheme="brand" size="lg" minH="44px">
              View results
            </Button>
          </VStack>
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
              No next question was returned. Your answer was saved.
            </Text>
            <Text fontSize="sm" color="chakra-subtle-text">
              This can happen when the assistant could not generate the next step. You can try again
              or refresh the page.
            </Text>
            <Button
              colorScheme="brand"
              onClick={async () => {
                if (!sessionId) return;
                setRetrying(true);
                setError(null);
                try {
                  await fetchNext(sessionId);
                } catch (err) {
                  setError(err.message || 'Failed to load next question');
                } finally {
                  setRetrying(false);
                }
              }}
              isDisabled={!sessionId}
              isLoading={retrying}
              loadingText="Loading..."
            >
              Try again
            </Button>
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
          {error && (
            <Text fontSize="sm" color="red.500">
              {error}
            </Text>
          )}
          <PreSurveyQuestion
            question={question}
            value={value}
            onChange={setValue}
            optional={false}
            maxSelections={maxSelections}
          />
          <Box w="full" display="flex" justifyContent="flex-end">
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
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
