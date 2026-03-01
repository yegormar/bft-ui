import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

/**
 * Branded hero strip for inner pages (Discovery, Results, Careers).
 * Matches HomePage hero: hero-bg, hero-border, hero-title, hero-tagline.
 */
export default function PageHero({ title, tagline }) {
  return (
    <Box bg="hero-bg" py={8} px={4} borderBottomWidth="1px" borderColor="hero-border">
      <Container maxW="2xl" centerContent>
        <VStack spacing={2} textAlign="center">
          <Heading as="h1" size="xl" fontWeight="extrabold" color="hero-title">
            {title}
          </Heading>
          {tagline && (
            <Text fontSize="md" color="hero-tagline" fontWeight="medium">
              {tagline}
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
