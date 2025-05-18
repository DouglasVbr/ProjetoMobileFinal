import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {Dashboard} from '../components/Dashboard';
import {Menu} from '../components/Menu';
import {
  AgendamentoStorage,
  BarbeiroStorage,
  ServicoStorage,
} from '../services/storage';
import {Agendamento, Barbeiro, Servico} from '../models/types';

export const DashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [agendamentosData, barbeirosData, servicosData] = await Promise.all(
        [
          AgendamentoStorage.getAll(),
          BarbeiroStorage.getAll(),
          ServicoStorage.getAll(),
        ],
      );

      setAgendamentos(agendamentosData);
      setBarbeiros(barbeirosData);
      setServicos(servicosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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
      <Dashboard
        agendamentos={agendamentos}
        barbeiros={barbeiros}
        servicos={servicos}
      />
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
});
