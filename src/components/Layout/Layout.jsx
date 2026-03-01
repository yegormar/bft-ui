import { Box } from '@chakra-ui/react';
import Header from './Header';

function Layout({ children }) {
  return (
    <Box minH="100vh" bg="chakra-body-bg" color="chakra-body-text" data-testid="layout">
      <Header />
      <Box as="main" p={4}>
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
