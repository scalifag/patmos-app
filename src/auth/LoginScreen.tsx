// src/auth/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { login, isUserLoggedInOffline } from './authService';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    (async () => {
      const loggedIn = await isUserLoggedInOffline();
      if (loggedIn) {
        Alert.alert('Modo sin conexión', 'Ingresando con sesión guardada');
        navigation.replace('Settings');
      }
    })();
  }, []);

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert('Éxito', 'Sesión iniciada');
      navigation.replace('Settings');
    } catch (error: any) {
      Alert.alert('Error de login', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Iniciar sesión" onPress={handleLogin} />
    </View>
  );
}
