export const palette = {
  primary: '#5B5FEF',
  splashGradientStart: '#5B5FEF',
  splashGradientEnd: '#2E2A8F',

  success: '#2E7D32',
  successBg: '#E6F4EA',
  error: '#C4444F',
  errorBg: '#FBEAEC',
  errorBorder: '#F6C6CB',
  warning: '#B4690B',
  warningBg: '#FFF4E0',
  info: '#1D63D6',
  infoBg: '#EAF2FF',

  favorite: '#E0245E',
  favoriteInactive: '#C7C5D6',

  tagBg: '#F1F0F7',
  tagText: '#5B5FEF',

  white: '#FFFFFF',
  black: '#000000',
};

export const lightTheme = {
  page: '#F6F6FB',
  surface: '#FFFFFF',
  cardBg: '#FFFFFF',
  border: '#ECEAF4',
  text: '#1B1B21',
  textSecondary: '#4B4956',
  textMuted: '#8B899A',
  inputBorder: '#DEDCE8',
  selectedChipBg: '#F4F4FE',
  ...palette,
};

export const darkTheme = {
  page: '#14131C',
  surface: '#1E1D29',
  cardBg: '#1E1D29',
  border: '#33314A',
  text: '#F1F0F7',
  textSecondary: '#C9C7DA',
  textMuted: '#9694AC',
  inputBorder: '#33314A',
  selectedChipBg: '#26243A',
  ...palette,
};

export type Theme = typeof lightTheme;
