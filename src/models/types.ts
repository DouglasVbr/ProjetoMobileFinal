export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: number; // em minutos
}

export interface Barbeiro {
  id: string;
  nome: string;
  especialidade: string;
  disponibilidade: boolean;
  servicos: string[]; // IDs dos serviços que o barbeiro realiza
}

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  descricao: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  barbeiroId: string;
  barbeiroNome: string;
  servicoId: string;
  servicoNome: string;
  data: string;
  status:
    | 'agendado'
    | 'confirmado'
    | 'em_andamento'
    | 'concluido'
    | 'cancelado'
    | 'nao_compareceu';
  observacoes?: string;
  historicoStatus: {
    status: string;
    data: string;
    observacao?: string;
  }[];
  avaliacao?: {
    nota: number;
    comentario: string;
    data: string;
  };
}
