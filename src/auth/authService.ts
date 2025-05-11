// src/auth/authService.ts
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../api/supabaseClient';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { updateCompanyUserRecord } from './authEvents';

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

    // Actualizar el registro de company_users si existe
    await updateCompanyUserRecord(supabase, data.user);

    return data.user;
  } catch (error) {
    console.error('Error en proceso de login:', error);
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
    
    if (data.session === null) {
      return {
        user: data.user,
        message: 'Por favor, confirma tu correo electrónico para completar el registro.'
      };
    }

    await SecureStore.setItemAsync('patmos_user', JSON.stringify({
      email: data.user.email,
      id: data.user.id,
      lastLogin: new Date().toISOString(),
    }));

    await updateCompanyUserRecord(supabase, data.user);

    return { 
      user: data.user,
      message: 'Registro exitoso'
    };
  } catch (error) {
    console.error('Error en proceso de registro:', error);
    throw error;
  }
};

// Función para solicitar el restablecimiento de contraseña
export const requestPasswordReset = async (email: string) => {
  try {
    const redirectUrl = 'exp://192.168.100.251:8081';
    console.log('redirectUrl', redirectUrl);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico.'
    };
  } catch (error: any) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    throw new Error(error.message || 'Error al solicitar el restablecimiento de contraseña');
  }
};

// Función para actualizar la contraseña
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente'
    };
  } catch (error: any) {
    console.error('Error al actualizar contraseña:', error);
    throw new Error(error.message || 'Error al actualizar la contraseña');
  }
};

export async function setSupabaseSession(access_token: string) {
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token: access_token,
  });
  if (error) throw error;
}

