import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import { signUp } from './authService';

export default function RegisterScreen({ navigation }: any) {
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
    <View style={styles.container}>
      <Text style={styles.title}>Crear nueva cuenta</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <TextInput
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <Button
        title={loading ? "Registrando..." : "Registrarse"}
        onPress={handleRegister}
        disabled={loading}
      />
      
      <View style={styles.loginLink}>
        <Text>¿Ya tienes una cuenta? </Text>
        <Text 
          style={styles.linkText}
          onPress={() => navigation.navigate('Login')}
        >
          Iniciar sesión
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  }
}); 