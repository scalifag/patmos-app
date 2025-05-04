// src/auth/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  Text, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  Switch
} from 'react-native';
import { isUserLoggedInOffline } from '@/auth/authService';
import { supabase } from '@/api/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constantes para el almacenamiento
const SAVED_EMAIL_KEY = 'patmos_saved_email';
const REMEMBER_USER_KEY = 'patmos_remember_user';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [networkOk, setNetworkOk] = useState<boolean | null>(null);
  const [rememberUser, setRememberUser] = useState(false);

  useEffect(() => {
    checkOfflineLogin();
    checkNetwork();
    loadSavedEmail();
  }, []);

  const loadSavedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
      const shouldRemember = await AsyncStorage.getItem(REMEMBER_USER_KEY);
      
      if (savedEmail) {
        setEmail(savedEmail);
      }
      
      if (shouldRemember === 'true') {
        setRememberUser(true);
      }
    } catch (error) {
      console.error('Error al cargar el correo guardado:', error);
    }
  };

  const saveEmailPreference = async () => {
    try {
      if (rememberUser && email) {
        await AsyncStorage.setItem(SAVED_EMAIL_KEY, email);
        await AsyncStorage.setItem(REMEMBER_USER_KEY, 'true');
      } else {
        // Si el usuario desactiva "recordar", eliminamos los datos guardados
        await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
        await AsyncStorage.setItem(REMEMBER_USER_KEY, 'false');
      }
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
    }
  };

  const checkOfflineLogin = async () => {
    try {
      const loggedIn = await isUserLoggedInOffline();
      if (loggedIn) {
        Alert.alert('Modo sin conexión', 'Ingresando con sesión guardada');
        navigation.replace('Settings');
      }
    } catch (error) {
      console.error('Error comprobando sesión guardada:', error);
    }
  };

  const checkNetwork = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      setNetworkOk(response.ok);
    } catch (error) {
      console.log('Error de red:', error);
      setNetworkOk(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Por favor, ingresa correo y contraseña');
      return;
    }

    if (!networkOk) {
      Alert.alert(
        'Sin conexión a internet',
        'Parece que no tienes conexión a internet. ¿Quieres intentar iniciar sesión de todos modos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Intentar', onPress: () => performLogin() },
        ]
      );
    } else {
      performLogin();
    }
  };

  const performLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      // Guardar preferencia de email antes de iniciar sesión
      await saveEmailPreference();
      
      // Usando directamente supabase aquí para evitar capas adicionales que podrían fallar
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data && data.user) {
        // Guardamos en el servicio
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        navigation.replace('Settings');
      }
    } catch (error: any) {
      console.error('Error de inicio de sesión:', error);
      
      if (error.message.includes('network')) {
        setErrorMessage('Error de conexión. Verifica tu internet.');
      } else if (error.message.includes('Invalid login')) {
        setErrorMessage('Correo o contraseña incorrectos');
      } else {
        setErrorMessage(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Patmos App</Text>
          
          {networkOk === false && (
            <View style={styles.networkWarning}>
              <Text style={styles.networkWarningText}>
                ⚠️ Sin conexión a internet
              </Text>
            </View>
          )}

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          
          <TextInput 
            placeholder="Correo electrónico" 
            value={email} 
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          
          <TextInput 
            placeholder="Contraseña" 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword}
            style={styles.input}
            editable={!loading}
          />
          
          <View style={styles.rememberContainer}>
            <Switch
              value={rememberUser}
              onValueChange={setRememberUser}
              trackColor={{ false: '#d0d0d0', true: '#a06ba5' }}
              thumbColor={rememberUser ? '#841584' : '#f4f3f4'}
            />
            <Text style={styles.rememberText}>Recordar usuario</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#841584" style={styles.loader} />
          ) : (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.registerContainer}>
            <Text>¿No tienes una cuenta? </Text>
            <Text 
              style={styles.registerLink}
              onPress={() => navigation.replace('Register')}
            >
              Regístrate
            </Text>
          </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
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
  loginButton: {
    backgroundColor: '#841584',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerLink: {
    color: '#841584',
    fontWeight: 'bold',
  },
  networkWarning: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    alignItems: 'center',
  },
  networkWarningText: {
    color: '#856404',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  }
});