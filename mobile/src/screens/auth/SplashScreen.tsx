import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/theme/colors';
import { typography } from '@/theme/typography';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>JobLinxs</Text>
      <ActivityIndicator color={palette.white} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.splashGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: palette.white,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.black,
  },
  spinner: {
    marginTop: 24,
  },
});
