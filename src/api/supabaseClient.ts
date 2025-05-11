// src/api/supabaseClient.ts
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleAuthStateChange } from '../auth/authEvents';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

// Simple UUID generator that doesn't rely on crypto
const generateUUID = (): string => {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};

// Create storage for persisting auth sessions
const supabaseStorage = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Configurar el listener de cambios de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  handleAuthStateChange(supabase, event, session);
});

// Generate or get device ID for anonymous usage (as a valid UUID)
const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync('patmos_device_id');
    if (!deviceId || !deviceId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      // Generate a simple UUID
      deviceId = generateUUID();
      await SecureStore.setItemAsync('patmos_device_id', deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID', error);
    // Return a valid UUID as fallback
    return generateUUID();
  }
};

// Helper function to get the current user's ID
export const getCurrentUserId = async (): Promise<string> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    throw error;
  }

  if (!session?.user) {
    console.warn('No session user found');
    throw new Error('No authenticated user');
  }

  return session.user.id;
};
