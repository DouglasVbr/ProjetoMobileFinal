import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Cliente,
  Servico,
  Barbeiro,
  Produto,
  Agendamento,
} from '../models/types';

// Chaves para armazenamento
const STORAGE_KEYS = {
  CLIENTES: '@barbearia:clientes',
  SERVICOS: '@barbearia:servicos',
  BARBEIROS: '@barbearia:barbeiros',
  PRODUTOS: '@barbearia:produtos',
  AGENDAMENTOS: '@barbearia:agendamentos',
};

// Funções genéricas para manipulação de dados
const getItems = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Erro ao buscar ${key}:`, error);
    return [];
  }
};

const saveItems = async <T>(key: string, items: T[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error);
    throw error;
  }
};

// Funções específicas para cada tipo de dado
export const ClienteStorage = {
  getAll: () => getItems<Cliente>(STORAGE_KEYS.CLIENTES),
  save: async (cliente: Cliente) => {
    const clientes = await getItems<Cliente>(STORAGE_KEYS.CLIENTES);
    const novoCliente = {...cliente, id: Date.now().toString()};
    await saveItems(STORAGE_KEYS.CLIENTES, [...clientes, novoCliente]);
    return novoCliente;
  },
  update: async (cliente: Cliente) => {
    const clientes = await getItems<Cliente>(STORAGE_KEYS.CLIENTES);
    const index = clientes.findIndex(c => c.id === cliente.id);
    if (index !== -1) {
      clientes[index] = cliente;
      await saveItems(STORAGE_KEYS.CLIENTES, clientes);
      return cliente;
    }
    throw new Error('Cliente não encontrado');
  },
  delete: async (id: string) => {
    const clientes = await getItems<Cliente>(STORAGE_KEYS.CLIENTES);
    const novosClientes = clientes.filter(c => c.id !== id);
    await saveItems(STORAGE_KEYS.CLIENTES, novosClientes);
  },
};

export const ServicoStorage = {
  getAll: () => getItems<Servico>(STORAGE_KEYS.SERVICOS),
  save: async (servico: Servico) => {
    const servicos = await getItems<Servico>(STORAGE_KEYS.SERVICOS);
    const novoServico = {...servico, id: Date.now().toString()};
    await saveItems(STORAGE_KEYS.SERVICOS, [...servicos, novoServico]);
    return novoServico;
  },
  update: async (servico: Servico) => {
    const servicos = await getItems<Servico>(STORAGE_KEYS.SERVICOS);
    const index = servicos.findIndex(s => s.id === servico.id);
    if (index !== -1) {
      servicos[index] = servico;
      await saveItems(STORAGE_KEYS.SERVICOS, servicos);
      return servico;
    }
    throw new Error('Serviço não encontrado');
  },
  delete: async (id: string) => {
    const servicos = await getItems<Servico>(STORAGE_KEYS.SERVICOS);
    const novosServicos = servicos.filter(s => s.id !== id);
    await saveItems(STORAGE_KEYS.SERVICOS, novosServicos);
  },
};

export const BarbeiroStorage = {
  getAll: () => getItems<Barbeiro>(STORAGE_KEYS.BARBEIROS),
  save: async (barbeiro: Barbeiro) => {
    const barbeiros = await getItems<Barbeiro>(STORAGE_KEYS.BARBEIROS);
    const novoBarbeiro = {...barbeiro, id: Date.now().toString()};
    await saveItems(STORAGE_KEYS.BARBEIROS, [...barbeiros, novoBarbeiro]);
    return novoBarbeiro;
  },
  update: async (barbeiro: Barbeiro) => {
    const barbeiros = await getItems<Barbeiro>(STORAGE_KEYS.BARBEIROS);
    const index = barbeiros.findIndex(b => b.id === barbeiro.id);
    if (index !== -1) {
      barbeiros[index] = barbeiro;
      await saveItems(STORAGE_KEYS.BARBEIROS, barbeiros);
      return barbeiro;
    }
    throw new Error('Barbeiro não encontrado');
  },
  delete: async (id: string) => {
    const barbeiros = await getItems<Barbeiro>(STORAGE_KEYS.BARBEIROS);
    const novosBarbeiros = barbeiros.filter(b => b.id !== id);
    await saveItems(STORAGE_KEYS.BARBEIROS, novosBarbeiros);
  },
};

export const ProdutoStorage = {
  getAll: () => getItems<Produto>(STORAGE_KEYS.PRODUTOS),
  save: async (produto: Produto) => {
    const produtos = await getItems<Produto>(STORAGE_KEYS.PRODUTOS);
    const novoProduto = {...produto, id: Date.now().toString()};
    await saveItems(STORAGE_KEYS.PRODUTOS, [...produtos, novoProduto]);
    return novoProduto;
  },
  update: async (produto: Produto) => {
    const produtos = await getItems<Produto>(STORAGE_KEYS.PRODUTOS);
    const index = produtos.findIndex(p => p.id === produto.id);
    if (index !== -1) {
      produtos[index] = produto;
      await saveItems(STORAGE_KEYS.PRODUTOS, produtos);
      return produto;
    }
    throw new Error('Produto não encontrado');
  },
  delete: async (id: string) => {
    const produtos = await getItems<Produto>(STORAGE_KEYS.PRODUTOS);
    const novosProdutos = produtos.filter(p => p.id !== id);
    await saveItems(STORAGE_KEYS.PRODUTOS, novosProdutos);
  },
};

export const AgendamentoStorage = {
  getAll: () => getItems<Agendamento>(STORAGE_KEYS.AGENDAMENTOS),
  save: async (agendamento: Agendamento) => {
    const agendamentos = await getItems<Agendamento>(STORAGE_KEYS.AGENDAMENTOS);
    const novoAgendamento = {...agendamento, id: Date.now().toString()};
    await saveItems(STORAGE_KEYS.AGENDAMENTOS, [
      ...agendamentos,
      novoAgendamento,
    ]);
    return novoAgendamento;
  },
  update: async (agendamento: Agendamento) => {
    const agendamentos = await getItems<Agendamento>(STORAGE_KEYS.AGENDAMENTOS);
    const index = agendamentos.findIndex(a => a.id === agendamento.id);
    if (index !== -1) {
      agendamentos[index] = agendamento;
      await saveItems(STORAGE_KEYS.AGENDAMENTOS, agendamentos);
      return agendamento;
    }
    throw new Error('Agendamento não encontrado');
  },
  delete: async (id: string) => {
    const agendamentos = await getItems<Agendamento>(STORAGE_KEYS.AGENDAMENTOS);
    const novosAgendamentos = agendamentos.filter(a => a.id !== id);
    await saveItems(STORAGE_KEYS.AGENDAMENTOS, novosAgendamentos);
  },
};
