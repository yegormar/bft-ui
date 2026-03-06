import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Flex, HStack, IconButton, Link, Tooltip, useColorMode, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { MoonIcon, SunIcon, HamburgerIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Languages } from 'lucide-react';

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];

function Header() {
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('locale');
    return saved || 'en';
  });

  const setLanguage = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const currentLocaleLabel = LOCALES.find((l) => l.value === locale)?.label ?? locale.toUpperCase();

  const linkProps = (path) => ({
    as: RouterLink,
    to: path,
    color: location.pathname === path ? 'nav-active' : 'chakra-subtle-text',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    _hover: { color: location.pathname === path ? 'nav-active' : 'chakra-body-text' },
  });

  const menuLinkProps = (path) => ({
    as: RouterLink,
    to: path,
    color: location.pathname === path ? 'nav-active' : 'chakra-body-text',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    display: 'block',
    w: '100%',
    px: 4,
    py: 2,
    _hover: { bg: 'chakra-bg-subtle' },
  });

  return (
    <Box as="header" borderBottomWidth="1px" borderColor="chakra-border-color" py={3} px={4} data-testid="header">
      <Flex align="center" justify="space-between">
        <HStack as="nav" spacing={4}>
            <Tooltip label="Home" hasArrow>
              <Link {...linkProps('/')} data-testid="nav-home" display="flex" alignItems="center">
                <HStack spacing={2} as="span">
                  <Box as="img" src="/favicon.svg" alt="" h="8" w="auto" />
                  <Box as="span" fontWeight="bold">BFT</Box>
                </HStack>
              </Link>
            </Tooltip>
          </HStack>
        <HStack spacing={4}>
          <IconButton
            aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="lg"
            data-testid="color-mode-toggle"
          />
          <Tooltip label="Select language" hasArrow>
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<Box as="span" lineHeight={0}><Languages size={20} strokeWidth={2} /></Box>}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                size="lg"
                fontWeight="normal"
                data-testid="language-dropdown"
                aria-label="Select language"
              >
                {currentLocaleLabel}
              </MenuButton>
            <MenuList>
              {LOCALES.map((l) => (
                <MenuItem
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  fontWeight={locale === l.value ? 'bold' : 'normal'}
                  data-testid={`language-option-${l.value}`}
                >
                  {l.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          </Tooltip>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Open menu"
              icon={<HamburgerIcon boxSize={6} />}
              variant="ghost"
              size="lg"
            />
            <MenuList>
              <MenuItem {...menuLinkProps('/discovery')} data-testid="menu-discovery">
                Discovery
              </MenuItem>
              <MenuItem {...menuLinkProps('/results')} data-testid="menu-results">
                Results
              </MenuItem>
              <MenuItem {...menuLinkProps('/recommendations')} data-testid="menu-careers">
                Careers
              </MenuItem>
              <MenuItem {...menuLinkProps('/about')} data-testid="menu-about">
                About
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Header;
