// =====================================================
// CIANet — Área administrativa de licenças
// =====================================================

import { respostaErro, respostaSucesso } from "./db";

interface DadosNovaLicenca {
  cliente_nome?: string;
  cliente_email?: string;
  plano_instalacoes?: number;
  data_expiracao?: string;
}

function gerarChaveLicenca(): string {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let chave = "CIANET-";

  for (let i = 0; i < 4; i++) {
    let bloco = "";

    for (let j = 0; j < 4; j++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      bloco += caracteres[indice];
    }

    chave += bloco;

    if (i < 3) {
      chave += "-";
    }
  }

  return chave;
}

export function validarTokenAdmin(
  request: Request,
  env: { ADMIN_TOKEN?: string }
): boolean {
  const token = request.headers.get("Authorization");

  if (!token || !env.ADMIN_TOKEN) {
    return false;
  }

  return token === `Bearer ${env.ADMIN_TOKEN}`;
}

export async function criarLicenca(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosNovaLicenca | null;

  if (!corpo?.cliente_nome || !corpo.plano_instalacoes) {
    return respostaErro(
      "Nome do cliente e plano de instalações são obrigatórios."
    );
  }

  const planosValidos = [1, 3, 5, 7];

  if (!planosValidos.includes(corpo.plano_instalacoes)) {
    return respostaErro(
      "O plano deve ser 1, 3, 5 ou 7 instalações."
    );
  }

  const chave = gerarChaveLicenca();

  const resultado = await db
    .prepare(
      `INSERT INTO licencas
        (chave, cliente_nome, cliente_email, plano_instalacoes, status, data_expiracao)
       VALUES (?1, ?2, ?3, ?4, 'ativa', ?5)`
    )
    .bind(
      chave,
      corpo.cliente_nome.trim(),
      corpo.cliente_email?.trim() ?? null,
      corpo.plano_instalacoes,
      corpo.data_expiracao ?? null
    )
    .run();

  if (!resultado.success) {
    return respostaErro("Não foi possível criar a licença.", 500);
  }

  return respostaSucesso(
    {
      mensagem: "Licença criada com sucesso.",
      licenca: {
        chave,
        cliente: corpo.cliente_nome,
        plano_instalacoes: corpo.plano_instalacoes,
        status: "ativa",
      },
    },
    201
  );
}

export async function listarLicencas(db: D1Database): Promise<Response> {
  const resultado = await db
    .prepare(
      `SELECT
        l.id,
        l.chave,
        l.cliente_nome,
        l.cliente_email,
        l.plano_instalacoes,
        l.status,
        l.data_compra,
        l.data_expiracao,
        COUNT(CASE WHEN i.status = 'ativa' THEN 1 END) AS instalacoes_ativas
       FROM licencas l
       LEFT JOIN instalacoes i ON i.licenca_id = l.id
       GROUP BY l.id
       ORDER BY l.id DESC`
    )
    .all();

  return respostaSucesso({
    licencas: resultado.results,
  });
}

export async function listarInstalacoesDaLicenca(
  db: D1Database,
  licencaId: string
): Promise<Response> {
  const licenca = await db
    .prepare(
      `SELECT id, chave, cliente_nome, plano_instalacoes, status
       FROM licencas
       WHERE id = ?1`
    )
    .bind(licencaId)
    .first();

  if (!licenca) {
    return respostaErro("Licença não encontrada.", 404);
  }

  const instalacoes = await db
    .prepare(
      `SELECT
        id,
        nome_computador,
        dispositivo_id,
        sistema_operacional,
        versao_cianet,
        status,
        ativada_em,
        ultimo_acesso
       FROM instalacoes
       WHERE licenca_id = ?1
       ORDER BY id DESC`
    )
    .bind(licencaId)
    .all();

  return respostaSucesso({
    licenca,
    instalacoes: instalacoes.results,
  });
}

export async function alterarStatusLicenca(
  db: D1Database,
  licencaId: string,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;

  const status = corpo?.status;

  if (!status || !["ativa", "bloqueada", "expirada"].includes(status)) {
    return respostaErro(
      "Status inválido. Use ativa, bloqueada ou expirada."
    );
  }

  const resultado = await db
    .prepare(
      `UPDATE licencas
       SET status = ?1
       WHERE id = ?2`
    )
    .bind(status, licencaId)
    .run();

  if (!resultado.success) {
    return respostaErro("Não foi possível atualizar a licença.", 500);
  }

  return respostaSucesso({
    mensagem: `Licença atualizada para ${status}.`,
  });
}

export async function desativarInstalacao(
  db: D1Database,
  instalacaoId: string
): Promise<Response> {
  const resultado = await db
    .prepare(
      `UPDATE instalacoes
       SET status = 'desativada'
       WHERE id = ?1`
    )
    .bind(instalacaoId)
    .run();

  if (!resultado.success) {
    return respostaErro("Não foi possível desativar a instalação.", 500);
  }

  return respostaSucesso({
    mensagem: "Instalação desativada com sucesso.",
  });
}
