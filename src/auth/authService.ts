// src/auth/authService.ts
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../api/supabaseClient';

export const login = async (email: string, password: string) => {
  try {
    console.log('Iniciando petición de login a Supabase...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error de Supabase:', error);
      throw new Error(`Error de autenticación: ${error.message}`);
    }

    if (!data || !data.user) {
      console.error('Respuesta sin datos de usuario');
      throw new Error('No se obtuvo información del usuario');
    }

    console.log('Login exitoso, guardando información del usuario');
    
    // Guarda los datos del usuario de forma segura
    await SecureStore.setItemAsync('patmos_user', JSON.stringify({
      email: data.user.email,
      id: data.user.id,
      lastLogin: new Date().toISOString(),
    }));

    return data.user;
  } catch (error) {
    console.error('Error en proceso de login:', error);
    // Re-lanzamos el error para que pueda ser manejado por el componente
    throw error;
  }
};

export const logout = async () => {
  await supabase.auth.signOut();
  await SecureStore.deleteItemAsync('patmos_user');
};

export const getStoredUser = async () => {
  const stored = await SecureStore.getItemAsync('patmos_user');
  return stored ? JSON.parse(stored) : null;
};

export const isUserLoggedInOffline = async () => {
  const stored = await getStoredUser();
  return !!stored;
};

export const signUp = async (email: string, password: string) => {
  try {
    console.log('Iniciando registro de usuario en Supabase...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error en registro:', error);
      throw new Error(`Error al registrarse: ${error.message}`);
    }

    if (!data || !data.user) {
      console.error('Respuesta sin datos de usuario');
      throw new Error('No se pudo completar el registro');
    }

    console.log('¿Confirmación de email requerida?', data.session === null);
    
    // Si data.session es null, significa que el usuario debe confirmar su email
    if (data.session === null) {
      return {
        user: data.user,
        message: 'Por favor, confirma tu correo electrónico para completar el registro.'
      };
    }

    // Si llegamos aquí, el usuario fue registrado sin necesidad de confirmación
    // Guardamos la sesión
    await SecureStore.setItemAsync('patmos_user', JSON.stringify({
      email: data.user.email,
      id: data.user.id,
      lastLogin: new Date().toISOString(),
    }));

    return { 
      user: data.user,
      message: 'Registro exitoso'
    };
  } catch (error) {
    console.error('Error en proceso de registro:', error);
    throw error;
  }
};

