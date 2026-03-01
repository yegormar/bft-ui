import { Box, Heading, Text } from '@chakra-ui/react';

function AboutPage() {
  return (
    <Box data-testid="page-about">
      <Heading size="lg" mb={2}>
        About
      </Heading>
      <Text data-testid="about-content">This is the about page.</Text>
    </Box>
  );
}

export default AboutPage;
