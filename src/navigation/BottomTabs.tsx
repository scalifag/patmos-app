import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/screens/HomeScreen';
import DocumentsScreen from '@/screens/DocumentsScreen';
import SettingsStack from './SettingsStack';
import Ionicons from '@expo/vector-icons/Ionicons'; // 👈 o desde 'react-native-vector-icons/Ionicons'

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
<Tab.Navigator
  screenOptions={({ route }) => {
    const icons = {
      Inicio: 'home-outline',
      Documentos: 'document-text-outline',
      Configuración: 'settings-outline',
    } as const;

    return {
      tabBarIcon: ({ color, size }) => {
        const iconName = icons[route.name as keyof typeof icons]; // ✅ Forzamos a TS
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007aff',
      tabBarInactiveTintColor: 'gray',
    };
  }}
>

      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Documentos" component={DocumentsScreen} />
      <Tab.Screen 
  name="Configuración" 
  component={SettingsStack}
  options={{ headerShown: false }} // 👈 Oculta el header duplicado
/>

    </Tab.Navigator>
  );
}
