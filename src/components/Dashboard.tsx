import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Agendamento, Barbeiro, Servico} from '../models/types';

interface DashboardProps {
  agendamentos: Agendamento[];
  barbeiros: Barbeiro[];
  servicos: Servico[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  agendamentos,
  barbeiros,
  servicos,
}) => {
  const getAgendamentosPorPeriodo = (periodo: 'dia' | 'semana' | 'mes') => {
    const hoje = new Date();
    const inicio = new Date();
    const fim = new Date();

    switch (periodo) {
      case 'dia':
        inicio.setHours(0, 0, 0, 0);
        fim.setHours(23, 59, 59, 999);
        break;
      case 'semana':
        inicio.setDate(hoje.getDate() - hoje.getDay());
        fim.setDate(inicio.getDate() + 6);
        break;
      case 'mes':
        inicio.setDate(1);
        fim.setMonth(inicio.getMonth() + 1, 0);
        break;
    }

    return agendamentos.filter(
      agendamento =>
        new Date(agendamento.data) >= inicio &&
        new Date(agendamento.data) <= fim,
    );
  };

  const getTaxaOcupacaoBarbeiro = (barbeiroId: string) => {
    const agendamentosBarbeiro = agendamentos.filter(
      a => a.barbeiroId === barbeiroId,
    );
    const totalAgendamentos = agendamentosBarbeiro.length;
    const agendamentosConcluidos = agendamentosBarbeiro.filter(
      a => a.status === 'concluido',
    ).length;

    return totalAgendamentos > 0
      ? (agendamentosConcluidos / totalAgendamentos) * 100
      : 0;
  };

  const getServicosPopulares = () => {
    const servicosCount = servicos.map(servico => ({
      ...servico,
      count: agendamentos.filter(a => a.servicoId === servico.id).length,
    }));

    return servicosCount.sort((a, b) => b.count - a.count).slice(0, 3);
  };

  const getHorariosPico = () => {
    const horarios = agendamentos.reduce(
      (acc: {[key: string]: number}, curr) => {
        const hora = new Date(curr.data).getHours();
        acc[hora] = (acc[hora] || 0) + 1;
        return acc;
      },
      {},
    );

    return Object.entries(horarios)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hora, count]) => ({
        hora: `${hora}h`,
        count,
      }));
  };

  const renderMetrica = (titulo: string, valor: string | number) => (
    <View style={styles.metricaContainer}>
      <Text style={styles.metricaTitulo}>{titulo}</Text>
      <Text style={styles.metricaValor}>{valor}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Dashboard</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitulo}>Agendamentos</Text>
        <View style={styles.metricasGrid}>
          {renderMetrica('Hoje', getAgendamentosPorPeriodo('dia').length)}
          {renderMetrica(
            'Esta Semana',
            getAgendamentosPorPeriodo('semana').length,
          )}
          {renderMetrica('Este Mês', getAgendamentosPorPeriodo('mes').length)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitulo}>Taxa de Ocupação</Text>
        {barbeiros.map(barbeiro => (
          <View key={barbeiro.id} style={styles.barbeiroContainer}>
            <Text style={styles.barbeiroNome}>{barbeiro.nome}</Text>
            <Text style={styles.barbeiroTaxa}>
              {getTaxaOcupacaoBarbeiro(barbeiro.id).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitulo}>Serviços Populares</Text>
        {getServicosPopulares().map(servico => (
          <View key={servico.id} style={styles.servicoContainer}>
            <Text style={styles.servicoNome}>{servico.nome}</Text>
            <Text style={styles.servicoCount}>
              {servico.count} agendamentos
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitulo}>Horários de Pico</Text>
        {getHorariosPico().map(({hora, count}, index) => (
          <View key={index} style={styles.horarioContainer}>
            <Text style={styles.horarioText}>{hora}</Text>
            <Text style={styles.horarioCount}>{count} agendamentos</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricaContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  metricaTitulo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metricaValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  barbeiroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  barbeiroNome: {
    fontSize: 16,
  },
  barbeiroTaxa: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  servicoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  servicoNome: {
    fontSize: 16,
  },
  servicoCount: {
    fontSize: 14,
    color: '#666',
  },
  horarioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  horarioText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  horarioCount: {
    fontSize: 14,
    color: '#666',
  },
});
