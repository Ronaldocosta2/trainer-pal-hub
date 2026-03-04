export interface Plano {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  valor: number;
  frequencia: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Aluno {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email: string;
  data_nascimento: string | null;
  objetivo: string | null;
  observacoes: string | null;
  data_inicio: string;
  plano_id: string | null;
  valor_mensalidade: number;
  dia_vencimento: number;
  foto_url: string | null;
  endereco: string | null;
  contato_emergencia: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  planos?: Plano;
}

export interface Pagamento {
  id: string;
  user_id: string;
  aluno_id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pago' | 'pendente' | 'atrasado';
  observacao: string | null;
  created_at: string;
  updated_at: string;
  alunos?: Aluno;
}
