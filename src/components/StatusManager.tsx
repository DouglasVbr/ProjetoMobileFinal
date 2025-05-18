/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import {Agendamento} from '../models/types';

interface StatusManagerProps {
  agendamento: Agendamento;
  onStatusChange: (
    novoStatus: Agendamento['status'],
    observacao?: string,
  ) => void;
  visible: boolean;
  onClose: () => void;
}

export const StatusManager: React.FC<StatusManagerProps> = ({
  agendamento,
  onStatusChange,
  visible,
  onClose,
}) => {
  const [observacao, setObservacao] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return '#4CAF50';
      case 'confirmado':
        return '#2196F3';
      case 'em_andamento':
        return '#FF9800';
      case 'concluido':
        return '#4CAF50';
      case 'cancelado':
        return '#F44336';
      case 'nao_compareceu':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'confirmado':
        return 'Confirmado';
      case 'em_andamento':
        return 'Em Andamento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      case 'nao_compareceu':
        return 'Não Compareceu';
      default:
        return status;
    }
  };

  const handleStatusChange = (novoStatus: Agendamento['status']) => {
    if (novoStatus === agendamento.status) {
      onClose();
      return;
    }

    if (novoStatus === 'cancelado' || novoStatus === 'nao_compareceu') {
      Alert.alert(
        'Confirmar Alteração',
        `Tem certeza que deseja alterar o status para "${getStatusText(
          novoStatus,
        )}"?`,
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Confirmar',
            onPress: () => {
              onStatusChange(novoStatus, observacao);
              onClose();
            },
          },
        ],
      );
    } else {
      onStatusChange(novoStatus, observacao);
      onClose();
    }
  };

  const renderStatusButton = (status: Agendamento['status']) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        {
          backgroundColor: getStatusColor(status),
          opacity: status === agendamento.status ? 0.7 : 1,
        },
      ]}
      onPress={() => handleStatusChange(status)}>
      <Text style={styles.statusButtonText}>{getStatusText(status)}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Alterar Status</Text>
          <Text style={styles.subtitle}>
            Status Atual: {getStatusText(agendamento.status)}
          </Text>

          <View style={styles.statusButtonsContainer}>
            {renderStatusButton('agendado')}
            {renderStatusButton('confirmado')}
            {renderStatusButton('em_andamento')}
            {renderStatusButton('concluido')}
            {renderStatusButton('cancelado')}
            {renderStatusButton('nao_compareceu')}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Observação (opcional)"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 80,
  },
  closeButton: {
    backgroundColor: '#666',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
