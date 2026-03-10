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
import { Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import { getReport } from '../../services/surveyApi';
import { stripMarkdown, sanitizeProfileHtml, hasProfileHtml } from '../../utils/format';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

/** Split summary text into paragraphs (double newline or single when LLM uses \n\n). Preserves single paragraphs. */
function splitSummaryParagraphs(text) {
  if (typeof text !== 'string' || !text.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function ResultsProfilePage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlSessionId = searchParams.get('sessionId');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolvedSessionId =
    urlSessionId ?? location.state?.sessionId ?? sessionStorage.getItem(RESULTS_SESSION_KEY);

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

  const profileSummary = report?.profileSummary ?? null;

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
            {profileSummary ? (
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
                <Heading size="sm" mb={5} color="chakra-subtle-text">
                  Your discovered strengths and profile
                </Heading>
                <Box
                  as="article"
                  maxW="65ch"
                  sx={{
                    '& p': { mb: 4 },
                    '& p:last-of-type': { mb: 0 },
                    '& h2': { fontSize: 'xl', fontWeight: 'bold', mt: 6, mb: 3 },
                    '& h2:first-of-type': { mt: 0 },
                    '& h3': { fontSize: 'lg', fontWeight: 'semibold', mt: 4, mb: 2 },
                    '& b': { fontWeight: 'bold' },
                    '& table': { width: '100%', borderCollapse: 'collapse', my: 4 },
                    '& th, & td': { borderWidth: '1px', borderColor: 'chakra-border-color', px: 3, py: 2, textAlign: 'left' },
                    '& th': { bg: 'chakra-subtle-bg', fontWeight: 'semibold' },
                  }}
                >
                  {hasProfileHtml(profileSummary) ? (
                    <Box
                      fontSize="md"
                      lineHeight="1.75"
                      color="chakra-body-text"
                      dangerouslySetInnerHTML={{ __html: sanitizeProfileHtml(profileSummary) }}
                    />
                  ) : (
                    splitSummaryParagraphs(stripMarkdown(profileSummary)).map((para, i) => (
                      <Text
                        key={i}
                        as="p"
                        fontSize="md"
                        lineHeight="1.75"
                        color="chakra-body-text"
                      >
                        {para}
                      </Text>
                    ))
                  )}
                </Box>
              </Box>
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
