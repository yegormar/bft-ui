import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CircleCheck, ShieldCheck } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const reframing = [
  { old: 'What job should I choose?', new: 'What capabilities should I build?' },
  { old: 'What major is safe?', new: 'What skills will still matter in 10 years?' },
  { old: 'What if AI replaces me?', new: 'How do I stay useful as work changes?' },
  { old: 'What is my passion?', new: 'Where do my strengths add up over time?' },
];

const trustItems = [
  { title: 'No sign-up', text: 'Jump in. No account, no email.', icon: CircleCheck },
  {
    title: 'Private and free',
    text: "We're a school project. We don't sell your data. We only use simple counts to improve the tool.",
    icon: ShieldCheck,
  },
];

const CONTENT_MAX_W = '2xl';

function HomePage() {
  return (
    <Box as="main" data-testid="page-home" bg="chakra-subtle-bg">
      {/* Hero: tint aligns with brand colorScheme */}
      <Box
        as="section"
        bg="hero-bg"
        py={{ base: 6, md: 12 }}
        px={4}
        borderBottomWidth="1px"
        borderColor="hero-border"
        aria-labelledby="home-hero-title"
      >
        <Container maxW={CONTENT_MAX_W} centerContent>
          <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
            <Heading
              id="home-hero-title"
              as="h1"
              size={{ base: 'xl', md: '2xl' }}
              fontWeight="extrabold"
              color="hero-title"
              data-testid="home-hero-title"
            >
              Built for Tomorrow
            </Heading>
            <Text fontSize={{ base: 'md', md: 'xl' }} color="hero-tagline" fontWeight="semibold" data-testid="home-hero-tagline">
              Find your strengths. See where it takes you.
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} color="chakra-subtle-text" maxW="2xl" lineHeight="tall">
              Discover your strengths, explore professions and skills, and see where to invest your time. No sign-up. No one right path.
            </Text>
            <Button
              as={RouterLink}
              to="/discovery"
              colorScheme="brand"
              size={{ base: 'md', md: 'lg' }}
              mt={2}
              px={{ base: 6, md: 8 }}
              aria-label="Start your discovery journey"
              data-testid="home-start-discovery"
            >
              Start discovery
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* The shift: main content section */}
      <Box
        as="section"
        py={{ base: 8, md: 12 }}
        px={4}
        bg="chakra-body-bg"
        aria-labelledby="home-reframe-title"
      >
        <Container maxW={CONTENT_MAX_W}>
          <Heading
            id="home-reframe-title"
            as="h2"
            size={{ base: 'md', md: 'lg' }}
            mb={{ base: 5, md: 8 }}
            textAlign="center"
            color="chakra-body-text"
            data-testid="home-reframe-title"
          >
            The shift you can make
          </Heading>
          <VStack as="ul" spacing={{ base: 4, md: 5 }} align="stretch" listStyleType="none" role="list">
            {reframing.map(({ old: oldQ, new: newQ }) => (
              <Box
                as="li"
                key={oldQ}
                role="listitem"
                p={{ base: 4, md: 5 }}
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
                <Text fontWeight="medium" color="chakra-body-text" fontSize={{ base: 'sm', md: 'md' }}>
                  To: {newQ}
                </Text>
              </Box>
            ))}
          </VStack>
          <Box textAlign="center" mt={{ base: 6, md: 8 }}>
            <Button
              as={RouterLink}
              to="/discovery"
              colorScheme="brand"
              size="md"
              aria-label="Start your discovery"
              data-testid="home-start-discovery-secondary"
            >
              Start discovery
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Privacy */}
      <Box
        as="section"
        py={{ base: 5, md: 6 }}
        px={4}
        bg="chakra-subtle-bg"
        borderTopWidth="1px"
        borderColor="chakra-border-color"
        aria-labelledby="home-privacy-title"
      >
        <Container maxW={CONTENT_MAX_W}>
          <Heading
            id="home-privacy-title"
            as="h2"
            size={{ base: 'sm', md: 'md' }}
            mb={3}
            textAlign="center"
            color="chakra-body-text"
            fontWeight="semibold"
            data-testid="home-privacy-title"
          >
            Your privacy matters
          </Heading>
          <Flex direction={{ base: 'column', sm: 'row' }} gap={3} justify="center" flexWrap="wrap">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.title}
                  as="div"
                  size="sm"
                  variant="outline"
                  colorScheme="gray"
                  leftIcon={<Box as="span" color="accent" lineHeight={0}><Icon size={18} strokeWidth={2} aria-hidden /></Box>}
                  cursor="default"
                  _hover={{ bg: 'chakra-subtle-bg' }}
                  data-testid={`home-trust-item-${item.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                >
                  {item.title}
                </Button>
              );
            })}
          </Flex>
          <Text fontSize="xs" color="chakra-subtle-text" textAlign="center" mt={3}>
            No account required. We don't sell your data.
          </Text>
        </Container>
      </Box>

      {/* Feedback & support */}
      <Box
        as="section"
        py={{ base: 5, md: 6 }}
        px={4}
        bg="chakra-subtle-bg"
        borderTopWidth="1px"
        borderColor="chakra-border-color"
        aria-labelledby="home-support-title"
      >
        <Container maxW={CONTENT_MAX_W}>
          <Box textAlign="center">
            <Heading id="home-support-title" as="h2" size="sm" mb={1} color="chakra-body-text" fontWeight="semibold" data-testid="home-support-title">
              <Link
                as={RouterLink}
                to="/feedback"
                color="accent"
                textDecoration="underline"
                _hover={{ opacity: 0.85 }}
                data-testid="home-feedback-link"
              >
                Feedback & support
              </Link>
            </Heading>
            <Text fontSize="sm" color="chakra-subtle-text">
              Built for Tomorrow is free. Got a bug, an idea, or feedback? We're listening.
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;
