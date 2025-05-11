import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import * as Linking from 'expo-linking';
import { requestPasswordReset, updatePassword, setSupabaseSession } from './authService';

export default function ResetPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      try {
        const url = event.url;
        const params = new URLSearchParams(url.split('?')[1]);
        const token = params.get('access_token');
        if (token) {
          setAccessToken(token);
          setStep('reset');
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Add event listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const signInWithToken = async () => {
      if (accessToken) {
        setLoading(true);
        try {
          await setSupabaseSession(accessToken);
        } catch (error: any) {
          Alert.alert('Error', 'No se pudo establecer sesión con el enlace. Intenta nuevamente.');
          setStep('request');
        } finally {
          setLoading(false);
        }
      }
    };
    signInWithToken();
  }, [accessToken]);

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      Alert.alert(
        'Éxito',
        'Se ha enviado un enlace de restablecimiento a tu correo electrónico.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      Alert.alert(
        'Éxito',
        'Tu contraseña ha sido actualizada exitosamente',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
          <Text style={styles.title}>
            {step === 'request' ? 'Restablecer Contraseña' : 'Nueva Contraseña'}
          </Text>

          {step === 'request' ? (
            <>
              <Text style={styles.description}>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleRequestReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Enviar enlace</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                Ingresa tu nueva contraseña.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Actualizar contraseña</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Volver</Text>
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
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
  button: {
    backgroundColor: '#841584',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#841584',
    fontSize: 16,
    textAlign: 'center',
  },
});
