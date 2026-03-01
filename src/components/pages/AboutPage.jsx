import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import PageHero from '../Layout/PageHero';

function AboutPage() {
  return (
    <>
      <PageHero title="About" tagline="Built for Tomorrow" />
      <Box as="main" py={12} px={4} bg="chakra-body-bg" data-testid="page-about">
        <Container maxW="2xl">
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
            <VStack align="stretch" spacing={4}>
              <Text color="chakra-body-text" lineHeight="tall" data-testid="about-content">
                This is the about page.
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default AboutPage;
