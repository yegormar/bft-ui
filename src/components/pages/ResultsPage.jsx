import {
  Box,
  Button,
  Container,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { BarChart3, Briefcase, Heart, ListChecks, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PageHero from '../Layout/PageHero';
import { getReport } from '../../services/surveyApi';

const RESULTS_SESSION_KEY = 'bft_results_session_id';

const HUB_LINKS = [
  {
    to: '/results/traits-values',
    stateKey: 'sessionId',
    title: 'Traits and Values',
    description: 'Your calculated traits, values, and aptitudes.',
    icon: Heart,
    requiresLlm: false,
  },
  {
    to: '/skills',
    stateKey: 'sessionId',
    title: 'Skills analysis',
    description: 'See skills that fit your profile and how they trend with AI.',
    icon: BarChart3,
    requiresLlm: false,
  },
  {
    to: '/results/profile',
    stateKey: 'sessionId',
    title: 'Profile Summary',
    description: 'Your discovered strengths.',
    icon: Sparkles,
    requiresLlm: true,
  },
  {
    to: '/recommendations',
    stateKey: 'sessionId',
    title: 'Career option',
    description: 'Career directions that fit you and directions to avoid.',
    icon: Briefcase,
    requiresLlm: true,
  },
  {
    to: '/results/answers',
    stateKey: 'sessionId',
    title: 'Your answers',
    description: 'Questions you answered. Change answers and recalculate results.',
    icon: ListChecks,
    requiresLlm: false,
  },
];

function HubButton({ to, state, title, description, icon: Icon, disabled, preparing }) {
  const content = (
    <VStack align="stretch" spacing={3} w="full">
      <Box color={disabled ? 'chakra-subtle-text' : 'brand.500'} lineHeight={0}>
        <Icon size={28} strokeWidth={2} />
      </Box>
      <Text fontWeight="semibold" fontSize="lg">
        {title}
      </Text>
      <Text fontSize="sm" color="chakra-subtle-text" fontWeight="normal" lineHeight="tall">
        {description}
      </Text>
      {preparing && (
        <HStack spacing={2} mt={1}>
          <Spinner size="sm" />
          <Text fontSize="xs" color="chakra-subtle-text">
            Preparing...
          </Text>
        </HStack>
      )}
    </VStack>
  );

  if (disabled) {
    return (
      <Button
        variant="outline"
        colorScheme="gray"
        size="lg"
        height="auto"
        minH="28"
        py={6}
        px={6}
        textAlign="left"
        justifyContent="flex-start"
        alignItems="flex-start"
        whiteSpace="normal"
        w="full"
        boxShadow="sm"
        isDisabled
        cursor="not-allowed"
        opacity={0.85}
        data-testid={`results-hub-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      as={RouterLink}
      to={to}
      state={state}
      variant="outline"
      colorScheme="brand"
      size="lg"
      height="auto"
      minH="28"
      py={6}
      px={6}
      textAlign="left"
      justifyContent="flex-start"
      alignItems="flex-start"
      whiteSpace="normal"
      w="full"
      boxShadow="sm"
      _hover={{ shadow: 'md', borderColor: 'brand.500', bg: 'blackAlpha.50' }}
      _dark={{ _hover: { bg: 'whiteAlpha.50' } }}
      data-testid={`results-hub-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {content}
    </Button>
  );
}

export default function ResultsPage() {
  const location = useLocation();
  const resolvedSessionId =
    location.state?.sessionId ?? sessionStorage.getItem(RESULTS_SESSION_KEY);
  const [fullReportReady, setFullReportReady] = useState(false);

  const triggerFullReport = useCallback((sid) => {
    getReport(sid, { includeLlm: true })
      .then(() => setFullReportReady(true))
      .catch(() => setFullReportReady(true));
  }, []);

  useEffect(() => {
    if (!resolvedSessionId) return;
    triggerFullReport(resolvedSessionId);
  }, [resolvedSessionId, triggerFullReport]);

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

  const linkState = { sessionId: resolvedSessionId };
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(RESULTS_SESSION_KEY, resolvedSessionId);
  }

  return (
    <>
      <PageHero title="Your discovery results" tagline="Explore your strength profile and insights" />
      <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-results">
        <Container maxW="4xl">
          <Text color="chakra-subtle-text" mb={8} textAlign="center">
            Choose an area to explore. You can come back here anytime from the Results menu.
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4} w="full">
            {HUB_LINKS.map((link) => (
              <HubButton
                key={link.to}
                to={link.to}
                state={link.stateKey ? linkState : undefined}
                title={link.title}
                description={link.description}
                icon={link.icon}
                disabled={link.requiresLlm && !fullReportReady}
                preparing={link.requiresLlm && !fullReportReady}
              />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </>
  );
}
