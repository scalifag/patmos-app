import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const mockCompanies = ['Compañía A', 'Compañía B', 'Compañía C'];

export default function HomeScreen() {
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0]);

  const handleChangeCompany = () => {
    const currentIndex = mockCompanies.indexOf(selectedCompany);
    const nextIndex = (currentIndex + 1) % mockCompanies.length;
    setSelectedCompany(mockCompanies[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Compañía actual:</Text>
      <Text style={styles.company}>{selectedCompany}</Text>
      <Button title="Cambiar compañía" onPress={handleChangeCompany} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 18, marginBottom: 8 },
  company: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});
