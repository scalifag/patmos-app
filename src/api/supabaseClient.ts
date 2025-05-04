// src/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
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
