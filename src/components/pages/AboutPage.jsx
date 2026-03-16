import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Flex,
  Button,
} from '@chakra-ui/react';
import {
  Users,
  Lightbulb,
  ShieldCheck,
  ChartBar,
  UsersRound,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const missionItems = [
  {
    icon: Users,
    title: 'For you',
    description: 'Built for students and young adults. We help you find your own path.',
  },
  {
    icon: Lightbulb,
    title: 'Strengths-based',
    description: 'We focus on what you\'re good at, not fixed career boxes.',
  },
  {
    icon: ShieldCheck,
    title: 'Private',
    description: 'Use it without signing up. We don\'t collect or store your data.',
  },
  {
    icon: ChartBar,
    title: 'AI-powered',
    description: 'AI tailors the questions and insights to you.',
  },
];

const devTeam = [
  {
    name: 'Eric He',
    role: 'Backend Engineer',
    bio: 'Designs the API and assessment engine, specializing in Node.js, Express, and AI-powered interviews.',
    image: '/Screenshot 2026-03-16 174208-modified.png',
  },
  {
    name: 'Yegor Markov',
    role: 'Frontend Developer',
    bio: 'Builds intuitive user experiences with React and Chakra UI, focusing on accessibility and usability.',
    image: '/Screenshot 2026-03-16 154718-modified.png',
  },
  {
    name: 'Leo Cook',
    role: 'Project Lead & Architect',
    bio: 'Guides the project vision and architecture, with deep expertise in full-stack development and AI integration.',
    image: '/Screenshot 2026-03-16 154559-modified.png',
  },
];

const CONTENT_MAX_W = '2xl';

function AboutPage() {
  return (
    <Box as="main" data-testid="page-about" bg="chakra-subtle-bg">
      {/* Hero Section */}
      <Box
        as="section"
        bg="hero-bg"
        py={{ base: 6, md: 12 }}
        px={4}
        borderBottomWidth="1px"
        borderColor="hero-border"
        aria-labelledby="about-hero-title"
      >
        <Container maxW={CONTENT_MAX_W} centerContent>
          <VStack spacing={{ base: 3, md: 5 }} textAlign="center">
            <Heading
              id="about-hero-title"
              as="h1"
              size={{ base: 'xl', md: '2xl' }}
              fontWeight="extrabold"
              color="hero-title"
              data-testid="about-hero-title"
            >
              About Built for Tomorrow
            </Heading>
            <Text fontSize={{ base: 'md', md: 'xl' }} color="hero-tagline" fontWeight="semibold" data-testid="about-hero-tagline">
              Your strengths, your future
            </Text>
            <Text fontSize="sm" color="chakra-subtle-text" maxW="2xl">
              Explore careers with AI. No sign-up. No tracking.
            </Text>
            <Button
              as={RouterLink}
              to="/discovery"
              size={{ base: 'md', md: 'lg' }}
              colorScheme="brand"
              mt={2}
              px={{ base: 6, md: 8 }}
              aria-label="Start your discovery journey"
              data-testid="about-hero-cta"
            >
              Start discovery
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box as="section" py={{ base: 5, md: 10 }} px={4} bg="chakra-body-bg" aria-labelledby="about-mission-title">
        <Container maxW={CONTENT_MAX_W}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <Box>
              <Heading
                id="about-mission-title"
                as="h2"
                size={{ base: 'md', md: 'lg' }}
                mb={2}
                color="chakra-body-text"
                data-testid="about-mission-title"
              >
                Our Mission
              </Heading>
              <Text fontSize="sm" color="chakra-body-text" lineHeight="tall">
                We help you answer "What do I do with my life?" by mapping your strengths, values, and interests to real options in a world shaped by AI.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              {missionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={item.title}
                    p={{ base: 3, md: 5 }}
                    bg="chakra-body-bg"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    boxShadow="sm"
                    _hover={{ shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <Flex align="flex-start" gap={2}>
                      <Box flexShrink={0} mt={0.5} color="accent" lineHeight={0}>
                        <Icon size={20} strokeWidth={2} />
                      </Box>
                      <Box minW={0}>
                        <Heading as="h3" size="sm" fontWeight="semibold" color="chakra-body-text" mb={1}>
                          {item.title}
                        </Heading>
                        <Text fontSize="xs" color="chakra-subtle-text" lineHeight="tall">
                          {item.description}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                );
              })}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* AI-Era Labor Section */}
      <Box as="section" bg="chakra-subtle-bg" py={{ base: 4, md: 6 }} px={4} borderTopWidth="1px" borderColor="chakra-border-color" aria-labelledby="about-thesis-title">
        <Container maxW={CONTENT_MAX_W}>
          <Box>
            <Heading
              id="about-thesis-title"
              as="h2"
              size="sm"
              mb={2}
              color="chakra-body-text"
              fontWeight="semibold"
              data-testid="about-thesis-title"
            >
              AI-Era Labor
            </Heading>
            <Text fontSize="sm" color="chakra-body-text" lineHeight="tall">
              As AI changes work, some skills matter more: thinking in systems, making decisions, adapting. Routine digital tasks matter less. Your unique strengths matter more.
            </Text>
          </Box>
        </Container>
      </Box>

      {/* Our Approach Section */}
      <Box as="section" bg="chakra-body-bg" py={{ base: 5, md: 10 }} px={4} aria-labelledby="about-approach-title">
        <Container maxW={CONTENT_MAX_W}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <Box>
              <Heading
                id="about-approach-title"
                as="h2"
                size="sm"
                mb={2}
                color="chakra-body-text"
                fontWeight="semibold"
                data-testid="about-approach-title"
              >
                Our Approach
              </Heading>
              <Text fontSize="sm" color="chakra-body-text" lineHeight="tall">
                Self-reflection and AI-powered questions help you see your strengths and patterns. We don\'t put you in one job box. We show how you think and solve problems so you can adapt as work changes.
              </Text>
            </Box>

            {/* Meet the Team */}
            <Box
              as="section"
              p={{ base: 4, md: 6 }}
              w="full"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="chakra-border-color"
              borderLeftWidth="4px"
              borderLeftColor="accent"
              bg="chakra-body-bg"
              boxShadow="sm"
              aria-labelledby="about-team-title"
            >
              <Heading
                id="about-team-title"
                as="h3"
                size={{ base: 'sm', md: 'md' }}
                mb={{ base: 3, md: 4 }}
                color="chakra-body-text"
                fontWeight="semibold"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <UsersRound size={22} aria-hidden />
                Meet the Team
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 3, md: 5 }} role="list">
                {devTeam.map((member) => (
                  <Flex
                    key={member.name}
                    role="listitem"
                    p={{ base: 3, md: 5 }}
                    bg="chakra-body-bg"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    align="center"
                    gap={3}
                    direction={{ base: 'row', md: 'column' }}
                  >
                    <Box
                      borderRadius="full"
                      overflow="hidden"
                      borderWidth="2px"
                      borderColor="accent"
                      bg="transparent"
                      flexShrink={0}
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        style={{ 
                          width: '112px', 
                          height: '112px', 
                          objectFit: 'cover',
                          objectPosition: 'top 40% center',
                          backgroundColor: 'transparent'
                        }}
                        loading="lazy"
                        decoding="async"
                      />
                    </Box>
                    <Heading as="h4" size="sm" fontWeight="semibold" color="chakra-body-text" mb={0}>
                      {member.name}
                    </Heading>
                  </Flex>
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Info & Navigation Section */}
      <Box py={{ base: 5, md: 8 }} px={4} bg="chakra-body-bg">
        <Container maxW={CONTENT_MAX_W}>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={3} flexWrap="wrap">
            <Button
              as={RouterLink}
              to="/"
              size="sm"
              variant="outline"
              colorScheme="gray"
              data-testid="about-link-home"
            >
              Home
            </Button>
            <Button
              as={RouterLink}
              to="/discovery"
              size="sm"
              colorScheme="brand"
              data-testid="about-link-start"
            >
              Start discovery
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

export default AboutPage;