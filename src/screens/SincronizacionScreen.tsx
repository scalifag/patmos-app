import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SectionList } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type SyncItem = {
  key: string;
  title: string;
  icon: React.ReactNode;
  lastSync: Date | null;
};

type SectionData = {
  title: string;
  data: SyncItem[];
};

const groupedData: SectionData[] = [
  {
    title: 'Datos Maestros',
    data: [
      { key: 'clientes', title: 'Clientes', icon: <Ionicons name="people" size={24}/>, lastSync: new Date() },
      { key: 'articulos', title: 'Artículos', icon: <MaterialIcons name="inventory" size={24} />, lastSync: null },
    ],
  },
  {
    title: 'Configuración',
    data: [
      { key: 'almacenes', title: 'Almacenes', icon: <Ionicons name="home" size={24} />, lastSync: new Date() },
      { key: 'listas_precios', title: 'Listas de precios', icon: <Ionicons name="pricetags" size={24}/>, lastSync: null },
    ],
  },
  {
    title: 'Documentos',
    data: [
      { key: 'ofertas_ventas', title: 'Ofertas de ventas', icon: <Ionicons name="document-text" size={24}  />, lastSync: null },
      { key: 'ordenes_ventas', title: 'Órdenes de ventas', icon: <Ionicons name="receipt" size={24}  />, lastSync: new Date() },
    ],
  },
];

export default function SincronizacionScreen() {
  const [sections, setSections] = useState(groupedData);

  const handleSync = (key: string) => {
    const now = new Date();
    const updated = sections.map(section => ({
      ...section,
      data: section.data.map(item =>
        item.key === key ? { ...item, lastSync: now } : item
      ),
    }));
    setSections(updated);
  };

  const renderItem = ({ item }: { item: SyncItem }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        {item.icon}
        <View style={styles.cardText}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>
            {item.lastSync ? `Última sync: ${format(item.lastSync, 'dd/MM/yyyy HH:mm')}` : 'Nunca sincronizado'}
          </Text>
        </View>
        <TouchableOpacity style={styles.syncButton} onPress={() => handleSync(item.key)}>
          <Ionicons name="cloud-download-outline" size={22} color="#841584" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sincronización de datos</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.syncAllButton}
        onPress={() => {
          sections.forEach(section =>
            section.data.forEach(item => handleSync(item.key))
          );
        }}
      >
        <Ionicons name="sync-outline" size={22} color="white" />
        <Text style={styles.syncAllText}>Sincronizar Todo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: '#111827',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#841584',
    paddingVertical: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  syncButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3E8F5',
  },
  syncAllButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#841584',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 4,
  },
  syncAllText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
});
