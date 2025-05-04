import * as SecureStore from 'expo-secure-store';
import { supabase, getCurrentUserId } from '@/api/supabaseClient';

export type Company = {
  id: string;
  name: string;
  databaseName: string;
  serviceLayerUrl: string;
  credentials: string; // Base64 encoded
  lastSyncDate: string;
  isActive: boolean;
};

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

/**
 * Obtiene todas las compañías sincronizadas desde Supabase y SecureStore
 */
export const getCompanies = async (): Promise<Company[]> => {
  try {
    let companies: Company[] = [];
    let supabaseFetched = false;
    
    // Siempre intentar primero con Supabase
    try {
      // Get user ID after ensuring authentication
      const userId = await getCurrentUserId();
      console.log('Fetching companies from Supabase with user ID:', userId);
      
      const { data: supabaseCompanies, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching companies from Supabase:', error);
      } else if (supabaseCompanies && supabaseCompanies.length > 0) {
        console.log(`Found ${supabaseCompanies.length} companies in Supabase`);
        
        // Convert Supabase companies to the application format
        companies = supabaseCompanies.map(c => ({
          id: c.id,
          name: c.name,
          databaseName: c.database_name,
          serviceLayerUrl: c.service_layer_url,
          credentials: c.credentials,
          lastSyncDate: c.last_sync_date,
          isActive: c.is_active
        }));

        // Update the local storage with data from Supabase
        await SecureStore.setItemAsync('patmos_companies', JSON.stringify(companies));
        supabaseFetched = true;
        console.log('Updated local storage with data from Supabase');
      } else {
        console.log('No companies found in Supabase');
      }
    } catch (supabaseError) {
      console.error('Exception when fetching from Supabase:', supabaseError);
    }
    
    // Solo usar almacenamiento local si Supabase no devolvió compañías
    if (!supabaseFetched) {
      console.log('Using local storage since Supabase fetch didn\'t return companies');
      const companiesJson = await SecureStore.getItemAsync('patmos_companies');
      
      if (companiesJson) {
        try {
          companies = JSON.parse(companiesJson);
          console.log(`Found ${companies.length} companies in local storage`);
        } catch (parseError) {
          console.error('Error parsing companies from SecureStore:', parseError);
          companies = [];
        }
      } else {
        console.log('No companies found in local storage');
      }
    }
    
    return companies;
  } catch (error) {
    console.error('Error al obtener compañías:', error);
    
    // Final fallback to SecureStore
    try {
      const companiesJson = await SecureStore.getItemAsync('patmos_companies');
      if (!companiesJson) return [];
      
      const companies = JSON.parse(companiesJson);
      return companies;
    } catch (parseError) {
      console.error('Error in final fallback:', parseError);
      return [];
    }
  }
};

/**
 * Guarda una nueva compañía en Supabase y SecureStore
 */
export const saveCompany = async (company: Company): Promise<boolean> => {
  try {
    // Ensure company has a UUID
    if (!company.id || !company.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      company.id = generateUUID();
    }

    // Get user ID after authentication
    const userId = await getCurrentUserId();
    let supabaseSuccess = false;
    
    // Siempre intentar guardar en Supabase primero
    try {
      console.log('Saving company to Supabase first');
      
      const { error } = await supabase
        .from('companies')
        .insert({
          user_id: userId,
          name: company.name,
          database_name: company.databaseName,
          service_layer_url: company.serviceLayerUrl,
          credentials: company.credentials,
          last_sync_date: company.lastSyncDate,
          is_active: company.isActive
        });

      if (error) {
        console.error('Error saving company to Supabase:', error);
      } else {
        console.log('Company saved to Supabase successfully');
        supabaseSuccess = true;
      }
    } catch (supabaseError) {
      console.error('Exception saving to Supabase:', supabaseError);
    }

    // Always save to local storage as backup
    try {
      console.log('Saving company to local storage');
      const existingCompaniesJson = await SecureStore.getItemAsync('patmos_companies');
      let companies: Company[] = [];
      
      if (existingCompaniesJson) {
        try {
          companies = JSON.parse(existingCompaniesJson);
          
          // Check if company already exists by ID
          const existingIndex = companies.findIndex((c: Company) => c.id === company.id);
          if (existingIndex >= 0) {
            // Update existing company instead of adding duplicate
            companies[existingIndex] = company;
          } else {
            // Add new company
            companies.push(company);
          }
        } catch (parseError) {
          console.error('Error parsing existing companies:', parseError);
          companies = [company]; // Reset if parsing fails
        }
      } else {
        // No existing companies, just add this one
        companies = [company];
      }
      
      await SecureStore.setItemAsync('patmos_companies', JSON.stringify(companies));
      console.log('Company saved to local storage successfully');
      
      return true;
    } catch (storageError) {
      console.error('Error saving to local storage:', storageError);
      
      // If Supabase succeeded but local storage failed, still consider it a success
      return supabaseSuccess;
    }
  } catch (error) {
    console.error('Error al guardar compañía:', error);
    return false;
  }
};

/**
 * Actualiza una compañía existente en Supabase y SecureStore
 */
export const updateCompany = async (company: Company): Promise<boolean> => {
  try {
    // Get user ID after ensuring authentication
    const userId = await getCurrentUserId();
    let supabaseSuccess = false;
    
    // Siempre intentar actualizar en Supabase primero
    try {
      console.log('Updating company in Supabase first with user ID:', userId);
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: company.name,
          database_name: company.databaseName,
          service_layer_url: company.serviceLayerUrl,
          credentials: company.credentials,
          last_sync_date: company.lastSyncDate,
          is_active: company.isActive
        })
        .eq('id', company.id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating company in Supabase:', error);
      } else {
        console.log('Company updated in Supabase successfully');
        supabaseSuccess = true;
      }
    } catch (supabaseError) {
      console.error('Exception updating in Supabase:', supabaseError);
    }

    // Always update in local storage as backup
    try {
      console.log('Updating company in local storage');
      const companiesJson = await SecureStore.getItemAsync('patmos_companies');
      if (!companiesJson) {
        console.log('No companies found in local storage to update');
        // If Supabase update was successful, we consider the operation successful
        return supabaseSuccess;
      }
      
      const companies = JSON.parse(companiesJson);
      const index = companies.findIndex((c: Company) => c.id === company.id);
      
      if (index === -1) {
        console.log('Company not found in local storage');
        // If not found in local storage but updated in Supabase, add it to local storage
        if (supabaseSuccess) {
          companies.push(company);
          await SecureStore.setItemAsync('patmos_companies', JSON.stringify(companies));
          console.log('Added company to local storage after Supabase update');
          return true;
        }
        return false;
      }
      
      companies[index] = company;
      await SecureStore.setItemAsync('patmos_companies', JSON.stringify(companies));
      console.log('Company updated in local storage successfully');
      
      return true;
    } catch (storageError) {
      console.error('Error updating in local storage:', storageError);
      // If Supabase succeeded but local storage failed, still consider it a success
      return supabaseSuccess;
    }
  } catch (error) {
    console.error('Error al actualizar compañía:', error);
    return false;
  }
};

/**
 * Elimina una compañía de Supabase y SecureStore (soft delete)
 */
export const deleteCompany = async (companyId: string): Promise<boolean> => {
  try {
    // Get user ID after ensuring authentication
    const userId = await getCurrentUserId();
    let supabaseSuccess = false;
    
    // Siempre intentar eliminar en Supabase primero
    try {
      console.log('Soft-deleting company in Supabase first with user ID:', userId);
      
      const { error } = await supabase
        .from('companies')
        .update({ is_active: false })
        .eq('id', companyId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting company from Supabase:', error);
      } else {
        console.log('Company soft-deleted in Supabase successfully');
        supabaseSuccess = true;
      }
    } catch (supabaseError) {
      console.error('Exception deleting from Supabase:', supabaseError);
    }

    // Always update local storage as backup
    try {
      console.log('Removing company from local storage');
      const companiesJson = await SecureStore.getItemAsync('patmos_companies');
      if (!companiesJson) {
        console.log('No companies found in local storage to delete');
        // If Supabase delete was successful, we consider the operation successful
        return supabaseSuccess;
      }
      
      const companies = JSON.parse(companiesJson);
      const filteredCompanies = companies.filter((c: Company) => c.id !== companyId);
      
      if (companies.length === filteredCompanies.length) {
        console.log('Company not found in local storage');
        // If not found in local but deleted in Supabase, that's considered success
        return supabaseSuccess;
      }
      
      await SecureStore.setItemAsync('patmos_companies', JSON.stringify(filteredCompanies));
      console.log('Company removed from local storage successfully');
      
      return true;
    } catch (storageError) {
      console.error('Error deleting from local storage:', storageError);
      // If Supabase succeeded but local storage failed, still consider it a success
      return supabaseSuccess;
    }
  } catch (error) {
    console.error('Error al eliminar compañía:', error);
    return false;
  }
};

/**
 * Genera las cabeceras de autenticación para las peticiones a Service Layer
 */
export const getAuthHeaders = (company: Company): Headers => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Basic ${company.credentials}`);
  return headers;
};

/**
 * Prueba la conexión con SAP Business One
 */
export const testConnection = async (
  url: string,
  port: string,
  username: string,
  password: string,
  companyDB: string
): Promise<boolean> => {
  try {
    // Formar la URL completa
    let fullUrl = url.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`;
    }
    fullUrl = `${fullUrl}:${port}`;
    
    // Intentar conectarse a Service Layer
    const response = await fetch(`${fullUrl}/b1s/v1/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CompanyDB: companyDB,
        UserName: username,
        Password: password
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error al probar conexión:', error);
    return false;
  }
};

/**
 * Crea una nueva instancia de compañía
 */
export const createCompanyData = (
  name: string, 
  databaseName: string, 
  serviceLayerUrl: string, 
  username: string,
  password: string
): Company => {
  // Crear credenciales en formato "{username, company}:password"
  const credentials = `${username}, ${databaseName}:${password}`;
  // Codificar en base64
  const encodedCredentials = btoa(credentials);
  
  return {
    id: generateUUID(),
    name,
    databaseName,
    serviceLayerUrl,
    credentials: encodedCredentials,
    lastSyncDate: new Date().toISOString(),
    isActive: true
  };
}; 