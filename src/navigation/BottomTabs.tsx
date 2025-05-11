import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/screens/HomeScreen';
import DocumentsScreen from '@/screens/DocumentsScreen';
import SettingsStack from './SettingsStack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { colors } = useTheme();

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
            const iconName = icons[route.name as keyof typeof icons];
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
          headerTintColor: colors.text,
        };
      }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Documentos" component={DocumentsScreen} />
      <Tab.Screen 
        name="Configuración" 
        component={SettingsStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
