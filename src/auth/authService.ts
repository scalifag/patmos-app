// src/auth/authService.ts
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../api/supabaseClient';

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  // Guarda los datos del usuario de forma segura
  await SecureStore.setItemAsync('patmos_user', JSON.stringify({
    email: data.user.email,
    id: data.user.id,
    lastLogin: new Date().toISOString(),
  }));

  return data.user;
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
