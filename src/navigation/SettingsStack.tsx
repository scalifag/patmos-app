import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '@/screens/SettingsScreen';
import CompaniasScreen from '@/screens/CompaniasScreen';
import PerfilScreen from '@/screens/PerfilScreen';
import SincronizacionScreen from '@/screens/SincronizacionScreen';
import ArticulosScreen from '@/screens/ArticulosScreen';
import ClientesScreen from '@/screens/ClientesScreen';
import AlmacenesScreen from '@/screens/AlmacenesScreen';
import UsuariosScreen from '@/screens/UsuariosScreen';
import ListasPreciosScreen from '@/screens/ListasPreciosScreen';
import SeriesNumeracionScreen from '@/screens/SeriesNumeracionScreen';
import DocumentsScreen from '@/screens/DocumentsScreen';
import PersonalizarListViewScreen from '@/screens/PersonalizarListViewScreen';
import FlujosAutorizacionScreen from '@/screens/FlujosAutorizacionScreen';
import EditCompanyScreen from '@/screens/EditCompanyScreen';
import SyncCompanyScreen from '@/screens/SyncCompanyScreen';

export type SettingsStackParamList = {
  Settings: undefined;
  Perfil: undefined;
  Companias: undefined;
  Sincronizacion: undefined;
  Articulos: undefined;
  Clientes: undefined;
  Almacenes: undefined;
  Usuarios: undefined;
  ListasPrecios: undefined;
  SeriesNumeracion: undefined;
  Documentos: undefined;
  PersonalizarListView: undefined;
  FlujosAutorizacion: undefined;
  EditCompany: { companyId: string };
  SyncCompany: undefined
};

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '' }} />
      <Stack.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="Companias" component={CompaniasScreen} options={{ title: 'Compañías' }} />
      <Stack.Screen name="Sincronizacion" component={SincronizacionScreen} options={{ title: 'Sincronización' }} />
      <Stack.Screen name="Articulos" component={ArticulosScreen} options={{ title: 'Artículos' }} />
      <Stack.Screen name="Clientes" component={ClientesScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="Almacenes" component={AlmacenesScreen} options={{ title: 'Almacenes' }} />
      <Stack.Screen name="Usuarios" component={UsuariosScreen} options={{ title: 'Usuarios' }} />
      <Stack.Screen name="ListasPrecios" component={ListasPreciosScreen} options={{ title: 'Listas de Precios' }} />
      <Stack.Screen name="SeriesNumeracion" component={SeriesNumeracionScreen} options={{ title: 'Series de Numeración' }} />
      <Stack.Screen name="Documentos" component={DocumentsScreen} options={{ title: 'Documentos' }} />
      <Stack.Screen name="PersonalizarListView" component={PersonalizarListViewScreen} options={{ title: 'Personalizar ListView' }} />
      <Stack.Screen name="FlujosAutorizacion" component={FlujosAutorizacionScreen} options={{ title: 'Flujos de autorización' }} />
      <Stack.Screen name="EditCompany" component={EditCompanyScreen} options={{ title: 'Editar Compañia' }} />
      <Stack.Screen name="SyncCompany" component={SyncCompanyScreen} options={{ title: 'Nueva Compañia' }} />
    </Stack.Navigator>
  );
}
