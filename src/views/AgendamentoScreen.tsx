import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {FormInput} from '../components/FormInput';
import {Button} from '../components/Button';
import {Menu} from '../components/Menu';
import {Agendamento, Cliente, Barbeiro, Servico} from '../models/types';
import {AgendamentoStorage} from '../services/storage';
import {ClienteStorage} from '../services/storage';
import {BarbeiroStorage} from '../services/storage';
import {ServicoStorage} from '../services/storage';
import {SelectionModal} from '../components/SelectionModal';
import {StatusManager} from '../components/StatusAgenda';
import {StatusHistory} from '../components/FiltroAgendamento';
import {AvaliacaoModal} from '../components/AvaliacaoModal';
import {notificationService} from '../services/notifications';

export const AgendamentoScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<Barbeiro | null>(
    null,
  );
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showBarbeiroModal, setShowBarbeiroModal] = useState(false);
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
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
      Alert.alert('Erro', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!selectedCliente) {
      Alert.alert('Erro', 'Selecione um cliente');
      return false;
    }
    if (!selectedBarbeiro) {
      Alert.alert('Erro', 'Selecione um barbeiro');
      return false;
    }
    if (!selectedServico) {
      Alert.alert('Erro', 'Selecione um serviço');
      return false;
    }
    if (!data) {
      Alert.alert('Erro', 'Selecione uma data');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const dataHora = new Date(`${data}T${hora}`).toISOString();
        const novoAgendamento: Agendamento = {
          id: Date.now().toString(),
          clienteId: selectedCliente?.id || '',
          clienteNome: selectedCliente?.nome || '',
          barbeiroId: selectedBarbeiro?.id || '',
          barbeiroNome: selectedBarbeiro?.nome || '',
          servicoId: selectedServico?.id || '',
          servicoNome: selectedServico?.nome || '',
          data: dataHora,
          status: 'agendado',
          observacoes: observacoes,
          historicoStatus: [
            {
              status: 'agendado',
              data: new Date().toISOString(),
              observacao: 'Agendamento criado',
            },
          ],
        };

        await AgendamentoStorage.save(novoAgendamento);
        notificationService.notificarNovoAgendamento(novoAgendamento);
        notificationService.agendarNotificacao(novoAgendamento);

        setSelectedCliente(null);
        setSelectedBarbeiro(null);
        setSelectedServico(null);
        setData('');
        setHora('');
        setObservacoes('');
        carregarDados();
        Alert.alert('Sucesso', 'Agendamento criado com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        Alert.alert('Erro', 'Erro ao criar agendamento');
      }
    }
  };

  const handleStatusChange = async (
    agendamento: Agendamento,
    novoStatus: Agendamento['status'],
  ) => {
    try {
      const agendamentoAtualizado: Agendamento = {
        ...agendamento,
        status: novoStatus,
        historicoStatus: [
          ...agendamento.historicoStatus,
          {
            status: novoStatus,
            data: new Date().toISOString(),
            observacao: `Status alterado para ${novoStatus}`,
          },
        ],
      };

      await AgendamentoStorage.update(agendamentoAtualizado);
      notificationService.notificarAlteracaoStatus(agendamento, novoStatus);
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Erro ao atualizar status do agendamento');
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
              carregarDados();
              Alert.alert('Sucesso', 'Agendamento excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir agendamento:', error);
              Alert.alert('Erro', 'Erro ao excluir agendamento');
            }
          },
        },
      ],
    );
  };

  const handleAvaliacao = async (nota: number, comentario: string) => {
    if (!selectedAgendamento) {
      return;
    }

    try {
      const agendamentoAtualizado = {
        ...selectedAgendamento,
        avaliacao: {
          nota,
          comentario,
          data: new Date().toISOString(),
        },
      };

      await AgendamentoStorage.update(agendamentoAtualizado);
      carregarDados();
      setShowAvaliacaoModal(false);
    } catch (error) {
      console.error('Erro ao registrar avaliação:', error);
      Alert.alert('Erro', 'Erro ao registrar avaliação');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Menu />
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
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
              {selectedBarbeiro
                ? selectedBarbeiro.nome
                : 'Selecione um barbeiro'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowServicoModal(true)}>
            <Text style={styles.selectionButtonText}>
              {selectedServico ? selectedServico.nome : 'Selecione um serviço'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Data (DD/MM/AAAA)"
            value={data}
            onChangeText={setData}
          />

          <TextInput
            style={styles.input}
            placeholder="Hora (HH:MM)"
            value={hora}
            onChangeText={setHora}
          />

          <FormInput
            label="Observações"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
          />

          <Button title="Agendar" onPress={handleSubmit} />
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Agendamentos</Text>
          {agendamentos.map(agendamento => (
            <View key={agendamento.id} style={styles.agendamentoItem}>
              <View style={styles.agendamentoInfo}>
                <Text style={styles.agendamentoTitle}>
                  {agendamento.clienteNome}
                </Text>
                <Text style={styles.agendamentoSubtitle}>
                  {agendamento.barbeiroNome} - {agendamento.servicoNome}
                </Text>
                <Text style={styles.agendamentoDate}>
                  {new Date(agendamento.data).toLocaleString()}
                </Text>
                <Text style={styles.agendamentoStatus}>
                  Status: {agendamento.status}
                </Text>
              </View>
              <View style={styles.agendamentoActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedAgendamento(agendamento);
                    setShowStatusManager(true);
                  }}>
                  <Text style={styles.actionButtonText}>Status</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(agendamento.id)}>
                  <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
            onStatusChange={(novoStatus, _observacao) =>
              handleStatusChange(selectedAgendamento, novoStatus)
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
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
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
  listContainer: {
    padding: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  agendamentoItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  agendamentoInfo: {
    flex: 1,
  },
  agendamentoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  agendamentoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  agendamentoDate: {
    fontSize: 14,
    color: '#666',
  },
  agendamentoStatus: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 5,
  },
  agendamentoActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
});
