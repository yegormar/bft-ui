import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Divider,
  Flex,
  Link,
  Code,
  Button,
} from '@chakra-ui/react';
import {
  Users,
  Lightbulb,
  ShieldCheck,
  ChartBar,
  Code2,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const missionItems = [
  {
    icon: Users,
    title: 'Community Focused',
    description: 'Designed with students and young adults in mind, helping you navigate your unique path.',
  },
  {
    icon: Lightbulb,
    title: 'Strengths-Based',
    description: 'Focuses on what you\'re naturally good at rather than predefined career tracks.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    description: 'Anonymous usage with no data collection or registration required.',
  },
  {
    icon: ChartBar,
    title: 'AI-Powered',
    description: 'Leverages advanced AI to provide personalized insights and recommendations.',
  },
];

const devTeam = [
  {
    name: 'Leo Cook',
    role: 'Project Lead & Architect',
    bio: 'Guides the project vision and architecture, with deep expertise in full-stack development and AI integration.',
    image: 'https://ui-avatars.com/api/?name=Leo+Cook&background=random&size=128',
  },
  {
    name: 'Yegor Markov',
    role: 'Frontend Developer',
    bio: 'Builds intuitive user experiences with React and Chakra UI, focusing on accessibility and usability.',
    image: 'https://ui-avatars.com/api/?name=Yegor+Markov&background=random&size=128',
  },
  {
    name: 'Eric He',
    role: 'Backend Engineer',
    bio: 'Designs the API and assessment engine, specializing in Node.js, Express, and AI-powered interviews.',
    image: 'https://ui-avatars.com/api/?name=Eric+He&background=random&size=128',
  },
];

const CONTENT_MAX_W = '2xl';

function AboutPage() {
  return (
    <Box as="main" data-testid="page-about" bg="chakra-subtle-bg">
      {/* Hero Section */}
      <Box bg="hero-bg" py={12} px={4} borderBottomWidth="1px" borderColor="hero-border">
        <Container maxW={CONTENT_MAX_W} centerContent>
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="2xl" fontWeight="extrabold" color="hero-title" data-testid="about-hero-title">
              About Built for Tomorrow
            </Heading>
            <Text fontSize="xl" color="hero-tagline" fontWeight="semibold" data-testid="about-hero-tagline">
              Understanding your strengths for a better future
            </Text>
            <Text fontSize="md" color="chakra-subtle-text" maxW="2xl">
              An exploratory tool helping students and young adults navigate the complex world of work
              through AI-powered insights and career guidance.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Mission Section */}
      <Box py={12} px={4} bg="chakra-body-bg">
        <Container maxW={CONTENT_MAX_W}>
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading
                as="h2"
                size="lg"
                mb={4}
                color="chakra-body-text"
                data-testid="about-mission-title"
              >
                Our Mission
              </Heading>
              <Text fontSize="md" color="chakra-body-text" lineHeight="tall">
                Built for Tomorrow was created to help answer one of the biggest questions facing students and young adults today:
                <Text as="span" fontWeight="medium">
                  {' '}
                  "What should I do with my life?"
                </Text>
              </Text>
              <Text mt={4} fontSize="md" color="chakra-body-text" lineHeight="tall">
                We believe the answer isn't about finding a single "correct" path, but rather understanding your unique strengths,
                values, and interests—and seeing how they can translate into meaningful work in a rapidly changing world shaped by AI.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {missionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={item.title}
                    p={5}
                    bg="chakra-body-bg"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                    boxShadow="sm"
                    _hover={{ shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <Flex align="flex-start" gap={3}>
                      <Box flexShrink={0} mt={0.5} color="accent" lineHeight={0}>
                        <Icon size={24} strokeWidth={2} />
                      </Box>
                      <Box>
                        <Heading as="h3" size="sm" fontWeight="semibold" color="chakra-body-text" mb={2}>
                          {item.title}
                        </Heading>
                        <Text fontSize="sm" color="chakra-subtle-text" lineHeight="tall">
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
      <Box bg="chakra-subtle-bg" py={8} px={4} borderTopWidth="1px" borderColor="chakra-border-color">
        <Container maxW={CONTENT_MAX_W}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading
                as="h2"
                size="md"
                mb={4}
                color="chakra-body-text"
                fontWeight="semibold"
                data-testid="about-thesis-title"
              >
                AI-Era Labor
              </Heading>
              <Text fontSize="md" color="chakra-body-text" lineHeight="tall">
                Our assessment model is grounded in a specific view of how AI is reshaping the labor landscape over the next 10-15 years. Routine cognitive processing is becoming cheap and abundant, while the human premium shifts to designing, governing, and humanizing intelligent systems, plus operating physical and institutional infrastructure. This means skills related to systems thinking, AI governance, decision ownership, and cross-cutting meta-skills like adaptability and ambiguity tolerance will grow in value, while routine digital execution and structured analysis will decline.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Our Approach Section */}
      <Box bg="chakra-body-bg" py={12} px={4}>
        <Container maxW={CONTENT_MAX_W}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading
                as="h2"
                size="md"
                mb={4}
                color="chakra-body-text"
                fontWeight="semibold"
                data-testid="about-approach-title"
              >
                Our Approach
              </Heading>
              <Text fontSize="md" color="chakra-body-text" lineHeight="tall">
                We use a combination of self-reflection exercises, AI-powered interviews, and evidence-based
                career assessment frameworks to help you discover your unique pattern of strengths.
              </Text>
              <Text mt={4} fontSize="md" color="chakra-body-text" lineHeight="tall">
                Rather than categorizing you into a specific career, we help you understand the
                <Text as="span" fontWeight="medium"> capabilities </Text>
                and
                <Text as="span" fontWeight="medium"> patterns </Text>
                that define how you think, solve problems, and interact with the world—skills that will remain valuable regardless of how the job market changes.
              </Text>
            </Box>

            {/* Developer Section */}
            <Box
              p={6}
              w="full"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="chakra-border-color"
              borderLeftWidth="4px"
              borderLeftColor="accent"
              bg="chakra-body-bg"
              boxShadow="sm"
            >
              <Heading
                as="h3"
                size="lg"
                mb={6}
                color="chakra-body-text"
                fontWeight="semibold"
                display="flex"
                alignItems="center"
                gap={3}
              >
                <Code2 size={28} />
                Meet the Developers
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                {devTeam.map((member) => (
                  <Box
                    key={member.name}
                    p={5}
                    bg="chakra-body-bg"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="chakra-border-color"
                  >
                    <VStack align="start" spacing={3}>
                      <Box borderRadius="full" overflow="hidden" borderWidth="2px" borderColor="accent">
                        <img
                          src={member.image}
                          alt={member.name}
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      </Box>
                      <Box>
                        <Heading as="h4" size="md" fontWeight="semibold" color="chakra-body-text" mb={1}>
                          {member.name}
                        </Heading>
                        <Text fontSize="sm" color="accent" fontWeight="medium">
                          {member.role}
                        </Text>
                      </Box>
                      <Text fontSize="sm" color="chakra-subtle-text" lineHeight="tall">
                        {member.bio}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        </Container>
      </Box>

      <Box bg="chakra-subtle-bg" py={8} px={4} borderTopWidth="1px" borderColor="chakra-border-color">
        <Container maxW={CONTENT_MAX_W}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading
                as="h2"
                size="md"
                mb={4}
                color="chakra-body-text"
                fontWeight="semibold"
                data-testid="about-tech-title"
              >
                Technology Stack
              </Heading>
              <Text fontSize="md" color="chakra-body-text" lineHeight="tall">
                Built for Tomorrow is built using modern web technologies including React, Chakra UI, and integrates with advanced AI models
                to provide personalized insights. The platform is designed to be accessible, responsive,
                and privacy-focused.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Info & Navigation Section */}
      <Box py={12} px={4} bg="chakra-body-bg">
        <Container maxW={CONTENT_MAX_W}>
          <VStack spacing={8} align="stretch">
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
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading as="h3" size="sm" fontWeight="semibold" color="chakra-body-text" mb={2}>
                    Key Information
                  </Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing-y={2} spacing-x={4}>
                    <VStack align="stretch" spacing={1}>
                      <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="chakra-subtle-text">
                        Project Status
                      </Text>
                      <Text fontSize="sm" color="chakra-body-text" fontWeight="medium">
                        Active Development
                      </Text>
                    </VStack>
                    <VStack align="stretch" spacing={1}>
                      <Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="chakra-subtle-text">
                        Target Audience
                      </Text>
                      <Text fontSize="sm" color="chakra-body-text" fontWeight="medium">
                        Students & Young Adults
                      </Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                <Box>
                  <Heading as="h3" size="sm" fontWeight="semibold" color="chakra-body-text" mb={3}>
                    Explore More
                  </Heading>
                  <VStack align="start" spacing={3}>
                    <Link
                      as={RouterLink}
                      to="/"
                      color="accent"
                      textDecoration="none"
                      _hover={{ textDecoration: 'underline' }}
                      data-testid="about-link-home"
                    >
                      ← Return Home
                    </Link>
                    <Link
                      as={RouterLink}
                      to="/discovery"
                      color="accent"
                      textDecoration="none"
                      _hover={{ textDecoration: 'underline' }}
                      data-testid="about-link-start"
                    >
                      Start Your Discovery →
                    </Link>
                  </VStack>
                </Box>

                <Box>
                  <Heading as="h3" size="sm" fontWeight="semibold" color="chakra-body-text" mb={2}>
                    What Others Say
                  </Heading>
                  <Text fontSize="sm" color="chakra-subtle-text" lineHeight="tall">
                    "The career guidance tool I wish I had when I was starting out."
                    <br />
                    <Text as="span" fontStyle="italic" fontSize="xs">
                      — A participant
                    </Text>
                  </Text>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

export default AboutPage;