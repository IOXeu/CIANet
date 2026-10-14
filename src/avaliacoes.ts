// =====================================================
// CIANet — Avaliações de serviços realizados
// =====================================================

import { respostaErro, respostaSucesso, Avaliacao } from "./db";

interface DadosAvaliacao {
  agendamento_id?: number;
  nota?: number;
  comentario?: string;
}

export async function criarAvaliacao(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosAvaliacao | null;

  if (!corpo?.agendamento_id || typeof corpo.nota !== "number") {
    return respostaErro("ID do agendamento e nota são obrigatórios.");
  }

  if (corpo.nota < 1 || corpo.nota > 5) {
    return respostaErro("A nota deve ser entre 1 e 5.");
  }

  const agendamento = await db
    .prepare(
      `SELECT id, status FROM agendamentos WHERE id = ?1`
    )
    .bind(corpo.agendamento_id)
    .first<{ id: number; status: string }>();

  if (!agendamento) {
    return respostaErro("Agendamento não encontrado.", 404);
  }

  if (agendamento.status !== "concluido") {
    return respostaErro(
      "Só é possível avaliar um agendamento concluído.",
      409
    );
  }

  const avaliacaoExistente = await db
    .prepare("SELECT id FROM avaliacoes WHERE agendamento_id = ?1")
    .bind(corpo.agendamento_id)
    .first();

  if (avaliacaoExistente) {
    return respostaErro("Este agendamento já foi avaliado.", 409);
  }

  const resultado = await db
    .prepare(
      `INSERT INTO avaliacoes (agendamento_id, nota, comentario)
       VALUES (?1, ?2, ?3)`
    )
    .bind(
      corpo.agendamento_id,
      corpo.nota,
      corpo.comentario?.trim() || null
    )
    .run();

  if (!resultado.success) {
    return respostaErro("Não foi possível registrar a avaliação.", 500);
  }

  return respostaSucesso(
    {
      id: resultado.meta.last_row_id,
      agendamento_id: corpo.agendamento_id,
      nota: corpo.nota,
      comentario: corpo.comentario?.trim() || null,
    },
    201
  );
}

export async function listarAvaliacoesDaEmpresa(
  db: D1Database,
  empresaId: string
): Promise<Response> {
  const id = Number(empresaId);

  if (!Number.isInteger(id) || id <= 0) {
    return respostaErro("ID de empresa inválido.");
  }

  const resultado = await db
    .prepare(
      `SELECT av.id, av.nota, av.comentario, av.criado_em,
              a.data_agendada,
              s.nome AS servico_nome
       FROM avaliacoes av
       INNER JOIN agendamentos a ON a.id = av.agendamento_id
       INNER JOIN servicos s ON s.id = a.servico_id
       WHERE a.empresa_id = ?1
       ORDER BY av.criado_em DESC`
    )
    .bind(id)
    .all<Avaliacao & { data_agendada: string; servico_nome: string }>();

  return respostaSucesso(resultado.results);
}

export async function obterMediaAvaliacoes(
  db: D1Database,
  empresaId: string
): Promise<Response> {
  const id = Number(empresaId);

  if (!Number.isInteger(id) || id <= 0) {
    return respostaErro("ID de empresa inválido.");
  }

  const media = await db
    .prepare(
      `SELECT AVG(av.nota) AS media, COUNT(av.id) AS total
       FROM avaliacoes av
       INNER JOIN agendamentos a ON a.id = av.agendamento_id
       WHERE a.empresa_id = ?1`
    )
    .bind(id)
    .first<{ media: number | null; total: number }>();

  return respostaSucesso({
    media: media?.media ?? null,
    total_avaliacoes: media?.total ?? 0,
  });
}
