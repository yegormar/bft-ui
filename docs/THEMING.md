# Theming and dark mode (Chakra UI)

## Brand color

- **Single source of truth**: `src/theme.js`
- Set `brandColors = foundations.colors.<name>` (e.g. `teal`, `cyan`, `blue`, `purple`, `pink`, `green`, `orange`, `yellow`, `red`, `gray`)
- Changing this one line updates the whole app (buttons, hero, accents, active nav)

## Semantic tokens (light/dark)

All colors that must work in both light and dark mode use **semantic tokens**, not raw palette values.

### Chakra built-in

| Token | Use for |
|-------|--------|
| `chakra-body-bg` | Page/section/card backgrounds |
| `chakra-body-text` | Primary text, headings |
| `chakra-subtle-bg` | Alternate section background (e.g. footer strip) |
| `chakra-subtle-text` | Secondary/muted text |
| `chakra-border-color` | Borders, dividers |

### Custom (defined in `src/theme.js`)

| Token | Use for |
|-------|--------|
| `hero-bg` | Hero section background |
| `hero-border` | Hero section border |
| `hero-title` | Hero main heading |
| `hero-tagline` | Hero tagline text |
| `accent` | Card left border, icons, small accents |
| `nav-active` | Active nav link color |

## Rules for components

- **Do not** use hardcoded `gray.*`, `white`, or raw `brand.*` for backgrounds, text, or borders that should change in dark mode.
- **Do** use the semantic token names above (e.g. `bg="chakra-body-bg"`, `color="chakra-body-text"`).
- Buttons: use `colorScheme="brand"` (no custom variant).
- Layout root: use `bg="chakra-body-bg"` and `color="chakra-body-text"` so the app inherits the theme.

## Adding new mode-aware colors

Add them in `theme.js` under `semanticTokens.colors` with `_light` and `_dark`:

```js
'my-token': { _light: 'brand.500', _dark: 'brand.400' },
```

Then use `color="my-token"` or `bg="my-token"` in components. Do not add `colorMode` checks in component code for styling.

## Dark mode toggle

The header has a sun/moon toggle; it only calls `toggleColorMode()`. The theme and semantic tokens handle all visual changes.
