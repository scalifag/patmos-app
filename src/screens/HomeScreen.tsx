import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';

const mockCompanies = [
  { name: 'Base de datos de SAP 1', icon: '🏢' },
  { name: 'Base de datos de SAP 2', icon: '🏬' },
  { name: 'Base de datos de SAP 3', icon: '🏭' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectCompany = (company: typeof mockCompanies[0]) => {
    setSelectedCompany(company);
    setModalVisible(false);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerCompanyButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.companyIcon}>{selectedCompany.icon}</Text>
          <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
            {selectedCompany.name}
          </Text>
          <MaterialIcons name="expand-more" size={18} color={colors.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedCompany, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.welcomeText, { color: colors.text }]}>
        Bienvenido a la app de {selectedCompany.name}
      </Text>

      {/* Modal para seleccionar compañía */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar compañía</Text>
            <FlatList
              data={mockCompanies}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.optionItem,
                    { borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.border },
                  ]}
                  onPress={() => handleSelectCompany(item)}
                >
                  <Text style={styles.optionIcon}>{item.icon}</Text>
                  <Text style={[styles.optionText, { color: colors.text }]}>{item.name}</Text>
                </Pressable>
              )}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={[styles.cancelText, { color: colors.primary }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeText: { fontSize: 16, textAlign: 'center' },
  headerCompanyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical:10,
    borderRadius: 5,
    marginLeft: 8,
  },
  companyIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: 300,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#007AFF',
  },
});
