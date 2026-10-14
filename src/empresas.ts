// =====================================================
// CIANet — Empresas / prestadores de serviço
// =====================================================

import { respostaErro, respostaSucesso, Empresa } from "./db";

interface DadosEmpresa {
  usuario_id?: number;
  nome?: string;
  descricao?: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  categoria?: string;
}

export async function cadastrarEmpresa(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosEmpresa | null;

  if (!corpo?.usuario_id || !corpo.nome) {
    return respostaErro("ID do usuário e nome da empresa são obrigatórios.");
  }

  const resultado = await db
    .prepare(
      `INSERT INTO empresas
        (usuario_id, nome, descricao, telefone, whatsapp, endereco, cidade, estado, categoria)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
    )
    .bind(
      corpo.usuario_id,
      corpo.nome.trim(),
      corpo.descricao ?? null,
      corpo.telefone ?? null,
      corpo.whatsapp ?? null,
      corpo.endereco ?? null,
      corpo.cidade ?? null,
      corpo.estado ?? null,
      corpo.categoria ?? null
    )
    .run();

  if (!resultado.success) {
    return respostaErro("Não foi possível cadastrar a empresa.", 500);
  }

  return respostaSucesso(
    {
      id: resultado.meta.last_row_id,
      nome: corpo.nome.trim(),
      categoria: corpo.categoria ?? null,
    },
    201
  );
}

export async function listarEmpresas(db: D1Database): Promise<Response> {
  const resultado = await db
    .prepare(
      `SELECT id, nome, descricao, telefone, whatsapp, endereco, cidade, estado, categoria
       FROM empresas
       ORDER BY nome ASC`
    )
    .all<Empresa>();

  return respostaSucesso(resultado.results);
}

export async function buscarEmpresa(
  db: D1Database,
  id: string
): Promise<Response> {
  const empresaId = Number(id);

  if (!Number.isInteger(empresaId) || empresaId <= 0) {
    return respostaErro("ID de empresa inválido.");
  }

  const empresa = await db
    .prepare(
      `SELECT id, usuario_id, nome, descricao, telefone, whatsapp,
              endereco, cidade, estado, categoria
       FROM empresas
       WHERE id = ?1`
    )
    .bind(empresaId)
    .first<Empresa>();

  if (!empresa) {
    return respostaErro("Empresa não encontrada.", 404);
  }

  return respostaSucesso(empresa);
}
