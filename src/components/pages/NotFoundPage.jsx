import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function NotFoundPage() {
  return (
    <Flex
      as="main"
      minH={{ base: 'calc(100vh - 120px)', md: 'calc(100vh - 100px)' }}
      align="center"
      justify="center"
      px={4}
      data-testid="page-not-found"
    >
      <Box textAlign="center">
        <Heading size="lg" mb={2}>
          Not Found
        </Heading>
        <Text color="chakra-subtle-text" mb={4}>
          This page does not exist.
        </Text>
        <Button as={RouterLink} to="/" colorScheme="brand" size="md">
          Go to Home
        </Button>
      </Box>
    </Flex>
  );
}

export default NotFoundPage;
