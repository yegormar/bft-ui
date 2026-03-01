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
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import { getReport } from '../../services/surveyApi';
import { stripMarkdown } from '../../utils/format';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

export default function RecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
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
      setError(err.message || 'We couldn\'t load your careers. Try again or start a new discovery.');
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

  const careerRecommendations = report?.careerClusterAlignment ?? null;
  const recommended = careerRecommendations?.recommended ?? [];
  const directionsToAvoid = careerRecommendations?.directionsToAvoid ?? [];
  const hasRecommendations = recommended.length > 0 || directionsToAvoid.length > 0;

  if (!resolvedSessionId) {
    return (
      <>
        <PageHero title="Careers" tagline="Career directions that fit your profile" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-recommendations">
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
                  Complete a discovery to see your career directions.
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
        <PageHero title="Careers" tagline="Career directions that fit your profile" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-recommendations">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="brand" />
              <Text color="chakra-subtle-text">Loading your careers...</Text>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Careers" tagline="Career directions that fit your profile" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-recommendations">
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
      <PageHero title="Careers" tagline="Career directions that fit your profile" />
      <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-recommendations">
        <Container maxW="2xl">
          <VStack align="stretch" spacing={8} w="full">
            <Box>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/results', { state: { sessionId: resolvedSessionId } })}
                mb={2}
                color="chakra-subtle-text"
                _hover={{ color: 'accent' }}
              >
                ← Back to results
              </Button>
              <Text color="chakra-subtle-text" fontSize="sm">
                Based on your discovery and AI-era relevance—directions that fit your strengths and directions to avoid.
              </Text>
            </Box>

          {hasRecommendations ? (
            <VStack align="stretch" spacing={8}>
              {recommended.length > 0 && (
                <Box w="full">
                  <Heading size="md" mb={4} color="chakra-body-text">
                    Recommended career directions
                  </Heading>
                  <VStack align="stretch" spacing={3}>
                    {recommended.map((item, i) => (
                      <Box
                        key={i}
                        p={5}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor="chakra-border-color"
                        borderLeftWidth="4px"
                        borderLeftColor="accent"
                        bg="chakra-body-bg"
                        boxShadow="sm"
                      >
                        <Text fontWeight="semibold" fontSize="md">
                          {stripMarkdown(item.direction)}
                        </Text>
                        {item.fit && (
                          <Text fontSize="sm" color="accent" mt={1} fontWeight="medium">
                            Fit: {item.fit === 'high' ? 'High' : item.fit === 'medium' ? 'Medium' : item.fit}
                          </Text>
                        )}
                        {item.rationale && (
                          <Text fontSize="sm" mt={2} color="chakra-subtle-text" lineHeight="tall">
                            {stripMarkdown(item.rationale)}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
              {directionsToAvoid.length > 0 && (
                <Box w="full">
                  <Heading size="md" mb={4} color="chakra-body-text">
                    Directions to avoid
                  </Heading>
                  <VStack align="stretch" spacing={3}>
                    {directionsToAvoid.map((item, i) => (
                      <Box
                        key={i}
                        p={5}
                        borderWidth="1px"
                        borderRadius="lg"
                        borderColor="chakra-border-color"
                        borderLeftWidth="4px"
                        borderLeftColor="chakra-subtle-text"
                        bg="chakra-body-bg"
                        boxShadow="sm"
                      >
                        <Text fontWeight="semibold" fontSize="md">
                          {stripMarkdown(item.direction)}
                        </Text>
                        {item.rationale && (
                          <Text fontSize="sm" mt={2} color="chakra-subtle-text" lineHeight="tall">
                            {stripMarkdown(item.rationale)}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          ) : (
            <Box
                p={6}
                borderWidth="1px"
                borderRadius="lg"
                borderColor="chakra-border-color"
                borderLeftWidth="4px"
                borderLeftColor="accent"
                bg="chakra-body-bg"
                boxShadow="sm"
              >
              <Text color="chakra-subtle-text">
                Careers tailored to your profile will appear here once they’re generated. This is where we suggest skills to develop and career directions that align with your strengths and values.
              </Text>
              <Text color="chakra-subtle-text" mt={3} fontSize="sm">
                Make sure the report has been generated with careers enabled (see your Results page for your profile), then return here or refresh.
              </Text>
            </Box>
          )}
          </VStack>
        </Container>
      </Box>
    </>
  );
}
