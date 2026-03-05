import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Flex, HStack, IconButton, Link, Tooltip, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

function Header() {
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();

  const linkProps = (path) => ({
    as: RouterLink,
    to: path,
    color: location.pathname === path ? 'nav-active' : 'chakra-subtle-text',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    _hover: { color: location.pathname === path ? 'nav-active' : 'chakra-body-text' },
  });

  return (
    <Box as="header" borderBottomWidth="1px" borderColor="chakra-border-color" py={3} px={4} data-testid="header">
      <Flex align="center" justify="space-between">
        <HStack as="nav" spacing={4}>
            <Tooltip label="Home" hasArrow>
              <Link {...linkProps('/')} data-testid="nav-home" display="flex" alignItems="center">
                <HStack spacing={2} as="span">
                  <Box as="img" src="/favicon.svg" alt="" h="8" w="auto" />
                  <Box as="span">BFT</Box>
                </HStack>
              </Link>
            </Tooltip>
            <Tooltip label="Discovery" hasArrow>
              <Link {...linkProps('/discovery')} data-testid="nav-discovery">
                Discovery
              </Link>
            </Tooltip>
            <Tooltip label="Results" hasArrow>
              <Link {...linkProps('/results')} data-testid="nav-results">
                Results
              </Link>
            </Tooltip>
            <Tooltip label="Careers" hasArrow>
              <Link {...linkProps('/recommendations')} data-testid="nav-recommendations">
                Careers
              </Link>
            </Tooltip>
            <Tooltip label="About" hasArrow>
              <Link {...linkProps('/about')} data-testid="nav-about">
                About
              </Link>
            </Tooltip>
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
