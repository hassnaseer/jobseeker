import { createTheme } from '@mui/material/styles';

/**
 * Palette extracted from the JobLinxs Claude Design prototype (hardcoded
 * hex values found throughout JobLinxs Prototype.dc.html / Landing.dc.html
 * — the design tool's own CSS-var theme values aren't statically present
 * in the exported HTML, so these are reconstructed from the literal
 * colors used across cards, badges, and status pills).
 */
export const palette = {
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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: palette.primary, dark: palette.primaryDark, contrastText: '#fff' },
    success: { main: palette.success },
    error: { main: palette.error },
    warning: { main: palette.warning },
    info: { main: palette.info },
    background: { default: palette.page, paper: palette.surface },
    text: { primary: palette.text, secondary: palette.textSecondary },
    divider: palette.border,
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
          border: `1px solid ${palette.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${palette.border}`,
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
          backgroundColor: palette.surface,
          color: palette.text,
          boxShadow: 'none',
          borderBottom: `1px solid ${palette.border}`,
        },
      },
    },
  },
});

export default theme;
