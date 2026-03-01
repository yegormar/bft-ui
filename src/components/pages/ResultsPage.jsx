import { Box, Container, Heading, Text } from '@chakra-ui/react';

function ResultsPage() {
  return (
    <Box as="main" py={12} px={4} data-testid="page-results">
      <Container maxW="2xl" centerContent>
        <Heading size="lg" mb={4}>
          Results
        </Heading>
        <Text color="chakra-subtle-text">
          Your discovery results will appear here.
        </Text>
      </Container>
    </Box>
  );
}

export default ResultsPage;
