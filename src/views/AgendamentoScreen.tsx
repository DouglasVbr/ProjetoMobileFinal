import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
<<<<<<< HEAD
import { Calendar } from 'react-native-calendars';
import firestore from '@react-native-firebase/firestore';
import 'moment/locale/pt-br';
=======
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
>>>>>>> ca30507d8a605df4b5f7ae2b50b16545fedd9acd

interface Barbeiro {
  id: string;
  nome: string;
  telefone: string;
  disponibilidade: {
    [key: string]: string[]; // data: horários disponíveis
  };
}

interface Agendamento {
  id?: string;
  clienteId: string;
  clienteNome: string;
  barbeiroId: string;
  barbeiroNome: string;
  barbeiroTelefone: string;
  data: string;
  horario: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
}

export const AgendamentoScreen = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<Barbeiro | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>('');

  useEffect(() => {
    carregarBarbeiros();
  }, []);

  const carregarBarbeiros = async () => {
    try {
      const snapshot = await firestore().collection('barbeiros').get();
      const listaBarbeiros: Barbeiro[] = [];
      snapshot.forEach(doc => {
        listaBarbeiros.push({ id: doc.id, ...doc.data() } as Barbeiro);
      });
      setBarbeiros(listaBarbeiros);
    } catch (error) {
      Alert.alert('Erro ao carregar barbeiros');
    }
  };

  const verificarHorariosDisponiveis = (data: Date, barbeiroId: string) => {
    const barbeiro = barbeiros.find(b => b.id === barbeiroId);
    if (barbeiro) {
      const dataFormatada = data.toISOString().split('T')[0];
      const horarios = barbeiro.disponibilidade[dataFormatada] || [];
      setHorariosDisponiveis(horarios);
    }
  };

  const realizarAgendamento = async () => {
    if (!selectedDate || !barbeiroSelecionado || !horarioSelecionado) {
      Alert.alert('Preencha todos os campos');
      return;
    }

    try {
      const novoAgendamento: Agendamento = {
        clienteId: 'ID_DO_CLIENTE_LOGADO', 
        clienteNome: 'NOME_DO_CLIENTE', 
        barbeiroId: barbeiroSelecionado.id,
        barbeiroNome: barbeiroSelecionado.nome,
        barbeiroTelefone: barbeiroSelecionado.telefone,
        data: selectedDate.toISOString().split('T')[0],
        horario: horarioSelecionado,
        status: 'pendente'
      };

      await firestore().collection('agendamentos').add(novoAgendamento);
      Alert.alert('Agendamento realizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro ao realizar agendamento');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Agendar Horário</Text>

      <View style={styles.calendarioContainer}>
        <Calendar
          onDayPress={(day: { dateString: string }) => {
            const date = new Date(day.dateString);
            setSelectedDate(date);
            if (barbeiroSelecionado) {
              verificarHorariosDisponiveis(date, barbeiroSelecionado.id);
            }
          }}
          minDate={new Date().toISOString().split('T')[0]}
          theme={{
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#FFFFFF',
          }}
        />
      </View>

      <View style={styles.barbeirosContainer}>
        <Text style={styles.subtitulo}>Barbeiros Disponíveis:</Text>
        {barbeiros.map(barbeiro => (
          <TouchableOpacity
            key={barbeiro.id}
            style={[
              styles.barbeiroItem,
              barbeiroSelecionado?.id === barbeiro.id && styles.barbeiroSelecionado
            ]}
            onPress={() => {
              setBarbeiroSelecionado(barbeiro);
              if (selectedDate) {
                verificarHorariosDisponiveis(selectedDate, barbeiro.id);
              }
            }}>
            <Text style={styles.barbeiroNome}>{barbeiro.nome}</Text>
            <Text style={styles.barbeiroTelefone}>Tel: {barbeiro.telefone}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {horariosDisponiveis.length > 0 && (
        <View style={styles.horariosContainer}>
          <Text style={styles.subtitulo}>Horários Disponíveis:</Text>
          <ScrollView horizontal>
            {horariosDisponiveis.map(horario => (
              <TouchableOpacity
                key={horario}
                style={[
                  styles.horarioItem,
                  horarioSelecionado === horario && styles.horarioSelecionado
                ]}
                onPress={() => setHorarioSelecionado(horario)}>
                <Text style={styles.horarioTexto}>{horario}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={styles.botaoAgendar}
        onPress={realizarAgendamento}>
        <Text style={styles.botaoTexto}>Confirmar Agendamento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  calendarioContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  barbeirosContainer: {
    marginBottom: 16,
  },
  barbeiroItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  barbeiroSelecionado: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  barbeiroNome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  barbeiroTelefone: {
    fontSize: 14,
    color: '#666',
  },
  horariosContainer: {
    marginBottom: 16,
  },
  horarioItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  horarioSelecionado: {
    backgroundColor: '#007AFF',
  },
  horarioTexto: {
    fontSize: 16,
  },
  botaoAgendar: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
