// =====================================================
// CIANet — Autenticação e cadastro de usuários
// =====================================================

import { respostaErro, respostaSucesso, Usuario } from "./db";

interface DadosCadastro {
  nome?: string;
  email?: string;
  senha?: string;
  tipo?: string;
}

interface DadosLogin {
  email?: string;
  senha?: string;
}

export async function gerarHashSenha(senha: string): Promise<string> {
  const dados = new TextEncoder().encode(senha);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function cadastrarUsuario(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosCadastro | null;

  if (!corpo?.nome || !corpo.email || !corpo.senha) {
    return respostaErro("Nome, e-mail e senha são obrigatórios.");
  }

  const email = corpo.email.trim().toLowerCase();

  const usuarioExistente = await db
    .prepare("SELECT id FROM usuarios WHERE email = ?1")
    .bind(email)
    .first();

  if (usuarioExistente) {
    return respostaErro("Este e-mail já está cadastrado.", 409);
  }

  const senhaHash = await gerarHashSenha(corpo.senha);
  const tipo = corpo.tipo === "empresa" ? "empresa" : "cliente";

  const resultado = await db
    .prepare(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo)
       VALUES (?1, ?2, ?3, ?4)`
    )
    .bind(corpo.nome.trim(), email, senhaHash, tipo)
    .run();

  if (!resultado.success) {
    return respostaErro("Não foi possível criar a conta.", 500);
  }

  return respostaSucesso(
    {
      id: resultado.meta.last_row_id,
      nome: corpo.nome.trim(),
      email,
      tipo,
    },
    201
  );
}

export async function entrarUsuario(
  db: D1Database,
  request: Request
): Promise<Response> {
  const corpo = (await request.json().catch(() => null)) as DadosLogin | null;

  if (!corpo?.email || !corpo.senha) {
    return respostaErro("E-mail e senha são obrigatórios.");
  }

  const email = corpo.email.trim().toLowerCase();
  const senhaHash = await gerarHashSenha(corpo.senha);

  const usuario = await db
    .prepare(
      `SELECT id, nome, email, tipo
       FROM usuarios
       WHERE email = ?1 AND senha_hash = ?2`
    )
    .bind(email, senhaHash)
    .first<Usuario>();

  if (!usuario) {
    return respostaErro("E-mail ou senha incorretos.", 401);
  }

  return respostaSucesso({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
  });
}
