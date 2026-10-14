// =====================================================
// CIANet — Serviços oferecidos pelas empresas
// =====================================================

import { respostaErro, respostaSucesso, Servico } from "./db";

interface DadosServico {
  empresa_id?: number;
  nome?: string;
  descricao?: string;
  preco?: number;
  duracao_minutos?: number;
}

export async function cadastrarServico(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosServico | null;

  if (!corpo?.empresa_id || !corpo.nome) {
    return respostaErro("ID da empresa e nome do serviço são obrigatórios.");
  }

  const empresa = await db
    .prepare("SELECT id FROM empresas WHERE id = ?1")
    .bind(corpo.empresa_id)
    .first();

  if (!empresa) {
    return respostaErro("Empresa não encontrada.", 404);
  }

  const resultado = await db
    .prepare(
      `INSERT INTO servicos
        (empresa_id, nome, descricao, preco, duracao_minutos)
       VALUES (?1, ?2, ?3, ?4, ?5)`
    )
    .bind(
      corpo.empresa_id,
      corpo.nome.trim(),
      corpo.descricao ?? null,
      corpo.preco ?? null,
      corpo.duracao_minutos ?? null
    )
    .run();

  if (!resultado.success) {
    return respostaErro("Não foi possível cadastrar o serviço.", 500);
  }

  return respostaSucesso(
    {
      id: resultado.meta.last_row_id,
      empresa_id: corpo.empresa_id,
      nome: corpo.nome.trim(),
      preco: corpo.preco ?? null,
      duracao_minutos: corpo.duracao_minutos ?? null,
    },
    201
  );
}

export async function listarServicosDaEmpresa(
  db: D1Database,
  empresaId: string
): Promise<Response> {
  const id = Number(empresaId);

  if (!Number.isInteger(id) || id <= 0) {
    return respostaErro("ID de empresa inválido.");
  }

  const resultado = await db
    .prepare(
      `SELECT id, empresa_id, nome, descricao, preco, duracao_minutos
       FROM servicos
       WHERE empresa_id = ?1
       ORDER BY nome ASC`
    )
    .bind(id)
    .all<Servico>();

  return respostaSucesso(resultado.results);
}

export async function buscarServico(
  db: D1Database,
  servicoId: string
): Promise<Response> {
  const id = Number(servicoId);

  if (!Number.isInteger(id) || id <= 0) {
    return respostaErro("ID de serviço inválido.");
  }

  const servico = await db
    .prepare(
      `SELECT id, empresa_id, nome, descricao, preco, duracao_minutos
       FROM servicos
       WHERE id = ?1`
    )
    .bind(id)
    .first<Servico>();

  if (!servico) {
    return respostaErro("Serviço não encontrado.", 404);
  }

  return respostaSucesso(servico);
}
