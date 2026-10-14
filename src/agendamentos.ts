// =====================================================
// CIANet — Agendamentos de serviços
// =====================================================

import { respostaErro, respostaSucesso, Agendamento } from "./db";

interface DadosAgendamento {
  cliente_id?: number;
  empresa_id?: number;
  servico_id?: number;
  data_agendada?: string;
  hora_agendada?: string;
  observacoes?: string;
}

export async function criarAgendamento(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosAgendamento | null;

  if (
    !corpo?.cliente_id ||
    !corpo.empresa_id ||
    !corpo.servico_id ||
    !corpo.data_agendada ||
    !corpo.hora_agendada
  ) {
    return respostaErro(
      "Cliente, empresa, serviço, data e hora são obrigatórios."
    );
  }

  const servico = await db
    .prepare("SELECT id, empresa_id FROM servicos WHERE id = ?1")
    .bind(corpo.servico_id)
    .first<{ id: number; empresa_id: number }>();

  if (!servico) {
    return respostaErro("Serviço não encontrado.", 404);
  }

  if (servico.empresa_id !== corpo.empresa_id) {
    return respostaErro("Este serviço não pertence à empresa informada.");
  }

  const conflito = await db
    .prepare(
      `SELECT id FROM agendamentos
       WHERE empresa_id = ?1
         AND data_agendada = ?2
         AND hora_agendada = ?3
         AND status != 'cancelado'`
    )
    .bind(corpo.empresa_id, corpo.data_agendada, corpo.hora_agendada)
    .first();

  if (conflito) {
    return respostaErro("Já existe um agendamento neste horário.", 409);
  }

  const resultado = await db
    .prepare(
      `INSERT INTO agendamentos
        (cliente_id, empresa_id, servico_id, data_agendada, hora_agendada, observacoes)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
    .bind(
      corpo.cliente_id,
      corpo.empresa_id,
      corpo.servico_id,
      corpo.data_agendada,
      corpo.hora_agendada,
      corpo.observacoes ?? null
    )
    .run();

  if (!resultado.success) {
    return respostaErro("Não foi possível criar o agendamento.", 500);
  }

  return respostaSucesso(
    {
      id: resultado.meta.last_row_id,
      cliente_id: corpo.cliente_id,
      empresa_id: corpo.empresa_id,
      servico_id: corpo.servico_id,
      data_agendada: corpo.data_agendada,
      hora_agendada: corpo.hora_agendada,
      status: "pendente",
    },
    201
  );
}

export async function listarAgendamentosDoCliente(
  db: D1Database,
  clienteId: string
): Promise<Response> {
  const id = Number(clienteId);

  if (!Number.isInteger(id) || id <= 0) {
    return respostaErro("ID de cliente inválido.");
  }

  const resultado = await db
    .prepare(
      `SELECT a.id, a.data_agendada, a.hora_agendada, a.status, a.observacoes,
              e.nome AS empresa_nome,
              s.nome AS servico_nome
       FROM agendamentos a
       INNER JOIN empresas e ON e.id = a.empresa_id
       INNER JOIN servicos s ON s.id = a.servico_id
       WHERE a.cliente_id = ?1
       ORDER BY a.data_agendada DESC, a.hora_agendada DESC`
    )
    .bind(id)
    .all<Agendamento & { empresa_nome: string; servico_nome: string }>();

  return respostaSucesso(resultado.results);
}

export async function listarAgendamentosDaEmpresa(
  db: D1Database,
  empresaId: string
): Promise<Response> {
  const id = Number(empresaId);

  if (!Number.isInteger(id) || id <= 0) {
    return respostaErro("ID de empresa inválido.");
  }

  const resultado = await db
    .prepare(
      `SELECT a.id, a.data_agendada, a.hora_agendada, a.status, a.observacoes,
              u.nome AS cliente_nome,
              s.nome AS servico_nome
       FROM agendamentos a
       INNER JOIN usuarios u ON u.id = a.cliente_id
       INNER JOIN servicos s ON s.id = a.servico_id
       WHERE a.empresa_id = ?1
       ORDER BY a.data_agendada DESC, a.hora_agendada DESC`
    )
    .bind(id)
    .all<Agendamento & { cliente_nome: string; servico_nome: string }>();

  return respostaSucesso(resultado.results);
}

export async function atualizarStatusAgendamento(
  db: D1Database,
  agendamentoId: string,
  request: Request
): Promise<Response> {
  const id = Number(agendamentoId);
  const corpo = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;

  const statusPermitidos = ["pendente", "confirmado", "concluido", "cancelado"];

  if (!Number.isInteger(id) || id <= 0) {
    return respostaErro("ID de agendamento inválido.");
  }

  if (!corpo?.status || !statusPermitidos.includes(corpo.status)) {
    return respostaErro(
      "Status inválido. Use: pendente, confirmado, concluido ou cancelado."
    );
  }

  const resultado = await db
    .prepare("UPDATE agendamentos SET status = ?1 WHERE id = ?2")
    .bind(corpo.status, id)
    .run();

  if (!resultado.success || resultado.meta.changes === 0) {
    return respostaErro("Agendamento não encontrado.", 404);
  }

  return respostaSucesso({ id, status: corpo.status });
}
