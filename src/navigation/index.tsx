import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { useTheme } from '@/context/ThemeContext';

// Screens
import LoginScreen from '@/auth/LoginScreen';
import RegisterScreen from '@/auth/RegisterScreen';
import ResetPasswordScreen from '@/auth/ResetPasswordScreen';
//import CompaniasScreen from '@/screens/CompaniasScreen';

// Navegadores
import BottomTabs from './BottomTabs';

const linking = {
  prefixes: ['patmos://'],
  config: {
    screens: {
      Login: 'Login',
      Register: 'Register',
      ResetPassword: 'ResetPassword',
      MainTabs: 'MainTabs',
  //    Companias: 'Companias',
    //  EditCompany: 'EditCompany/:companyId',
    },
  },
};
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  MainTabs: undefined; // Contenedor de pestañas inferiores
  //SyncCompany: undefined;
  //EditCompany: { companyId: string };
  //Companias: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  const { colors } = useTheme();

  return (
    <ActionSheetProvider>
      <NavigationContainer
        theme={{
          dark: colors.background === '#121212',
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
        linking={linking}
      >
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              color: colors.text,
            },
            headerTintColor: colors.primary,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen
            name="MainTabs"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
{/*        <Stack.Screen
          name="Companias"
          component={CompaniasScreen}
          options={{ title: 'Compañía' }}
        />
        */}
        </Stack.Navigator>
      </NavigationContainer>
    </ActionSheetProvider>
  );
}
