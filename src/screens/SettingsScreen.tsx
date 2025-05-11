import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SectionList, Switch, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { logout } from '@/auth/authService';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '@/navigation'; 
import { SettingsStackParamList } from '@/navigation/SettingsStack';
import { useTheme } from '@/context/ThemeContext';

type RootNav = StackNavigationProp<RootStackParamList>;
type SettingsNav = StackNavigationProp<SettingsStackParamList>;

type SettingItem = {
  title: string;
  icon: string;
  screen?: keyof SettingsStackParamList;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
};

type SettingSection = {
  title?: string;
  data: SettingItem[];
};

export default function SettingsScreen() {
  const rootNavigation = useNavigation<RootNav>();
  const settingsNavigation = useNavigation<SettingsNav>();
  const { isDarkMode, toggleDarkMode, colors } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      rootNavigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar la sesión');
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  const settingsSections: SettingSection[] = [
    {
      data: [
        { title: 'Perfil', icon: 'person', screen: 'Perfil' },
      ]
    },
    {
      title: 'Sincronización',
      data: [
        { title: 'Compañias', icon: 'business', screen: 'Companias' },
        { title: 'Datos locales', icon: 'sync', screen: 'Sincronizacion' },
      ]
    },
    {
      title: 'Datos Maestros',
      data: [
        { title: 'Artículos', icon: 'inventory', screen: 'Articulos' },
        { title: 'Clientes', icon: 'people', screen: 'Clientes' },
      ]
    },
    {
      title: 'Configuración General',
      data: [
        { title: 'Almacenes', icon: 'warehouse', screen: 'Almacenes' },
        { title: 'Usuarios', icon: 'supervised-user-circle', screen: 'Usuarios' },
        { title: 'Listas de Precios', icon: 'local-offer', screen: 'ListasPrecios' },
        { title: 'Series de Numeración', icon: 'confirmation-number', screen: 'SeriesNumeracion' },
      ]
    },
    {
      title: 'Otras Opciones',
      data: [
        { title: 'Documentos', icon: 'description', screen: 'Documentos' },
        { title: 'Personalizar ListView', icon: 'tune', screen: 'PersonalizarListView' },
        { title: 'Flujos de Autorización', icon: 'approval', screen: 'FlujosAutorizacion' },
        { 
          title: 'Notificaciones Push', 
          icon: 'notifications', 
          toggle: true,
          value: pushNotifications,
          onToggle: setPushNotifications
        },
        { 
          title: 'Modo Oscuro', 
          icon: 'brightness-4', 
          toggle: true,
          value: isDarkMode,
          onToggle: toggleDarkMode
        },
      ]
    }
  ];

  const renderItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity 
      style={[styles.option, { backgroundColor: colors.card }]} 
      onPress={item.toggle ? undefined : () => {
        if (item.screen) {
          settingsNavigation.navigate(item.screen as any, {});
        }
      }}
      disabled={item.toggle}
    >
      <MaterialIcons name={item.icon as any} size={24} color={colors.text} />
      <Text style={[styles.optionText, { color: colors.text }]}>{item.title}</Text>
      
      {item.toggle ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#d0d0d0', true: '#a06ba5' }}
          thumbColor={item.value ? '#841584' : '#f4f3f4'}
        />
      ) : (
        <MaterialIcons name="chevron-right" size={24} color={colors.text} />
      )}
    </TouchableOpacity>
  );

  const renderProfileItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity 
      style={[styles.profileOption, { backgroundColor: colors.card }]} 
      onPress={() => settingsNavigation.navigate(item.screen as any)}
    >
      <View style={[styles.profileImageContainer, { borderColor: colors.border }]}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/60' }} 
          style={styles.profileImage} 
        />
      </View>
      <View style={styles.profileTextContainer}>
        <Text style={[styles.profileName, { color: colors.text }]}>Steven Califa</Text>
        <Text style={[styles.profileEmail, { color: colors.text }]}>steven.califa@solsetec.com.co</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.text} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: SettingSection }) => (
    section.title ? (
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
    ) : null
  );

  useLayoutEffect(() => {
    settingsNavigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
          <Ionicons name="log-out-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
      },
      headerTintColor: colors.text,
    });
  }, [settingsNavigation, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={settingsSections}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({ item, section, index }) => {
          if (index === 0 && section === settingsSections[0]) {
            return renderProfileItem({ item });
          }
          return renderItem({ item });
        }}
        renderSectionHeader={renderSectionHeader}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  sectionSeparator: {
    height: 10,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
});
