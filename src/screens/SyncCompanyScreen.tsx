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
  SafeAreaView,
  Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { testConnection, createCompanyData, saveCompany, checkCompanyExists } from '@/utils/companyService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';

// Valores predeterminados para desarrollo
const DEV_VALUES = {
  url: 'netsuite.tecnicaelectromedica.co',
  port: '61059',
  username: 'manager',
  company: 'TEM_PROD1'
};

// Claves para almacenamiento
const DEV_MODE_KEY = 'patmos_dev_mode_enabled';
const LAST_CONNECTION_KEY = 'patmos_last_connection';

export default function SyncCompanyScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [url, setUrl] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [savedValuesExist, setSavedValuesExist] = useState(false);

  useEffect(() => {
    loadDevModeStatus();
    checkForSavedValues();
    navigation.setOptions({
      headerBackTitle: '', // Eliminar el texto del botón de retroceso
      // ... otras opciones si es necesario ...
    });
  }, []);

  // Carga el estado del modo de desarrollo
  const loadDevModeStatus = async () => {
    try {
      const savedDevMode = await AsyncStorage.getItem(DEV_MODE_KEY);
      if (savedDevMode === 'true') {
        setDevMode(true);
        // Si el modo dev está activado, cargamos los valores predeterminados
        setDevValues();
      }
    } catch (error) {
      console.error('Error al cargar el estado del modo de desarrollo:', error);
    }
  };

  // Verifica si hay valores guardados de la última conexión
  const checkForSavedValues = async () => {
    try {
      const savedConnection = await AsyncStorage.getItem(LAST_CONNECTION_KEY);
      if (savedConnection) {
        setSavedValuesExist(true);
      }
    } catch (error) {
      console.error('Error al verificar valores guardados:', error);
    }
  };

  // Establece los valores de desarrollo predeterminados
  const setDevValues = () => {
    setUrl(DEV_VALUES.url);
    setPort(DEV_VALUES.port);
    setUsername(DEV_VALUES.username);
    setCompany(DEV_VALUES.company);
  };

  // Guarda o carga la última conexión exitosa
  const handleLastConnection = async (action: 'save' | 'load') => {
    try {
      if (action === 'save') {
        const connectionData = {
          url,
          port,
          username,
          password,
          company
        };
        await AsyncStorage.setItem(LAST_CONNECTION_KEY, JSON.stringify(connectionData));
        setSavedValuesExist(true);
      } else if (action === 'load') {
        const savedConnection = await AsyncStorage.getItem(LAST_CONNECTION_KEY);
        if (savedConnection) {
          const data = JSON.parse(savedConnection);
          setUrl(data.url);
          setPort(data.port);
          setUsername(data.username);
          setPassword(data.password);
          setCompany(data.company);
        }
      }
    } catch (error) {
      console.error('Error con la última conexión:', error);
    }
  };

  // Cambia el estado del modo de desarrollo
  const toggleDevMode = async (value: boolean) => {
    setDevMode(value);
    try {
      await AsyncStorage.setItem(DEV_MODE_KEY, value ? 'true' : 'false');
      if (value) {
        setDevValues();
      }
    } catch (error) {
      console.error('Error al guardar el estado del modo de desarrollo:', error);
    }
  };

  const handleTestAndSaveConnection = async () => {
    // Validar datos
    if (!validateInputs()) return;

    setLoading(true);
    try {
      // Formar la URL completa para validación
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`;
      }
      const serviceLayerUrl = `${fullUrl}:${port}`;

      // Verificar si ya existe una compañía con los mismos datos
      const exists = await checkCompanyExists(serviceLayerUrl, company);
      if (exists) {
        throw new Error('No puede crear una nueva compañia, comniquese con nosotros.');
      }

      const connectionSuccess = await testConnection(
        url,
        port,
        username,
        password,
        company
      );
      
      if (!connectionSuccess) {
        throw new Error('No se pudo establecer la conexión');
      }

      // Si la conexión es exitosa, continuar con guardar
      // Crear objeto de compañía
      const companyData = createCompanyData(
        company, // Nombre de la compañía
        company, // Base de datos (mismo nombre)
        serviceLayerUrl,
        username,
        password
      );
      
      // Guardar compañía
      const success = await saveCompany(companyData);
      
      if (success) {
        // Si la conexión fue exitosa, guardamos los valores
        await handleLastConnection('save');
        
        Alert.alert(
          "Compañía sincronizada", 
          "La compañía se ha sincronizado correctamente",
          [{ 
            text: "OK", 
            onPress: () => navigation.goBack()
          }]
        );
      } else {
        throw new Error('No se pudo guardar la información de la compañía');
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

  const validateInputs = () => {
    if (!url || !port || !username || !password || !company) {
      Alert.alert(
        "Campos incompletos", 
        "Por favor complete todos los campos",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

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
          
          <Text style={[styles.title, { color: colors.text }]}>Sincronizar nueva compañía</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Ingrese los datos de conexión a SAP Business One</Text>
          
          <View style={[styles.optionsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.optionRow}>
              <Text style={[styles.optionText, { color: colors.text }]}>Modo de desarrollo</Text>
              <Switch
                value={devMode}
                onValueChange={toggleDevMode}
                trackColor={{ false: colors.border, true: colors.secondary }}
                thumbColor={devMode ? colors.primary : '#f4f3f4'}
              />
            </View>
            
            {savedValuesExist && (
              <TouchableOpacity 
                style={styles.lastConnectionButton}
                onPress={() => handleLastConnection('load')}
              >
                <MaterialIcons name="restore" size={16} color={colors.primary} />
                <Text style={[styles.lastConnectionText, { color: colors.primary }]}>Cargar última conexión exitosa</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TextInput
            placeholder="URL del servidor"
            value={url}
            onChangeText={setUrl}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            editable={!loading}
          />
          
          <TextInput
            placeholder="Puerto"
            value={port}
            onChangeText={setPort}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            keyboardType="numeric"
            editable={!loading}
          />
          
          <TextInput
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            editable={!loading}
          />
          
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            secureTextEntry
            editable={!loading}
          />
          
          <TextInput
            placeholder="Compañía"
            value={company}
            onChangeText={setCompany}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleTestAndSaveConnection}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" style={styles.loader} />
            ) : (
              <>
                <MaterialIcons name="sync" size={24} color="white" />
                <Text style={styles.buttonText}>Sincronizar</Text>
              </>
            )}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
  },
  lastConnectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  lastConnectionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loader: {
    marginRight: 8,
  },
});