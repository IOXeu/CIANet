// =====================================================
// CIANet — Utilitários de acesso ao banco de dados D1
// =====================================================

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  tipo: string;
  criado_em: string;
}

export interface Empresa {
  id: number;
  usuario_id: number;
  nome: string;
  descricao: string | null;
  telefone: string | null;
  whatsapp: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  categoria: string | null;
  criado_em: string;
}

export interface Servico {
  id: number;
  empresa_id: number;
  nome: string;
  descricao: string | null;
  preco: number | null;
  duracao_minutos: number | null;
  criado_em: string;
}

export interface Agendamento {
  id: number;
  cliente_id: number;
  empresa_id: number;
  servico_id: number;
  data_agendada: string;
  hora_agendada: string;
  status: string;
  observacoes: string | null;
  criado_em: string;
}

export interface Avaliacao {
  id: number;
  agendamento_id: number;
  nota: number;
  comentario: string | null;
  criado_em: string;
}

export function respostaSucesso(dados: unknown, status = 200): Response {
  return new Response(JSON.stringify({ sucesso: true, dados }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function respostaErro(mensagem: string, status = 400): Response {
  return new Response(JSON.stringify({ sucesso: false, erro: mensagem }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function lerCorpoJSON<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
