import { Platform } from 'react-native';

const fontFamily = Platform.select({ android: 'sans-serif', ios: 'System', default: 'System' });

export const typography = {
  fontFamily,
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
};
