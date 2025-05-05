#!/bin/bash

# Lista de los nombres de los archivos
screens=("PerfilScreen" "SincronizacionScreen" "ArticulosScreen" "ClientesScreen" "AlmacenesScreen" "UsuariosScreen" "ListasPreciosScreen" "SeriesNumeracionScreen" "DocumentosScreen" "PersonalizarListViewScreen" "FlujosAutorizacionScreen")

# Crear los archivos .tsx
for screen in "${screens[@]}"; do
  file_path="./src/screens/$screen.tsx"
  
  # Crear el archivo .tsx y agregar el contenido de importación
  echo "import $screen from '@/screens/$screen';" > "$file_path"
  
  echo "Archivo $file_path creado."
done
