import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { Menu } from '../components/Menu';
import { Agendamento, Cliente, Barbeiro, Servico } from '../models/types';
import { AgendamentoStorage } from '../services/storage';
import { ClienteStorage, BarbeiroStorage, ServicoStorage } from '../services/storage';
import { SelectionModal } from '../components/SelectionModal';
import { StatusManager } from '../components/StatusAgenda';
import { StatusHistory } from '../components/FiltroAgendamento';
import { AvaliacaoModal } from '../components/AvaliacaoModal';
import { notificationService } from '../services/notifications';

export const AgendamentoScreen = () => {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<Barbeiro | null>(null);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showBarbeiroModal, setShowBarbeiroModal] = useState(false);
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [agendamentosData, clientesData, barbeirosData, servicosData] =
          await Promise.all([
            AgendamentoStorage.getAll(),
            ClienteStorage.getAll(),
            BarbeiroStorage.getAll(),
            ServicoStorage.getAll(),
          ]);

        setAgendamentos(agendamentosData);
        setClientes(clientesData);
        setBarbeiros(barbeirosData);
        setServicos(servicosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!selectedCliente) errors.push('Selecione um cliente');
    if (!selectedBarbeiro) errors.push('Selecione um barbeiro');
    if (!selectedServico) errors.push('Selecione um serviço');
    if (!date) errors.push('Selecione uma data');
    if (!time) errors.push('Selecione um horário');

    if (errors.length > 0) {
      Alert.alert('Formulário incompleto', errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const dataAgendamento = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );

      const novoAgendamento: Agendamento = {
        id: uuidv4(),
        clienteId: selectedCliente?.id || '',
        clienteNome: selectedCliente?.nome || '',
        barbeiroId: selectedBarbeiro?.id || '',
        barbeiroNome: selectedBarbeiro?.nome || '',
        servicoId: selectedServico?.id || '',
        servicoNome: selectedServico?.nome || '',
        data: dataAgendamento.toISOString(),
        status: 'agendado',
        observacoes: observacoes.trim(),
        historicoStatus: [{
          status: 'agendado',
          data: new Date().toISOString(),
          observacao: 'Agendamento criado'
        }],
      };

      await AgendamentoStorage.save(novoAgendamento);
      notificationService.notificarNovoAgendamento(novoAgendamento);
      notificationService.agendarNotificacao(novoAgendamento);

      setAgendamentos(prev => [...prev, novoAgendamento]);
      resetForm();
      Alert.alert('Sucesso', 'Agendamento criado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível criar o agendamento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCliente(null);
    setSelectedBarbeiro(null);
    setSelectedServico(null);
    setDate(new Date());
    setTime(new Date());
    setObservacoes('');
  };

  const handleStatusChange = async (
    agendamento: Agendamento,
    novoStatus: Agendamento['status'],
    observacao?: string
  ) => {
    try {
      const agendamentoAtualizado: Agendamento = {
        ...agendamento,
        status: novoStatus ?? 'agendado',
        historicoStatus: [
          ...agendamento.historicoStatus,
          {
            status: novoStatus,
            data: new Date().toISOString(),
            observacao: observacao || novoStatus
          }
        ],
      };

      await AgendamentoStorage.update(agendamentoAtualizado); // Adicionar o parâmetro
      notificationService.notificarAlteracaoStatus(agendamento, novoStatus);
      setAgendamentos(prev => 
        prev.map(a => a.id === agendamento.id ? agendamentoAtualizado : a)
      );
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este agendamento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await AgendamentoStorage.delete(id);
              notificationService.cancelarNotificacao(id);
              setAgendamentos(prev => prev.filter(a => a.id !== id));
              Alert.alert('Sucesso', 'Agendamento excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir agendamento:', error);
              Alert.alert('Erro', 'Não foi possível excluir o agendamento');
            }
          },
        },
      ]
    );
  };

  const handleAvaliacao = async (nota: number, comentario: string) => {
    if (!selectedAgendamento) return;

    try {
      const agendamentoAtualizado = {
        ...selectedAgendamento,
        avaliacao: {
          nota,
          comentario: comentario.trim(),
          data: new Date().toISOString(),
        },
      };

      await AgendamentoStorage.update(agendamentoAtualizado);
      setAgendamentos(prev => 
        prev.map(a => a.id === selectedAgendamento.id ? agendamentoAtualizado : a)
      );
      setShowAvaliacaoModal(false);
      Alert.alert('Sucesso', 'Avaliação registrada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível registrar a avaliação');
    }
  };

  const AgendamentoItem = ({ item }: { item: Agendamento }) => (
    <View style={styles.agendamentoItem}>
      <View style={styles.agendamentoInfo}>
        <Text style={styles.agendamentoTitle}>{item.clienteNome}</Text>
        <Text style={styles.agendamentoSubtitle}>
          {item.barbeiroNome} - {item.servicoNome}
        </Text>
        <Text style={styles.agendamentoDate}>
          {new Date(item.data).toLocaleDateString('pt-BR')} às{' '}
          {new Date(item.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={[styles.agendamentoStatus, { color: getStatusColor(item.status) }]}>
          Status: {getStatusText(item.status)}
        </Text>
        {item.avaliacao && (
          <Text style={styles.agendamentoAvaliacao}>
            Avaliação: {item.avaliacao.nota}/5 - {item.avaliacao.comentario}
          </Text>
        )}
      </View>
      <View style={styles.agendamentoActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedAgendamento(item);
            setShowStatusManager(true);
          }}>
          <Text style={styles.actionButtonText}>Status</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}>
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
        {item.status === 'concluido' && !item.avaliacao && (
          <TouchableOpacity
            style={[styles.actionButton, styles.rateButton]}
            onPress={() => {
              setSelectedAgendamento(item);
              setShowAvaliacaoModal(true);
            }}>
            <Text style={styles.actionButtonText}>Avaliar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return '#4CAF50';
      case 'confirmado': return '#2196F3';
      case 'em_andamento': return '#FF9800';
      case 'concluido': return '#4CAF50';
      case 'cancelado': return '#F44336';
      case 'nao_compareceu': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'confirmado': return 'Confirmado';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      case 'nao_compareceu': return 'Não Compareceu';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Menu />
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Novo Agendamento</Text>

          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowClienteModal(true)}>
            <Text style={styles.selectionButtonText}>
              {selectedCliente ? selectedCliente.nome : 'Selecione um cliente'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowBarbeiroModal(true)}>
            <Text style={styles.selectionButtonText}>
              {selectedBarbeiro ? selectedBarbeiro.nome : 'Selecione um barbeiro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowServicoModal(true)}>
            <Text style={styles.selectionButtonText}>
              {selectedServico ? selectedServico.nome : 'Selecione um serviço'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.selectionButtonText}>
              {date.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}

          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowTimePicker(true)}>
            <Text style={styles.selectionButtonText}>
              {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  setTime(selectedTime);
                }
              }}
            />
          )}

          <FormInput
            label="Observações"
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Alguma observação importante?"
            multiline
            numberOfLines={3}
          />

          <Button
            title="Agendar"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Agendamentos</Text>
          {agendamentos.length === 0 ? (
            <Text style={styles.emptyListText}>Nenhum agendamento encontrado</Text>
          ) : (
            agendamentos
              .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
              .map(item => (
                <AgendamentoItem key={item.id} item={item} />
              ))
          )}
        </View>
      </ScrollView>

      <SelectionModal
        visible={showClienteModal}
        title="Selecione um Cliente"
        items={clientes}
        onSelect={item => {
          setSelectedCliente(item as Cliente);
          setShowClienteModal(false);
        }}
        onClose={() => setShowClienteModal(false)}
      />

      <SelectionModal
        visible={showBarbeiroModal}
        title="Selecione um Barbeiro"
        items={barbeiros}
        onSelect={item => {
          setSelectedBarbeiro(item as Barbeiro);
          setShowBarbeiroModal(false);
        }}
        onClose={() => setShowBarbeiroModal(false)}
      />

      <SelectionModal
        visible={showServicoModal}
        title="Selecione um Serviço"
        items={servicos}
        onSelect={item => {
          setSelectedServico(item as Servico);
          setShowServicoModal(false);
        }}
        onClose={() => setShowServicoModal(false)}
      />

      {selectedAgendamento && (
        <>
          <StatusManager
            visible={showStatusManager}
            onClose={() => setShowStatusManager(false)}
            agendamento={selectedAgendamento}
            onStatusChange={(novoStatus, observacao) =>
              handleStatusChange(selectedAgendamento, novoStatus, observacao)
            }
          />

          <StatusHistory
            visible={showStatusManager}
            historico={selectedAgendamento.historicoStatus}
            onClose={() => setShowStatusManager(false)}
          />

          <AvaliacaoModal
            visible={showAvaliacaoModal}
            onClose={() => setShowAvaliacaoModal(false)}
            onSave={handleAvaliacao}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#2196F3',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  selectionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectionButtonText: {
    color: '#333',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 10,
  },
  listContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  agendamentoItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  agendamentoInfo: {
    marginBottom: 10,
  },
  agendamentoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  agendamentoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  agendamentoDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  agendamentoStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  agendamentoAvaliacao: {
    fontSize: 14,
    color: '#FFC107',
    marginTop: 5,
    fontStyle: 'italic',
  },
  agendamentoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  rateButton: {
    backgroundColor: '#FFC107',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AgendamentoScreen;