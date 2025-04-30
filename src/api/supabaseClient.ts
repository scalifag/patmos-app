// src/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { Alert } from 'react-native';

const supabaseUrl = 'https://tlybgaoldfjxegkwmxbv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseWJnYW9sZGZqeGVna3dteGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjgwNjcsImV4cCI6MjA2MTYwNDA2N30.lpzYnONfBahIrXMGKSsvFOT1zTp1cNWIap83ZKbi598';

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

      console.log('Realizando fetch a:', url);

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
          console.log('Respuesta recibida status:', response.status);
          return response;
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error('Error en fetch:', error);
          if (error.name === 'AbortError') {
            throw new Error('La petición tomó demasiado tiempo en responder');
          }
          throw error;
        });
    }
  }
});
