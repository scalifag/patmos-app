import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PersonalizarListViewScreen() {
  return (
    <View style={styles.container}>
      <Text>PersonalizarListViewScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});