import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import SettingsScreen from '@/screens/SettingsScreen';
import CompaniasScreen from '@/screens/CompaniasScreen';
import SyncCompanyScreen from '@/screens/SyncCompanyScreen';

// Define types for the navigation stack parameters
export type RootStackParamList = {
  Settings: undefined;
  Compañias: undefined;
  SyncCompany: undefined;
  // Add other screens here
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Settings"
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
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: 'Configuración' 
          }}
        />
        <Stack.Screen 
          name="Compañias" 
          component={CompaniasScreen}
          options={{ 
            title: 'Compañías',
            headerBackTitle: 'Atrás' 
          }}
        />
        <Stack.Screen 
          name="SyncCompany" 
          component={SyncCompanyScreen}
          options={{ 
            title: 'Sincronizar compañía',
            headerBackTitle: 'Atrás' 
          }}
        />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
