import { extendTheme } from '@chakra-ui/react';
import { foundations } from '@chakra-ui/theme/foundations';

// Brand = one of Chakra's built-in palettes. Change this to experiment:
// gray | red | orange | yellow | green | teal | blue | cyan | purple | pink
const brandColors = foundations.colors.teal;

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
