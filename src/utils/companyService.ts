import * as SecureStore from 'expo-secure-store';

export type Company = {
  id: string;
  name: string;
  databaseName: string;
  serviceLayerUrl: string;
  credentials: string; // Base64 encoded
  lastSyncDate: string;
  isActive: boolean;
};

/**
 * Obtiene todas las compañías sincronizadas
 */
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const companiesJson = await SecureStore.getItemAsync('patmos_companies');
    if (!companiesJson) return [];
    return JSON.parse(companiesJson);
  } catch (error) {
    console.error('Error al obtener compañías:', error);
    return [];
  }
};

/**
 * Guarda una nueva compañía
 */
export const saveCompany = async (company: Company): Promise<boolean> => {
  try {
    const companies = await getCompanies();
    companies.push(company);
    await SecureStore.setItemAsync('patmos_companies', JSON.stringify(companies));
    return true;
  } catch (error) {
    console.error('Error al guardar compañía:', error);
    return false;
  }
};

/**
 * Actualiza una compañía existente
 */
export const updateCompany = async (company: Company): Promise<boolean> => {
  try {
    const companies = await getCompanies();
    const index = companies.findIndex(c => c.id === company.id);
    
    if (index === -1) return false;
    
    companies[index] = company;
    await SecureStore.setItemAsync('patmos_companies', JSON.stringify(companies));
    return true;
  } catch (error) {
    console.error('Error al actualizar compañía:', error);
    return false;
  }
};

/**
 * Elimina una compañía
 */
export const deleteCompany = async (companyId: string): Promise<boolean> => {
  try {
    const companies = await getCompanies();
    const filteredCompanies = companies.filter(c => c.id !== companyId);
    
    if (companies.length === filteredCompanies.length) return false;
    
    await SecureStore.setItemAsync('patmos_companies', JSON.stringify(filteredCompanies));
    return true;
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
    id: Date.now().toString(),
    name,
    databaseName,
    serviceLayerUrl,
    credentials: encodedCredentials,
    lastSyncDate: new Date().toISOString(),
    isActive: true
  };
}; 