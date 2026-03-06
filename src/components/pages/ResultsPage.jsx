import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
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
import { getReport } from '../../services/surveyApi';
import { stripMarkdown } from '../../utils/format';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

export default function ResultsPage() {
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolvedSessionId =
    location.state?.sessionId ?? sessionStorage.getItem(RESULTS_SESSION_KEY);

  const fetchReport = useCallback(async (sid) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReport(sid);
      setReport(data);
    } catch (err) {
      setError(err.message || 'We couldn\'t load your results. Try again or start a new discovery.');
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

  if (!resolvedSessionId) {
    return (
      <>
        <PageHero title="Your discovery results" tagline="See your strength profile and insights" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results">
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
                  Complete a discovery to see your results.
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
        <PageHero title="Your discovery results" tagline="See your strength profile and insights" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="brand" />
              <Text color="chakra-subtle-text">Loading your results...</Text>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Your discovery results" tagline="See your strength profile and insights" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results">
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

  const insights = report?.insights ?? [];
  const summaryLLM = report?.strengthProfileSummaryLLM ?? null;
  const summaryHybrid = report?.strengthProfileSummaryHybrid ?? null;
  const dimensionScores = report?.dimensionScores ?? { traits: [], values: [] };
  const traitsList = dimensionScores.traits ?? [];
  const valuesList = dimensionScores.values ?? [];
  const hasDimensionScores = traitsList.length > 0 || valuesList.length > 0;

  return (
    <>
      <PageHero title="Your discovery results" tagline="See your strength profile and insights" />
      <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results">
        <Container maxW="2xl">
          <VStack align="stretch" spacing={8} w="full">
            {/* Collapsible: Profile summaries and What you shared */}
          <Box w="full">
            <Text color="chakra-subtle-text" mb={4}>
              Here’s what we learned about your strengths and where you might want to grow. Expand any section below to read more.
            </Text>
            <Accordion allowMultiple defaultIndex={[0]} w="full">
              {hasDimensionScores && (
                <AccordionItem
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor="chakra-border-color"
                  borderLeftWidth="4px"
                  borderLeftColor="accent"
                  mb={3}
                  overflow="hidden"
                  bg="chakra-body-bg"
                  boxShadow="sm"
                >
                  <AccordionButton py={4} px={4} _expanded={{ bg: 'blackAlpha.50' }}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="semibold">
                      Traits and values (calculated) ({traitsList.length + valuesList.length} {traitsList.length + valuesList.length === 1 ? 'dimension' : 'dimensions'})
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} px={4} pt={0} bg="blackAlpha.50">
                    <VStack align="stretch" spacing={3}>
                      {traitsList.length > 0 && (
                        <>
                          <Text fontWeight="medium" fontSize="sm" color="chakra-subtle-text">
                            Traits (how you tend to behave)
                          </Text>
                          {traitsList.map((d) => (
                            <Box
                              key={`trait-${d.id}`}
                              p={3}
                              borderWidth="1px"
                              borderRadius="md"
                              borderColor="chakra-border-color"
                              bg="white"
                              _dark={{ bg: 'whiteAlpha.100' }}
                            >
                              <Text fontWeight="medium" fontSize="sm" mb={1}>
                                {d.name}
                              </Text>
                              <Box fontSize="sm" color="chakra-subtle-text">
                                <Text>Score: {d.mean} ({d.band})</Text>
                                {d.count != null && (
                                  <Text>Based on {d.count} {d.count === 1 ? 'answer' : 'answers'}</Text>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </>
                      )}
                      {valuesList.length > 0 && (
                        <>
                          <Text fontWeight="medium" fontSize="sm" color="chakra-subtle-text" pt={traitsList.length > 0 ? 2 : 0}>
                            Values (what matters to you)
                          </Text>
                          {valuesList.map((d) => (
                            <Box
                              key={`value-${d.id}`}
                              p={3}
                              borderWidth="1px"
                              borderRadius="md"
                              borderColor="chakra-border-color"
                              bg="white"
                              _dark={{ bg: 'whiteAlpha.100' }}
                            >
                              <Text fontWeight="medium" fontSize="sm" mb={1}>
                                {d.name}
                              </Text>
                              <Box fontSize="sm" color="chakra-subtle-text">
                                <Text>Score: {d.mean} ({d.band})</Text>
                                {d.count != null && (
                                  <Text>Based on {d.count} {d.count === 1 ? 'answer' : 'answers'}</Text>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )}
              {summaryLLM && (
                <AccordionItem
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor="chakra-border-color"
                  borderLeftWidth="4px"
                  borderLeftColor="accent"
                  mb={3}
                  overflow="hidden"
                  bg="chakra-body-bg"
                  boxShadow="sm"
                >
                  <AccordionButton py={4} px={4} _expanded={{ bg: 'blackAlpha.50' }}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="semibold">
                      Your discovered strengths and profile
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} px={4} pt={0} bg="blackAlpha.50">
                    <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                      {stripMarkdown(summaryLLM)}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              )}
              {summaryHybrid && (
                <AccordionItem
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor="chakra-border-color"
                  borderLeftWidth="4px"
                  borderLeftColor="accent"
                  mb={3}
                  overflow="hidden"
                  bg="chakra-body-bg"
                  boxShadow="sm"
                >
                  <AccordionButton py={4} px={4} _expanded={{ bg: 'blackAlpha.50' }}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="semibold">
                      {summaryLLM ? 'Another view of your profile' : 'Your discovered strengths and profile'}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} px={4} pt={0} bg="blackAlpha.50">
                    <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                      {stripMarkdown(summaryHybrid)}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              )}
              {insights.length > 0 && (
                <AccordionItem
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor="chakra-border-color"
                  borderLeftWidth="4px"
                  borderLeftColor="accent"
                  mb={3}
                  overflow="hidden"
                  bg="chakra-body-bg"
                  boxShadow="sm"
                >
                  <AccordionButton py={4} px={4} _expanded={{ bg: 'blackAlpha.50' }}>
                    <Box as="span" flex="1" textAlign="left" fontWeight="semibold">
                      Your answers in detail ({insights.length} {insights.length === 1 ? 'answer' : 'answers'})
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} px={4} pt={0} bg="blackAlpha.50">
                    <VStack align="stretch" spacing={3}>
                      {insights.map((item, i) => (
                        <Box
                          key={item.questionId ?? i}
                          p={3}
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor="chakra-border-color"
                          bg="white"
                          _dark={{ bg: 'whiteAlpha.100' }}
                        >
                          {item.questionTitle && (
                            <Text fontWeight="medium" fontSize="sm" mb={2}>
                              {item.questionTitle}
                            </Text>
                          )}
                          {item.value != null && item.value !== '' && (
                            <Box fontSize="sm" color="chakra-subtle-text" mb={1}>
                              {Array.isArray(item.value) ? (
                                <>
                                  <Text fontWeight="medium" mb={1}>You ranked (most to least):</Text>
                                  <VStack align="stretch" spacing={0} pl={2}>
                                    {item.value.map((v, idx) => (
                                      <Text key={idx}>{idx + 1}. {String(v)}</Text>
                                    ))}
                                  </VStack>
                                </>
                              ) : (
                                <Text>You chose: {String(item.value)}</Text>
                              )}
                            </Box>
                          )}
                          {item.summary && (
                            <Text fontSize="sm" lineHeight="tall">{stripMarkdown(item.summary)}</Text>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )}
            </Accordion>
            {!summaryLLM && !summaryHybrid && insights.length === 0 && !hasDimensionScores && (
              <Text fontSize="sm" color="chakra-subtle-text" mt={2}>
                No insights yet. Complete a discovery to build your profile.
              </Text>
            )}
          </Box>

            {/* CTA: Careers */}
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
            >
              <Heading size="md" mb={2}>
                Skills and directions that fit you
              </Heading>
              <Text color="chakra-subtle-text" mb={4}>
                See career directions tailored to your profile—directions that fit your strengths and directions to avoid.
              </Text>
              <Button
                as={RouterLink}
                to="/recommendations"
                state={{ sessionId: resolvedSessionId }}
                colorScheme="brand"
                size="md"
              >
                View careers
              </Button>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
}
