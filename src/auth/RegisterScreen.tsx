import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { signUp } from '@/auth/authService';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    
    // Validaciones básicas
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio');
      return;
    }
    
    if (!password.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await signUp(email, password);
      
      // Mostramos mensaje según el resultado
      Alert.alert(
        'Registro exitoso', 
        result.message,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
      
    } catch (error: any) {
      setError(`Error: ${error.message}`);
      console.error('Error durante el registro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={[styles.title, { color: colors.text }]}>Crear cuenta</Text>
          
          {error ? <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text> : null}
          
          <TextInput
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            keyboardType="email-address"
            autoCapitalize="none"
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
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[styles.input, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholderTextColor={colors.text}
            secureTextEntry
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" style={styles.loader} />
            ) : (
              <Text style={styles.registerButtonText}>Registrarse</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.loginLink}>
            <Text style={{ color: colors.text }}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, { color: colors.primary }]}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  registerButton: {
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    marginBottom: 15,
    textAlign: 'center',
    padding: 10,
    borderRadius: 4,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  linkText: {
    fontWeight: 'bold',
  }
}); 