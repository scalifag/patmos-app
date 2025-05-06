import React, { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useNavigation } from '@react-navigation/native';
import { useActionSheet } from '@expo/react-native-action-sheet';


type UserItem = {
  key: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  lastActive?: Date;
};

type SectionData = {
  title: string;
  data: UserItem[];
};

const originalUsers: SectionData[] = [
  {
    title: 'Usuarios Activos',
    data: [
      {
        key: 'u1',
        name: 'María López',
        subtitle: 'Admin',
        icon: <Ionicons name="person-circle" size={24} />,
        lastActive: new Date(),
      },
      {
        key: 'u2',
        name: 'Carlos Pérez',
        subtitle: 'Vendedor',
        icon: <Ionicons name="person-circle-outline" size={24} />,
        lastActive: new Date(Date.now() - 3600 * 1000 * 5),
      },
    ],
  },
  {
    title: 'Usuarios Inactivos',
    data: [
      {
        key: 'i1',
        name: 'Ana Torres',
        subtitle: 'Fecha de inactivación: 2023-02-15',
        icon: <MaterialIcons name="person-off" size={24} />,
        lastActive: new Date(Date.now() - 3600 * 1000 * 24),
      },
    ],
  },
  {
    title: 'Roles Disponibles',
    data: [
      {
        key: 'r1',
        name: 'Administrador',
        subtitle: 'Acceso completo',
        icon: <MaterialIcons name="admin-panel-settings" size={24} />,
      },
      {
        key: 'r2',
        name: 'Vendedor',
        subtitle: 'Solo ventas',
        icon: <MaterialIcons name="store" size={24} />,
      },
    ],
  },
];

export default function UsuariosScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'Todos' | 'Activos' | 'Inactivos' | 'Roles'>('Todos');

  const filteredUsers = originalUsers.filter((section) => {
    if (filter === 'Todos') return true;
    if (filter === 'Activos') return section.title === 'Usuarios Activos';
    if (filter === 'Inactivos') return section.title === 'Usuarios Inactivos';
    if (filter === 'Roles') return section.title === 'Roles Disponibles';
    return false;
  });

  const { showActionSheetWithOptions } = useActionSheet();

  const handleFilterPress = () => {
    const options = ['Todos', 'Activos', 'Inactivos', 'Roles', 'Cancelar'];
    const cancelButtonIndex = 4;
  
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Filtrar usuarios',
      },
      (selectedIndex) => {
        if (
          typeof selectedIndex === 'number' &&
          selectedIndex !== cancelButtonIndex
        ) {
          setFilter(options[selectedIndex] as typeof filter);
        }
      }
    );
  };
  

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleFilterPress}>
          <Ionicons name="filter" size={24} color="#841584" />
        </TouchableOpacity>
      ),
      headerTitle: `Usuarios (${filter})`,
    });
  }, [navigation, filter]);

  return (
    <View style={styles.container}>
      <SectionList
        sections={filteredUsers}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {item.icon}
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              {item.lastActive && (
                <Text style={styles.lastActive}>
                  Último acceso: {formatDistanceToNow(item.lastActive, {
                    addSuffix: true,
                    locale: es,
                  })}
                </Text>
              )}
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#841584',
    marginVertical: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  lastActive: {
    fontSize: 12,
    color: '#999',
  },
  headerButton: {
    marginRight: 16,
  },
});
