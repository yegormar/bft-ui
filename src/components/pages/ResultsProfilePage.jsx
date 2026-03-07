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
import { stripMarkdown } from '../../utils/format';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

export default function ResultsProfilePage() {
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
      const data = await getReport(sid, { includeLlm: true });
      setReport(data);
    } catch (err) {
      setError(err.message || 'We couldn\'t load your profile. Try again or start a new discovery.');
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
        <PageHero title="Profile Summary" tagline="Your discovered strengths" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-profile">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4} align="center" textAlign="center">
              <Text color="chakra-subtle-text">Complete a discovery to see your profile summary.</Text>
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
        <PageHero title="Profile Summary" tagline="Your discovered strengths" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-profile">
          <Container maxW="2xl" centerContent>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="brand" />
              <Text color="chakra-subtle-text">Loading your profile...</Text>
            </VStack>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHero title="Profile Summary" tagline="Your discovered strengths" />
        <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-profile">
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

  const summaryLLM = report?.strengthProfileSummaryLLM ?? null;
  const summaryHybrid = report?.strengthProfileSummaryHybrid ?? null;
  const hasContent = summaryLLM || summaryHybrid;

  return (
    <>
      <PageHero title="Profile Summary" tagline="Your discovered strengths" />
      <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results-profile">
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
                {summaryLLM && (
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
                    <Heading size="sm" mb={3} color="chakra-subtle-text">
                      Your discovered strengths and profile
                    </Heading>
                    <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                      {stripMarkdown(summaryLLM)}
                    </Text>
                  </Box>
                )}
                {summaryHybrid && (
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
                    <Heading size="sm" mb={3} color="chakra-subtle-text">
                      {summaryLLM ? 'Another view of your profile' : 'Your discovered strengths and profile'}
                    </Heading>
                    <Text fontSize="sm" whiteSpace="pre-wrap" lineHeight="tall">
                      {stripMarkdown(summaryHybrid)}
                    </Text>
                  </Box>
                )}
              </>
            ) : (
              <Text color="chakra-subtle-text">
                No profile summary yet. Complete a discovery to build your profile.
              </Text>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
}
