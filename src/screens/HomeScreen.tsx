import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { getCompanies, Company } from '@/utils/companyService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const fetchedCompanies = await getCompanies();
      setCompanies(fetchedCompanies);
      if (fetchedCompanies.length > 0 && !selectedCompany) {
        setSelectedCompany(fetchedCompanies[0]);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = (company: Company) => {
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
          {selectedCompany ? (
            <>
              <Text style={styles.companyIcon}>🏢</Text>
              <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
                {selectedCompany.name}
              </Text>
              <MaterialIcons name="expand-more" size={18} color={colors.text} />
            </>
          ) : (
            <Text style={[styles.companyName, { color: colors.text }]}>Seleccionar compañía</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedCompany, colors]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {selectedCompany ? (
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Bienvenido a la app de {selectedCompany.name}
        </Text>
      ) : (
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          No hay compañías disponibles
        </Text>
      )}

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
              data={companies}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.optionItem,
                    { borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.border },
                  ]}
                  onPress={() => handleSelectCompany(item)}
                >
                  <Text style={styles.optionIcon}>🏢</Text>
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
