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
import { getReport } from '../../services/surveyApi';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

export default function ResultsTraitsValuesPage() {
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
      setError(err.message || 'We couldn\'t load your traits and values. Try again or start a new discovery.');
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
        <PageHero title="Traits and Values" tagline="Your calculated dimensions" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-traits-values">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4} align="center" textAlign="center">
              <Text color="chakra-subtle-text">Complete a discovery to see your traits and values.</Text>
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
        <PageHero title="Traits and Values" tagline="Your calculated dimensions" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-traits-values">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="brand" />
              <Text color="chakra-subtle-text">Loading...</Text>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Traits and Values" tagline="Your calculated dimensions" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-traits-values">
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

  const dimensionScores = report?.dimensionScores ?? { traits: [], values: [] };
  const profileByDimensions = report?.profileByDimensions ?? {};
  const traitsList = dimensionScores.traits ?? [];
  const valuesList = dimensionScores.values ?? [];
  const aptitudesList = profileByDimensions.aptitudes ?? [];
  const hasContent = traitsList.length > 0 || valuesList.length > 0 || aptitudesList.length > 0;

  function DimensionCard({ name, mean, band, count }) {
    return (
      <Box
        p={3}
        borderWidth="1px"
        borderRadius="md"
        borderColor="chakra-border-color"
        bg="white"
        _dark={{ bg: 'whiteAlpha.100' }}
      >
        <Text fontWeight="medium" fontSize="sm" mb={1}>
          {name}
        </Text>
        <Box fontSize="sm" color="chakra-subtle-text">
          <Text>Score: {mean} ({band})</Text>
          {count != null && (
            <Text>Based on {count} {count === 1 ? 'answer' : 'answers'}</Text>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <PageHero title="Traits and Values" tagline="Your calculated dimensions" />
      <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-traits-values">
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
            {hasContent ? (
              <>
                {aptitudesList.length > 0 && (
                  <Box
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    borderLeftWidth="4px"
                    borderLeftColor="accent"
                    bg="chakra-body-bg"
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={3} color="chakra-subtle-text">
                      Aptitudes (your natural tendencies)
                    </Heading>
                    <VStack align="stretch" spacing={2}>
                      {aptitudesList.map((d) => (
                        <Text key={d.id ?? d.name} fontSize="sm" fontWeight="medium">
                          {d.name}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}
                {traitsList.length > 0 && (
                  <Box
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    borderLeftWidth="4px"
                    borderLeftColor="accent"
                    bg="chakra-body-bg"
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={3} color="chakra-subtle-text">
                      Traits (how you tend to behave)
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      {traitsList.map((d) => (
                        <DimensionCard
                          key={`trait-${d.id}`}
                          name={d.name}
                          mean={d.mean}
                          band={d.band}
                          count={d.count}
                        />
                      ))}
                    </VStack>
                  </Box>
                )}
                {valuesList.length > 0 && (
                  <Box
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    borderLeftWidth="4px"
                    borderLeftColor="accent"
                    bg="chakra-body-bg"
                    boxShadow="sm"
                  >
                    <Heading size="sm" mb={3} color="chakra-subtle-text">
                      Values (what matters to you)
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      {valuesList.map((d) => (
                        <DimensionCard
                          key={`value-${d.id}`}
                          name={d.name}
                          mean={d.mean}
                          band={d.band}
                          count={d.count}
                        />
                      ))}
                    </VStack>
                  </Box>
                )}
              </>
            ) : (
              <Text color="chakra-subtle-text">
                No traits or values yet. Complete a discovery to see your dimensions.
              </Text>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
}
