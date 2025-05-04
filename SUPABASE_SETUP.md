# Configuración de Supabase para Patmos App

Este documento proporciona instrucciones para configurar Supabase como base de datos para la aplicación Patmos.

## 1. Configuración de Supabase

### Crear una cuenta y un nuevo proyecto

1. Regístrate o inicia sesión en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Toma nota de la URL y la clave anónima (anon key) que se encuentran en Configuración > API

### Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
# Supabase Configuration
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# EAS (opcional)
EAS_PROJECT_ID=tu_id_de_proyecto_eas
```

## 2. Estructura de la base de datos

La aplicación utiliza una tabla `companies` para almacenar la información de las compañías. La estructura de la tabla se ha diseñado con Row Level Security (RLS) para asegurar que cada usuario solo pueda acceder a sus propias compañías.

### Script SQL

Ejecuta el siguiente script SQL en el Editor SQL de Supabase:

```sql
-- Create a table for companies with RLS (Row Level Security)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  database_name TEXT NOT NULL,
  service_layer_url TEXT NOT NULL,
  credentials TEXT NOT NULL, -- Base64 encoded
  last_sync_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS companies_user_id_idx ON companies(user_id);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select only their own companies
CREATE POLICY "Users can view their own companies" 
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own companies
CREATE POLICY "Users can insert their own companies" 
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own companies
CREATE POLICY "Users can update their own companies" 
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own companies
CREATE POLICY "Users can delete their own companies" 
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before update
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 3. Autenticación de usuarios

Asegúrate de habilitar el proveedor de autenticación que desees utilizar en Supabase (Email, Google, GitHub, etc.) desde el panel de Autenticación.

## 4. Resumen del flujo de datos

1. Los usuarios se autentican en la aplicación usando Supabase Auth
2. La aplicación almacena los datos de las compañías en Supabase
3. La aplicación también almacena una copia local de los datos en SecureStore para acceso offline
4. Cuando se realizan cambios, primero se actualizan en Supabase y luego en SecureStore
5. Si hay problemas de conectividad, la aplicación utiliza los datos de SecureStore como respaldo 