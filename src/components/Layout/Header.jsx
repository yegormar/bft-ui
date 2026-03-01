import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Flex, HStack, IconButton, Link, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

function Header() {
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();

  const linkProps = (path) => ({
    as: RouterLink,
    color: location.pathname === path ? 'nav-active' : 'chakra-subtle-text',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    _hover: { color: location.pathname === path ? 'nav-active' : 'chakra-body-text' },
  });

  return (
    <Box as="header" borderBottomWidth="1px" borderColor="chakra-border-color" py={3} px={4} data-testid="header">
      <Flex align="center" justify="space-between">
        <HStack as="nav" spacing={4}>
          <Link to="/" {...linkProps('/')} data-testid="nav-home">
            Home
          </Link>
          <Link to="/discovery" {...linkProps('/discovery')} data-testid="nav-discovery">
            Discovery
          </Link>
          <Link to="/results" {...linkProps('/results')} data-testid="nav-results">
            Results
          </Link>
          <Link to="/about" {...linkProps('/about')} data-testid="nav-about">
            About
          </Link>
        </HStack>
        <IconButton
          aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          size="sm"
          data-testid="color-mode-toggle"
        />
      </Flex>
    </Box>
  );
}

export default Header;
