import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import LoginScreen from '@/auth/LoginScreen';
import RegisterScreen from '@/auth/RegisterScreen';
import SyncCompanyScreen from '@/screens/SyncCompanyScreen';
import EditCompanyScreen from '@/screens/EditCompanyScreen';
import CompaniasScreen from '@/screens/CompaniasScreen';

// Navegadores
import BottomTabs from './BottomTabs';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined; // Contenedor de pestañas inferiores
  SyncCompany: undefined;
  EditCompany: { companyId: string };
  Companias: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#333333',
          },
          headerTintColor: '#0066CC',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="MainTabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SyncCompany"
          component={SyncCompanyScreen}
          options={{ title: 'Sincronizar compañía' }}
        />
        <Stack.Screen
          name="EditCompany"
          component={EditCompanyScreen}
          options={{ title: 'Editar compañía' }}
        />
        <Stack.Screen
          name="Companias"
          component={CompaniasScreen}
          options={{ title: 'Compañía' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
