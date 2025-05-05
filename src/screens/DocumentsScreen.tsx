import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DocumentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Aquí irán los documentos 🎯</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
});
