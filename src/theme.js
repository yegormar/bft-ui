import { extendTheme } from '@chakra-ui/react';

// Brand = Chakra's built-in teal palette
const brandColors = {
  50: '#e6fffa',
  100: '#b2f5ea',
  200: '#81e6d9',
  300: '#4fd1c5',
  400: '#38b2ac',
  500: '#319795',
  600: '#285e61',
  700: '#234e52',
  800: '#1d4044',
  900: '#162f32',
};

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: brandColors,
  },
  semanticTokens: {
    colors: {
      'hero-bg': { _light: 'brand.50', _dark: 'gray.800' },
      'hero-border': { _light: 'brand.100', _dark: 'whiteAlpha.200' },
      'hero-title': { _light: 'brand.800', _dark: 'brand.200' },
      'hero-tagline': { _light: 'brand.700', _dark: 'brand.300' },
      accent: { _light: 'brand.500', _dark: 'brand.400' },
      'nav-active': { _light: 'brand.600', _dark: 'brand.400' },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'system-ui, sans-serif',
  },
});

export default theme;
