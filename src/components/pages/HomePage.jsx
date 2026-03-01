import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CircleCheck, ShieldCheck } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const reframing = [
  { old: 'What job should I choose?', new: 'What capabilities should I build?' },
  { old: 'What major is safe?', new: 'What skill stack is durable?' },
  { old: 'What if AI replaces me?', new: 'How do I become complementary to AI?' },
  { old: 'What is my passion?', new: 'Where do my strengths compound over time?' },
];

const trustItems = [
  { title: 'No registration required', text: 'Start right away; no sign-up.', icon: CircleCheck },
  {
    title: 'Anonymous & a school project',
    text: "We don't sell your data; we only use simple counts to improve the tool.",
    icon: ShieldCheck,
  },
];

const CONTENT_MAX_W = '2xl';

function HomePage() {
  return (
    <Box as="main" data-testid="page-home" bg="chakra-subtle-bg">
      {/* Hero: tint aligns with brand colorScheme */}
      <Box bg="hero-bg" py={12} px={4} borderBottomWidth="1px" borderColor="hero-border">
        <Container maxW={CONTENT_MAX_W} centerContent>
          <VStack spacing={4} textAlign="center">
            <Heading as="h1" size="2xl" fontWeight="extrabold" color="hero-title" data-testid="home-hero-title">
              Built for Tomorrow
            </Heading>
            <Text fontSize="xl" color="hero-tagline" fontWeight="semibold" data-testid="home-hero-tagline">
              Do not panic. Find your strengths. You can do this.
            </Text>
            <Text fontSize="md" color="chakra-subtle-text" maxW="2xl">
              An AI-powered guided interview for students and young adults facing uncertainty about college,
              careers, and the future of work. We help you understand your strengths and build a
              realistic direction, not a single “correct” path.
            </Text>
            <Button
              as={RouterLink}
              to="/discovery"
              colorScheme="brand"
              size="lg"
              mt={2}
              px={8}
              data-testid="home-start-discovery"
            >
              Start discovery
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* The shift: main content section */}
      <Box py={12} px={4} bg="chakra-body-bg">
        <Container maxW={CONTENT_MAX_W}>
          <Heading
            as="h2"
            size="lg"
            mb={8}
            textAlign="center"
            color="chakra-body-text"
            data-testid="home-reframe-title"
          >
            The shift we help you make
          </Heading>
          <VStack spacing={5} align="stretch">
            {reframing.map(({ old: oldQ, new: newQ }) => (
              <Box
                key={oldQ}
                p={5}
                bg="chakra-body-bg"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="chakra-border-color"
                borderLeftWidth="4px"
                borderLeftColor="accent"
                boxShadow="sm"
                _hover={{ shadow: 'md' }}
                transition="box-shadow 0.2s"
                data-testid="home-reframe-row"
              >
                <Text fontSize="sm" color="chakra-subtle-text" mb={2}>
                  From: {oldQ}
                </Text>
                <Text fontWeight="medium" color="chakra-body-text" fontSize="md">
                  To: {newQ}
                </Text>
              </Box>
            ))}
          </VStack>
          <Box textAlign="center" mt={8}>
            <Button
              as={RouterLink}
              to="/discovery"
              colorScheme="brand"
              size="md"
              data-testid="home-start-discovery-secondary"
            >
              Start discovery
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Privacy + Feedback: one box, minimal vertical space */}
      <Box py={6} px={4} bg="chakra-subtle-bg" borderTopWidth="1px" borderColor="chakra-border-color">
        <Container maxW={CONTENT_MAX_W}>
          <VStack spacing={5} align="stretch">
            <Box>
              <Heading
                as="h2"
                size="md"
                mb={3}
                textAlign="center"
                color="chakra-body-text"
                fontWeight="semibold"
                data-testid="home-privacy-title"
              >
                Your privacy matters
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} w="100%">
                {trustItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Flex
                      key={item.title}
                      align="flex-start"
                      gap={2}
                      py={0}
                      data-testid="home-trust-item"
                    >
                      <Box flexShrink={0} mt={0.5} color="accent" lineHeight={0}>
                        <Icon size={20} strokeWidth={2} />
                      </Box>
                      <Box>
                        <Text
                          fontWeight="bold"
                          fontSize="xs"
                          color="chakra-body-text"
                          mb={0}
                          textTransform="uppercase"
                          letterSpacing="wider"
                          data-testid="home-trust-item-title"
                        >
                          {item.title}
                        </Text>
                        <Text fontSize="xs" color="chakra-subtle-text" lineHeight="tall">
                          {item.text}
                        </Text>
                      </Box>
                    </Flex>
                  );
                })}
              </SimpleGrid>
            </Box>
            <Box textAlign="center">
              <Heading as="h2" size="sm" mb={1} color="chakra-body-text" fontWeight="semibold">
                Feedback & support
              </Heading>
              <Text fontSize="sm" color="chakra-subtle-text" data-testid="home-support-title">
                Built for Tomorrow is free. For bugs, feature ideas, or constructive feedback, reach out.
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;
