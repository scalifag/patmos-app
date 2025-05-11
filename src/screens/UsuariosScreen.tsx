import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { useNavigation } from '@react-navigation/native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { getCompanyUsers, CompanyUser, updateUserStatus } from '@/services/userService';
import InviteUserModal from '@/components/InviteUserModal';

const COMPANY_ID = 'a646eaaf-e3af-4968-b6d8-99938460bf00';

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

export default function UsuariosScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<'Todos' | 'Activos' | 'Inactivos' | 'Roles'>('Todos');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const companyUsers = await getCompanyUsers(COMPANY_ID);
      setUsers(companyUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus(userId, isActive);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

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

  const handleUserOptions = (user: CompanyUser) => {
    const options = [
      user.is_active ? 'Desactivar usuario' : 'Activar usuario',
      'Cancelar',
    ];
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Opciones de usuario',
      },
      async (selectedIndex) => {
        if (typeof selectedIndex === 'number' && selectedIndex !== cancelButtonIndex) {
          await handleUserAction(user.id, !user.is_active);
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

  const sections: SectionData[] = [
    {
      title: 'Usuarios Activos',
      data: users
        .filter(user => user.is_active)
        .map(user => ({
          key: user.id,
          name: `${user.first_name} ${user.last_name}`,
          subtitle: user.sap_employee_code || 'Sin código SAP',
          icon: <Ionicons name="person-circle" size={24} color="#841584" />,
          lastActive: new Date(user.updated_at),
        })),
    },
    {
      title: 'Usuarios Inactivos',
      data: users
        .filter(user => !user.is_active)
        .map(user => ({
          key: user.id,
          name: `${user.first_name} ${user.last_name}`,
          subtitle: user.sap_employee_code || 'Sin código SAP',
          icon: <MaterialIcons name="person-off" size={24} color="#666" />,
          lastActive: new Date(user.updated_at),
        })),
    },
  ];

  const filteredSections = sections.filter((section) => {
    if (filter === 'Todos') return true;
    if (filter === 'Activos') return section.title === 'Usuarios Activos';
    if (filter === 'Inactivos') return section.title === 'Usuarios Inactivos';
    return false;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#841584" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={filteredSections}
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
            <TouchableOpacity onPress={() => handleUserOptions(users.find(u => u.id === item.key)!)}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#aaa" />
            </TouchableOpacity>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <InviteUserModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={loadUsers}
        companyId={COMPANY_ID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#841584',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
