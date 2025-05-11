import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { inviteUser } from '@/services/userService';

type InviteUserModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
};

export default function InviteUserModal({
  visible,
  onClose,
  onSuccess,
  companyId,
}: InviteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    sap_employee_code: '',
  });

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await inviteUser(companyId, formData);
      Alert.alert('Éxito', 'Invitación enviada correctamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al enviar la invitación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Invitar Nuevo Usuario</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={formData.first_name}
            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            value={formData.last_name}
            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Código de empleado SAP (opcional)"
            value={formData.sap_employee_code}
            onChangeText={(text) => setFormData({ ...formData, sap_employee_code: text })}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Enviar Invitación</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#841584',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  submitButton: {
    backgroundColor: '#841584',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
}); 