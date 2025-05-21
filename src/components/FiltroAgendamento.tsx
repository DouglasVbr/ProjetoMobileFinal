import React from 'react';
import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import {Agendamento} from '../models/types';

interface StatusHistoryProps {
  visible: boolean;
  historico: Agendamento['historicoStatus'];
  onClose: () => void;
}

export const StatusHistory: React.FC<StatusHistoryProps> = ({
  visible,
  historico,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Histórico de Status</Text>

          {historico.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.statusText}>{item.status}</Text>
              <Text style={styles.dateText}>
                {new Date(item.data).toLocaleString()}
              </Text>
              {item.observacao && (
                <Text style={styles.observacaoText}>{item.observacao}</Text>
              )}
            </View>
          ))}

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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  historyItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  observacaoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
