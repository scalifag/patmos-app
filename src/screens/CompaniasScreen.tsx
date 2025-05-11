import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getCompanies, Company } from '@/utils/companyService';
import { RootStackParamList } from '@/navigation';
import { useTheme } from '@/context/ThemeContext';

type CompaniasScreenNavigationProp = StackNavigationProp<
  RootStackParamList
>;

export default function CompaniasScreen() {
  const navigation = useNavigation<CompaniasScreenNavigationProp>();
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleSyncNewCompany = () => {
    // Navegar a la pantalla de sincronización de compañía
    navigation.navigate('SyncCompany');
  };

  // Configuramos el botón de sincronización en el header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: '',
      headerRight: () => (
        <TouchableOpacity 
          onPress={handleSyncNewCompany} 
          style={styles.headerButton}
        >
          <MaterialIcons name="add" size={25} color="#841584" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Cargamos las compañías
  useEffect(() => {
    if (isFocused) {
      fetchCompanies();
    }
  }, [isFocused]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      // Obtener las compañías guardadas
      const savedCompanies = await getCompanies();
      
      // Simulando un retraso de red
      setTimeout(() => {
        setCompanies(savedCompanies);
        setLoading(false);
        setRefreshing(false);
      }, 800);
      
    } catch (error) {
      console.error('Error al cargar compañías:', error);
      Alert.alert('Error', 'No se pudieron cargar las compañías');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCompanies();
  };

  const handleCompanyPress = (company: Company) => {
    // Navegar a la pantalla de edición de la compañía
    navigation.navigate('EditCompany', { companyId: company.id });
  };

  const renderCompanyItem = ({ item }: { item: Company }) => {
    const formattedDate = new Date(item.lastSyncDate).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <TouchableOpacity 
        style={[styles.companyItem, { backgroundColor: colors.card }]} 
        onPress={() => handleCompanyPress(item)}
      >
        <View style={[styles.companyIconContainer, { backgroundColor: colors.background }]}>
          <MaterialIcons 
            name="business" 
            size={28} 
            color={item.isActive ? "#4CAF50" : "#9E9E9E"} 
          />
        </View>
        
        <View style={styles.companyInfo}>
          <Text style={[styles.companyName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.companyDetail, { color: colors.text }]}>Base de datos: {item.databaseName}</Text>
          <Text style={[styles.companyDetail, { color: colors.text }]}>
            Última sincronización: {formattedDate}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { 
            backgroundColor: item.isActive ? '#4CAF50' : '#9E9E9E' 
          }]} />
          <MaterialIcons name="chevron-right" size={24} color={colors.text} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Cargando compañías...</Text>
        </View>
      ) : (
        <FlatList
          data={companies}
          renderItem={renderCompanyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="business-center" size={64} color={colors.text} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No hay compañías sincronizadas</Text>
              <Text style={[styles.emptySubtext, { color: colors.text }]}>
                Sincronice una compañía para comenzar
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  companyItem: {
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  companyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 14,
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  headerButton: {
    marginRight: 16,
  }
}); 