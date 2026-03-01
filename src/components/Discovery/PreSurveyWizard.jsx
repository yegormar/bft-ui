import { Box, Button, Container, HStack, Progress, Text, VStack } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import preSurveyData from '../../data/pre_survey_questions.json';
import { computeClusterProfile } from '../../utils/clusterProfile';
import { loadPreSurveyProgress, savePreSurveyProgress } from '../../utils/preSurveyStorage';
import PreSurveyQuestion from './PreSurveyQuestion';

const PRE_SURVEY = preSurveyData.pre_survey;
const QUESTIONS = PRE_SURVEY.questions;
const INTRO_TEXT = PRE_SURVEY.intro_text ?? '';
const OPTIONAL_QUESTION_IDS = new Set([1, 2, 5]); // gender, age/stage, risk

function getInitialAnswers() {
  const saved = loadPreSurveyProgress(QUESTIONS.length);
  return saved ? saved.answers : {};
}

export default function PreSurveyWizard({ onComplete }) {
  const initialAnswers = useRef(getInitialAnswers());
  const [step, setStep] = useState(0); // always start at intro; previous answers are restored so user can click Next through
  const [answers, setAnswers] = useState(initialAnswers.current);

  useEffect(() => {
    savePreSurveyProgress(answers, step, QUESTIONS.length);
  }, [answers, step]);

  const isIntro = step === 0;
  const questionIndex = step - 1;
  const question = !isIntro && questionIndex >= 0 ? QUESTIONS[questionIndex] : null;
  const isFirst = step === 1;
  const isLast = step === QUESTIONS.length;
  const isOptional = question && OPTIONAL_QUESTION_IDS.has(question.id);
  const maxSelections = question?.maxSelections ?? undefined;

  const value = question ? (answers[question.id] ?? (question.type === 'multi_choice' ? [] : '')) : null;

  const setAnswer = (val) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: val }));
  };

  const handleNext = () => {
    if (isIntro) {
      setStep(1);
      return;
    }
    if (isLast) {
      const profile = computeClusterProfile(QUESTIONS, answers);
      onComplete(profile);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    if (isLast) {
      const profile = computeClusterProfile(QUESTIONS, answers);
      onComplete(profile);
    } else {
      setStep((s) => s + 1);
    }
  };

  const canProceed = () => {
    if (isIntro) return true;
    if (isOptional) return true;
    if (question.type === 'single_choice') return value != null && value !== '';
    if (question.type === 'multi_choice') return Array.isArray(value) && value.length > 0;
    return false;
  };

  return (
    <Box
      py={{ base: 6, md: 10 }}
      px={4}
      data-testid="page-discovery"
      minH={isIntro ? { base: 'auto', md: '60vh' } : undefined}
      display={isIntro ? 'flex' : 'block'}
      alignItems={isIntro ? 'center' : undefined}
    >
      <Container maxW="2xl" centerContent w="full">
        <VStack align="stretch" spacing={6} w="full">
          {isIntro ? (
            <Box
              as="section"
              aria-label="Introduction"
              w="full"
              maxW="xl"
              mx="auto"
              p={{ base: 5, md: 8 }}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="chakra-border-color"
              borderLeftWidth="4px"
              borderLeftColor="accent"
              bg="chakra-body-bg"
              boxShadow="sm"
            >
              <VStack align="stretch" spacing={8} textAlign="left">
                <Text
                  fontSize="md"
                  color="chakra-body-text"
                  lineHeight="tall"
                  whiteSpace="pre-line"
                  maxW="65ch"
                >
                  {INTRO_TEXT}
                </Text>
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleNext}
                  minH="44px"
                  w={{ base: 'full', sm: 'auto' }}
                  px={8}
                  alignSelf={{ base: 'stretch', sm: 'flex-start' }}
                  data-testid="pre-survey-start"
                >
                  Got it
                </Button>
              </VStack>
            </Box>
          ) : (
            <>
              <Box>
                <Text fontSize="sm" color="chakra-subtle-text" mb={2}>
                  Question {step} of {QUESTIONS.length}
                </Text>
                <Progress
                  value={(step / QUESTIONS.length) * 100}
                  size="sm"
                  colorScheme="brand"
                  borderRadius="full"
                  bg="chakra-subtle-bg"
                  aria-label={`Progress: question ${step} of ${QUESTIONS.length}`}
                />
              </Box>

              {question && (
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
                  onChange={setAnswer}
                  optional={isOptional}
                  onSkip={isOptional ? handleSkip : undefined}
                  maxSelections={maxSelections}
                />
                </Box>
              )}

              <HStack w="full" justify="space-between" pt={4} spacing={3}>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep((s) => s - 1)}
                  isDisabled={isFirst}
                  minH="44px"
                >
                  Back
                </Button>
                <Button
                  colorScheme="brand"
                  size="lg"
                  onClick={handleNext}
                  isDisabled={!canProceed()}
                  minH="44px"
                  px={6}
                  data-testid="pre-survey-next"
                >
                  {isLast ? 'Continue' : 'Next'}
                </Button>
              </HStack>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
