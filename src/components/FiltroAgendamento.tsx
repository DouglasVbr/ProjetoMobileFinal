import React from 'react';
import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import {Agendamento} from '../models/types';
import{globalStyles} from '../styles/globalStyles';


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
      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.modalContainer}>
          <Text style={globalStyles.modalTitle}>Histórico de Status</Text>

          {historico.map((item, index) => (
            <View key={index} style={globalStyles.historyItem}>
              <Text style={globalStyles.statusText}>{item.status}</Text>
              <Text style={globalStyles.dateText}>
                {item.data && item.data !== '0000-00-00 00:00:00'
                  ? new Date(item.data).toLocaleString()
                  : 'Data não disponível'}
                {new Date(item.data).toLocaleString()}
              </Text>
              {item.observacao && (
                <Text style={globalStyles.observacaoText}>{item.observacao}</Text>
              )}
            </View>
          ))}

          <TouchableOpacity style={globalStyles.closeButton} onPress={onClose}>
            <Text style={globalStyles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


