import { createTheme, type PaletteMode, type Theme } from '@mui/material/styles';

/**
 * Palette extracted from the JobLinxs Claude Design prototype (hardcoded
 * hex values found throughout JobLinxs Prototype.dc.html / Landing.dc.html
 * — the design tool's own CSS-var theme values aren't statically present
 * in the exported HTML, so these are reconstructed from the literal
 * colors used across cards, badges, and status pills).
 */
export const lightPalette = {
  primary: '#5B5FEF',
  primaryDark: '#4347C4',
  page: '#EFEEFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F6FB',
  border: '#DEDCE8',
  borderLight: '#E7E5F1',
  text: '#1B1B21',
  textSecondary: '#6B6975',
  textMuted: '#ABA9B8',
  success: '#2E7D32',
  successBg: '#E6F4EA',
  error: '#C4444F',
  errorBg: '#FBEAEC',
  warning: '#B4690B',
  warningBg: '#FFF4E0',
  info: '#1D63D6',
  infoBg: '#EAF2FF',
};

/** Dark counterpart — same brand primary, inverted surfaces/text. */
export const darkPalette = {
  primary: '#7B7FFB',
  primaryDark: '#5B5FEF',
  page: '#131320',
  surface: '#1B1B2B',
  surfaceAlt: '#22223500',
  border: '#33334A',
  borderLight: '#2A2A3D',
  text: '#F1F0F7',
  textSecondary: '#B4B2C4',
  textMuted: '#7C7A8F',
  success: '#5FCB6E',
  successBg: '#183A20',
  error: '#E3707A',
  errorBg: '#3C1E22',
  warning: '#E3A24E',
  warningBg: '#3B2C11',
  info: '#6FA6F5',
  infoBg: '#132A47',
};

export const palette = lightPalette;

export function getTheme(mode: PaletteMode): Theme {
  const p = mode === 'dark' ? darkPalette : lightPalette;

  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary, dark: p.primaryDark, contrastText: '#fff' },
      success: { main: p.success },
      error: { main: p.error },
      warning: { main: p.warning },
      info: { main: p.info },
      background: { default: p.page, paper: p.surface },
      text: { primary: p.text, secondary: p.textSecondary },
      divider: p.border,
    },
    typography: {
      fontFamily: "'Roboto', sans-serif",
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12, padding: '10px 20px' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${p.border}`,
            boxShadow: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${p.border}`,
            boxShadow: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: p.surface,
            color: p.text,
            boxShadow: 'none',
            borderBottom: `1px solid ${p.border}`,
          },
        },
      },
    },
  });
}

const theme = getTheme('light');

export default theme;
