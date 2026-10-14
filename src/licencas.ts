// =====================================================
// CIANet — Licenças e instalações
// =====================================================

import { respostaErro, respostaSucesso } from "./db";

interface DadosAtivacao {
  chave?: string;
  nome_computador?: string;
  dispositivo_id?: string;
  sistema_operacional?: string;
  versao_cianet?: string;
}

interface Licenca {
  id: number;
  chave: string;
  cliente_nome: string;
  plano_instalacoes: number;
  status: string;
  data_expiracao: string | null;
}

export async function ativarLicenca(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosAtivacao | null;

  if (!corpo?.chave || !corpo.nome_computador || !corpo.dispositivo_id) {
    return respostaErro(
      "Chave da licença, nome do computador e ID do dispositivo são obrigatórios."
    );
  }

  const chave = corpo.chave.trim().toUpperCase();

  const licenca = await db
    .prepare(
      `SELECT id, chave, cliente_nome, plano_instalacoes, status, data_expiracao
       FROM licencas
       WHERE chave = ?1`
    )
    .bind(chave)
    .first<Licenca>();

  if (!licenca) {
    return respostaErro("Licença não encontrada.", 404);
  }

  if (licenca.status !== "ativa") {
    return respostaErro(`Esta licença está ${licenca.status}.`, 403);
  }

  if (
    licenca.data_expiracao &&
    new Date(licenca.data_expiracao) < new Date()
  ) {
    return respostaErro("Esta licença está expirada.", 403);
  }

  const instalacaoExistente = await db
    .prepare(
      `SELECT id, status FROM instalacoes
       WHERE licenca_id = ?1 AND dispositivo_id = ?2`
    )
    .bind(licenca.id, corpo.dispositivo_id)
    .first<{ id: number; status: string }>();

  if (instalacaoExistente) {
    if (instalacaoExistente.status === "desativada") {
      await db
        .prepare(
          `UPDATE instalacoes
           SET status = 'ativa', ultimo_acesso = datetime('now')
           WHERE id = ?1`
        )
        .bind(instalacaoExistente.id)
        .run();
    } else {
      await db
        .prepare(
          `UPDATE instalacoes
           SET ultimo_acesso = datetime('now')
           WHERE id = ?1`
        )
        .bind(instalacaoExistente.id)
        .run();
    }

    return respostaSucesso({
      mensagem: "Licença válida. Instalação já registrada.",
      licenca: {
        cliente: licenca.cliente_nome,
        plano_instalacoes: licenca.plano_instalacoes,
      },
    });
  }

  const totalAtivas = await db
    .prepare(
      `SELECT COUNT(*) AS total FROM instalacoes
       WHERE licenca_id = ?1 AND status = 'ativa'`
    )
    .bind(licenca.id)
    .first<{ total: number }>();

  const instalacoesUsadas = totalAtivas?.total ?? 0;

  if (instalacoesUsadas >= licenca.plano_instalacoes) {
    return respostaErro(
      `Limite de instalações atingido. Este plano permite ${licenca.plano_instalacoes} instalações.`,
      409
    );
  }

  await db
    .prepare(
      `INSERT INTO instalacoes
        (licenca_id, nome_computador, dispositivo_id, sistema_operacional, versao_cianet, ultimo_acesso)
       VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))`
    )
    .bind(
      licenca.id,
      corpo.nome_computador.trim(),
      corpo.dispositivo_id.trim(),
      corpo.sistema_operacional ?? null,
      corpo.versao_cianet ?? null
    )
    .run();

  return respostaSucesso(
    {
      mensagem: "Licença ativada com sucesso.",
      licenca: {
        cliente: licenca.cliente_nome,
        plano_instalacoes: licenca.plano_instalacoes,
        instalacoes_usadas: instalacoesUsadas + 1,
      },
    },
    201
  );
}

export async function validarLicenca(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosAtivacao | null;

  if (!corpo?.chave || !corpo.dispositivo_id) {
    return respostaErro("Chave da licença e ID do dispositivo são obrigatórios.");
  }

  const chave = corpo.chave.trim().toUpperCase();

  const resultado = await db
    .prepare(
      `SELECT l.id, l.chave, l.cliente_nome, l.plano_instalacoes, l.status,
              i.status AS status_instalacao
       FROM licencas l
       LEFT JOIN instalacoes i
         ON i.licenca_id = l.id AND i.dispositivo_id = ?2
       WHERE l.chave = ?1`
    )
    .bind(chave, corpo.dispositivo_id.trim())
    .first<{
      id: number;
      chave: string;
      cliente_nome: string;
      plano_instalacoes: number;
      status: string;
      status_instalacao: string | null;
    }>();

  if (!resultado) {
    return respostaErro("Licença não encontrada.", 404);
  }

  if (resultado.status !== "ativa") {
    return respostaErro(`Esta licença está ${resultado.status}.`, 403);
  }

  if (resultado.status_instalacao !== "ativa") {
    return respostaErro("Esta instalação não está ativa.", 403);
  }

  await db
    .prepare(
      `UPDATE instalacoes
       SET ultimo_acesso = datetime('now')
       WHERE licenca_id = ?1 AND dispositivo_id = ?2`
    )
    .bind(resultado.id, corpo.dispositivo_id.trim())
    .run();

  return respostaSucesso({
    licenca_valida: true,
    cliente: resultado.cliente_nome,
    plano_instalacoes: resultado.plano_instalacoes,
  });
}
