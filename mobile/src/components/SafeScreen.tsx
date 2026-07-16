import React, { type ReactNode } from 'react';
import { View, StyleSheet, StatusBar, type StatusBarProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: ReactNode;
  style?: any;
  statusBar?: StatusBarProps;
}

export function SafeScreen({ children, style, statusBar }: SafeScreenProps) {
  const insets = useSafeAreaInsets();
  const bgColor = statusBar?.backgroundColor;

  return (
    <View style={[styles.root, { paddingTop: insets.top }, style]}>
      {bgColor && (
        <View style={[styles.statusBarBg, { height: insets.top, backgroundColor: bgColor }]} />
      )}
      <StatusBar {...statusBar} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    //borderWidth: 10,
    //borderColor: 'red',
  },
  statusBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
