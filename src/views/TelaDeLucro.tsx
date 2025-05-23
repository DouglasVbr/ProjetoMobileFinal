import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  ScrollView,
} from 'react-native';
import {Menu} from '../components/Menu';
import {
  AgendamentoStorage,
  BarbeiroStorage,
  ServicoStorage,
  ClienteStorage,
} from '../services/storage';
import {Agendamento, Barbeiro, Servico} from '../models/types';

interface RelatorioBarbeiro {
  nome: string;
  atendimentos: number;
  valorTotal: number;
}

export const TelaDeLucros: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [relatorioMensal, setRelatorioMensal] = useState<RelatorioBarbeiro[]>(
    [],
  );
  const [totalMes, setTotalMes] = useState({
    atendimentos: 0,
    valor: 0,
  });

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);

      const [agendamentosData, barbeirosData, servicosData] = await Promise.all(
        [
          AgendamentoStorage.getAll(),
          BarbeiroStorage.getAll(),
          ServicoStorage.getAll(),
        ],
      );

      if (!barbeirosData.length) {
        throw new Error('Nenhum barbeiro cadastrado');
      }

      if (!servicosData.length) {
        throw new Error('Nenhum serviço cadastrado');
      }

      calcularRelatorioMensal(agendamentosData, barbeirosData, servicosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const verificarAutorizacao = useCallback(async () => {
    const clientes = await ClienteStorage.getAll();
    const usuarioLogadoEmail = '';
    const usuario = clientes.find(c => c.email === usuarioLogadoEmail);
    if (usuario?.nome !== 'barbeiro') {
      throw new Error('Usuário não autorizado');
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      try {
        await verificarAutorizacao();
        await carregarDados();
      } catch (error) {
        console.error('Erro na inicialização:', error);
      }
    };
    inicializar();
  }, [carregarDados, verificarAutorizacao]);

  const calcularRelatorioMensal = (
    agendamentos: Agendamento[],
    barbeiros: Barbeiro[],
    servicos: Servico[],
  ) => {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const agendamentosMes = agendamentos.filter(agend => {
      const data = new Date(agend.data);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });

    if (!barbeiros.length || !servicos.length) {
      console.warn('Nenhum barbeiro ou serviço cadastrado');
      return;
    }

    const relatorio: RelatorioBarbeiro[] = barbeiros.map(barbeiro => {
      const atendimentosBarbeiro = agendamentosMes.filter(
        agend => agend.barbeiroId === barbeiro.id,
      );

      const valorTotal = atendimentosBarbeiro.reduce((total, agend) => {
        const servico = servicos.find(s => s.id === agend.servicoId);
        return total + (servico?.preco || 0);
      }, 0);

      return {
        nome: barbeiro.nome,
        atendimentos: atendimentosBarbeiro.length,
        valorTotal,
      };
    });

    const totalAtendimentos = relatorio.reduce(
      (total, barb) => total + barb.atendimentos,
      0,
    );
    const totalValor = relatorio.reduce(
      (total, barb) => total + barb.valorTotal,
      0,
    );

    setRelatorioMensal(
      relatorio.sort((a, b) => b.atendimentos - a.atendimentos),
    );
    setTotalMes({atendimentos: totalAtendimentos, valor: totalValor});
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
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório Mensal</Text>
          <Text style={styles.subtitle}>
            Total de atendimentos: {totalMes.atendimentos}
          </Text>
          <Text style={styles.subtitle}>
            Valor total: R$ {totalMes.valor.toFixed(2)}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.columnHeader}>Barbeiro</Text>
            <Text style={styles.columnHeader}>Atendimentos</Text>
            <Text style={styles.columnHeader}>Valor Total</Text>
          </View>
          {relatorioMensal.map((barbeiro, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{barbeiro.nome}</Text>
              <Text style={styles.tableCell}>{barbeiro.atendimentos}</Text>
              <Text style={styles.tableCell}>
                R$ {barbeiro.valorTotal.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
  },
  columnHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
