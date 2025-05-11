import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { 
  testConnection, 
  updateCompany, 
  deleteCompany, 
  getCompanies,
  Company 
} from '@/utils/companyService';
import { RootStackParamList } from '@/navigation';
import { useTheme } from '@/context/ThemeContext';

type EditCompanyScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EditCompany'
>;

type EditCompanyScreenRouteProp = RouteProp<
  RootStackParamList,
  'EditCompany'
>;

export default function EditCompanyScreen() {
  const navigation = useNavigation<EditCompanyScreenNavigationProp>();
  const route = useRoute<EditCompanyScreenRouteProp>();
  const { companyId } = route.params;
  const { colors } = useTheme();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [url, setUrl] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [databaseName, setDatabaseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Cargar datos de la compañía
  useEffect(() => {
    const loadCompanyData = async () => {
      setLoading(true);
      try {
        const companies = await getCompanies();
        const selectedCompany = companies.find(c => c.id === companyId);
        
        if (!selectedCompany) {
          Alert.alert("Error", "No se encontró la compañía");
          navigation.goBack();
          return;
        }
        
        setCompany(selectedCompany);
        setCompanyName(selectedCompany.name);
        setDatabaseName(selectedCompany.databaseName);
        
        // Extraer URL y puerto del serviceLayerUrl
        const urlParts = selectedCompany.serviceLayerUrl.split(':');
        let baseUrl = urlParts[0] + ':' + urlParts[1];
        baseUrl = baseUrl.replace('https://', '').replace('http://', '');
        setUrl(baseUrl);
        
        // El último elemento debe ser el puerto
        setPort(urlParts[urlParts.length - 1]);
        
        // Extraer usuario de credentials (solo mostramos para referencia)
        try {
          const decodedCredentials = atob(selectedCompany.credentials);
          const usernameCompany = decodedCredentials.split(':')[0];
          const usernameOnly = usernameCompany.split(',')[0].trim();
          setUsername(usernameOnly);
          // No mostramos la contraseña por seguridad
          setPassword('');
        } catch (e) {
          console.error('Error decodificando credenciales', e);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Alert.alert("Error", "No se pudieron cargar los datos de la compañía");
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanyData();
  }, [companyId]);

  // Configurar el botón de eliminar en la barra de navegación
  useEffect(() => {
    navigation.setOptions({
      headerBackTitle: '',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.deleteIcon} 
          onPress={company?.isActive ? handleDeleteCompany : handleActivateCompany}
          disabled={deleting || loading}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#e53935" />
          ) : (
            <MaterialIcons 
              name={company?.isActive ? "cloud-off" : "cloud-done"} 
              size={24} 
              color={company?.isActive ? "#e53935" : "#4CAF50"} 
            />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, deleting, loading, company?.isActive]);

  const handleTestAndUpdateConnection = async () => {
    // Validar datos
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const connectionSuccess = await testConnection(
        url,
        port,
        username,
        password || '', // Si no hay contraseña, usar la existente
        databaseName
      );
      
      if (!connectionSuccess) {
        throw new Error('No se pudo establecer la conexión');
      }

      if (!company) return;
      
      // Si la conexión es exitosa, actualizar la compañía
      // Formar la URL completa
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`;
      }
      const serviceLayerUrl = `${fullUrl}:${port}`;
      
      // Crear las nuevas credenciales si se ha actualizado la contraseña
      let credentials = company.credentials;
      if (password) {
        const credentialsString = `${username}, ${databaseName}:${password}`;
        credentials = btoa(credentialsString);
      }
      
      // Crear objeto de compañía actualizado
      const updatedCompany: Company = {
        ...company,
        name: companyName,
        databaseName,
        serviceLayerUrl,
        credentials,
        lastSyncDate: new Date().toISOString()
      };
      
      // Actualizar compañía
      const success = await updateCompany(updatedCompany);
      
      if (success) {
        Alert.alert(
          "Compañía actualizada", 
          "Los datos de sincronización se han actualizado correctamente",
          [{ 
            text: "OK", 
            onPress: () => navigation.goBack()
          }]
        );
      } else {
        throw new Error('No se pudo actualizar la información de la compañía');
      }
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert(
        "Error", 
        `${error.message || 'Error desconocido'}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = () => {
    Alert.alert(
      "Inactivar compañía",
      "¿Está seguro que desea inactivar esta compañía?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Inactivar", 
          style: "destructive",
          onPress: confirmDeleteCompany
        }
      ]
    );
  };

  const handleActivateCompany = () => {
    Alert.alert(
      "Activar compañía",
      "¿Está seguro que desea activar esta compañía?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Activar", 
          style: "default",
          onPress: confirmActivateCompany
        }
      ]
    );
  };

  const confirmActivateCompany = async () => {
    if (!company) return;
    
    setDeleting(true);
    try {
      const updatedCompany = {
        ...company,
        isActive: true,
        lastSyncDate: new Date().toISOString()
      };
      
      const success = await updateCompany(updatedCompany);
      
      if (success) {
        setCompany(updatedCompany);
        Alert.alert(
          "Compañía Activada",
          "La compañía ha sido activada correctamente",
          [{ 
            text: "OK", 
            onPress: () => navigation.goBack()
          }]
        );
      } else {
        throw new Error('No se pudo activar la compañía');
      }
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert(
        "Error",
        `${error.message || 'Error desconocido'}`,
        [{ text: "OK" }]
      );
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteCompany = async () => {
    if (!company) return;
    
    setDeleting(true);
    try {
      const updatedCompany = {
        ...company,
        isActive: false,
        lastSyncDate: new Date().toISOString()
      };
      
      const success = await updateCompany(updatedCompany);
      
      if (success) {
        setCompany(updatedCompany);
        Alert.alert(
          "Compañía Inactivada",
          "La compañía ha sido inactivada correctamente",
          [{ 
            text: "OK", 
            onPress: () => navigation.goBack()
          }]
        );
      } else {
        throw new Error('No se pudo inactivar la compañía');
      }
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert(
        "Error",
        `${error.message || 'Error desconocido'}`,
        [{ text: "OK" }]
      );
    } finally {
      setDeleting(false);
    }
  };

  const validateInputs = () => {
    if (!url || !port || !username || !companyName || !databaseName) {
      Alert.alert(
        "Campos incompletos", 
        "Por favor complete todos los campos obligatorios",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  if (loading && !company) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#841584" />
        <Text style={styles.loadingText}>Cargando datos de la compañía...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="business" size={64} color={colors.primary} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>Editar compañía</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Modifique los datos de la compañía</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Nombre de la compañía</Text>
          <TextInput
            placeholder="Nombre de la compañía"
            value={companyName}
            onChangeText={setCompanyName}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            editable={!loading && !deleting}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Base de datos</Text>
          <TextInput
            placeholder="Base de datos"
            value={databaseName}
            onChangeText={setDatabaseName}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            editable={!loading && !deleting}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>URL del Service Layer</Text>
          <TextInput
            placeholder="b1-service-layer.com"
            value={url}
            onChangeText={setUrl}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            autoCapitalize="none"
            placeholderTextColor={colors.text}
            editable={!loading && !deleting}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Puerto</Text>
          <TextInput
            placeholder="50000"
            value={port}
            onChangeText={setPort}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            keyboardType="number-pad"
            placeholderTextColor={colors.text}
            editable={!loading && !deleting}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Usuario</Text>
          <TextInput
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            autoCapitalize="none"
            placeholderTextColor={colors.text}
            editable={!loading && !deleting}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
          <TextInput
            placeholder="Contraseña (dejar en blanco para mantener la actual)"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            secureTextEntry
            placeholderTextColor={colors.text}
            editable={!loading && !deleting}
          />
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleTestAndUpdateConnection}
            disabled={loading || deleting}
          >
            {loading ? (
              <ActivityIndicator color="white" style={styles.loader} />
            ) : (
              <>
                <MaterialIcons name="save" size={24} color="white" />
                <Text style={styles.buttonText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleDeleteCompany}
            disabled={loading}
          >
            <MaterialIcons name="delete" size={24} color="white" style={styles.deleteIcon} />
            <Text style={styles.buttonText}>Eliminar compañía</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  actionButton: {
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  deleteIcon: {
    marginRight: 16,
    padding: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  loader: {
    marginRight: 8,
  },
}); 