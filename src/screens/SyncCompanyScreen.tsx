import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { testConnection, createCompanyData, saveCompany } from '@/utils/companyService';

export default function SyncCompanyScreen() {
  const navigation = useNavigation();
  const [url, setUrl] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTestAndSaveConnection = async () => {
    // Validar datos
    if (!validateInputs()) return;

    setLoading(true);
    try {
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
      // Formar la URL completa
      let fullUrl = url.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`;
      }
      const serviceLayerUrl = `${fullUrl}:${port}`;
      
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="business" size={64} color="#841584" />
          </View>
          
          <Text style={styles.title}>Sincronizar nueva compañía</Text>
          <Text style={styles.subtitle}>Ingrese los datos de conexión a SAP Business One</Text>
          
          <TextInput
            placeholder="b1-service-layer.com"
            value={url}
            onChangeText={setUrl}
            style={styles.input}
            autoCapitalize="none"
            editable={!loading}
          />
          
          <TextInput
            placeholder="50000"
            value={port}
            onChangeText={setPort}
            style={styles.input}
            keyboardType="number-pad"
            editable={!loading}
          />
          
          <TextInput
            placeholder="manager"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            editable={!loading}
          />
          
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            editable={!loading}
          />
          
          <TextInput
            placeholder="Compañía (base de datos)"
            value={company}
            onChangeText={setCompany}
            style={styles.input}
            editable={!loading}
          />
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleTestAndSaveConnection}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="white" />
                <Text style={styles.buttonText}>Probar y guardar</Text>
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
    backgroundColor: '#f8f8f8',
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
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#841584',
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
}); 