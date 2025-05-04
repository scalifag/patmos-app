// src/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create the Supabase client with custom storage
/*
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: supabaseStorage,
  },
  global: {
    fetch: (url, options) => {
      // Añadimos timeout para evitar esperas indefinidas
      const timeout = 15000; // 15 segundos de timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      //console.log('Realizando fetch a:', url);

      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options?.headers,
          'Content-Type': 'application/json'
        },
      })
        .then(response => {
          clearTimeout(timeoutId);
          //console.log('Respuesta recibida status:', response.status);
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);
          //console.error('Error en fetch:', error);
          if (error.name === 'AbortError') {
            throw new Error('La petición tomó demasiado tiempo en responder');
          }
          throw error;
        });
    }
  }
});
*/
// Authenticate with Supabase as an anonymous user if not already authenticated
export const ensureAuthenticated = async (): Promise<boolean> => {
  try {
    // Check if already authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      console.log('User already authenticated with Supabase');
      return true;
    }
    
    // Try anonymous sign-in
    console.log('Attempting anonymous sign-in with Supabase');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: process.env.EXPO_PUBLIC_SUPABASE_ANON_EMAIL || 'anonymous@example.com',
      password: process.env.EXPO_PUBLIC_SUPABASE_ANON_PASSWORD || 'anonymous',
    });
    
    if (error) {
      console.error('Failed to sign in anonymously:', error);
      return false;
    }
    
    console.log('Successfully signed in anonymously with Supabase');
    return true;
  } catch (error) {
    console.error('Error ensuring authentication:', error);
    return false;
  }
};

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
