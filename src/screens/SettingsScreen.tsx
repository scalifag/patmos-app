import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SectionList, Switch, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { logout } from '@/auth/authService';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '@/navigation'; // Asegúrate de exportarlo en navigation/index.ts
import { SettingsStackParamList } from '@/navigation/SettingsStack'; // Según dónde definas esto

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
      ]
    }
  ];

  const renderItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity 
      style={styles.option} 
      onPress={item.toggle ? undefined : () => {
        if (item.screen) {
          settingsNavigation.navigate(item.screen as any, {});
        }
      }}
      disabled={item.toggle}
    >
      <MaterialIcons name={item.icon as any} size={24} color="#555" />
      <Text style={styles.optionText}>{item.title}</Text>
      
      {item.toggle ? (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
        />
      ) : (
        <MaterialIcons name="chevron-right" size={24} color="#aaa" />
      )}
    </TouchableOpacity>
  );

  const renderProfileItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity 
      style={styles.profileOption} 
      onPress={() => settingsNavigation.navigate(item.screen as any)}
    >
      <View style={styles.profileImageContainer}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/60' }} 
          style={styles.profileImage} 
        />
      </View>
      <View style={styles.profileTextContainer}>
        <Text style={styles.profileName}>Steven Califa</Text>
        <Text style={styles.profileEmail}>steven.califa@solsetec.com.co</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#aaa" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: SettingSection }) => (
    section.title ? (
      <Text style={styles.sectionTitle}>{section.title}</Text>
    ) : null
  );

  useLayoutEffect(() => {
    settingsNavigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [settingsNavigation]);

  return (
    <View style={styles.container}>
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#666',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  sectionSeparator: {
    height: 10,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f0f0f0',
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
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
