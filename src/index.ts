export interface Env {
  DB: D1Database;
}

interface ClienteRequest {
  nomeComprador: string;
  nomeFantasia: string;
  cnpjCpf: string;
  cep?: string;
  enderecoCompleto?: string;
  planoContratado?: string;
  metodoPagamento?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({
        sistema: "CIA 2 — ControlIA",
        status: "online",
        banco: "D1 conectado",
        data: new Date().toISOString()
      });
    }

    if (request.method === "POST" && url.pathname === "/clientes") {
      return criarCliente(request, env);
    }

    if (request.method === "GET" && url.pathname === "/clientes") {
      return listarClientes(env);
    }

    return Response.json(
      { erro: "Rota não encontrada." },
      { status: 404 }
    );
  }
};

async function criarCliente(
  request: Request,
  env: Env
): Promise<Response> {
  let corpo: ClienteRequest;

  try {
    corpo = await request.json<ClienteRequest>();
  } catch {
    return Response.json(
      { erro: "JSON inválido." },
      { status: 400 }
    );
  }

  if (!corpo.nomeComprador || !corpo.nomeFantasia || !corpo.cnpjCpf) {
    return Response.json(
      {
        erro:
          "Campos obrigatórios: nomeComprador, nomeFantasia e cnpjCpf."
      },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  const agora = new Date().toISOString();

  try {
    await env.DB
      .prepare(
        `INSERT INTO clientes (
          id,
          nome_comprador,
          nome_fantasia,
          cnpj_cpf,
          cep,
          endereco_completo,
          plano_contratado,
          metodo_pagamento,
          status,
          data_cadastro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo', ?)`
      )
      .bind(
        id,
        corpo.nomeComprador.trim(),
        corpo.nomeFantasia.trim(),
        corpo.cnpjCpf.trim(),
        corpo.cep ?? null,
        corpo.enderecoCompleto ?? null,
        corpo.planoContratado ?? null,
        corpo.metodoPagamento ?? null,
        agora
      )
      .run();

    return Response.json(
      {
        sucesso: true,
        clienteId: id,
        mensagem: "Cliente cadastrado com sucesso."
      },
      { status: 201 }
    );
  } catch (erro: any) {
    const mensagem = String(erro?.message ?? "").toUpperCase();

    if (mensagem.includes("UNIQUE")) {
      return Response.json(
        { erro: "Já existe um cliente com este CNPJ/CPF." },
        { status: 409 }
      );
    }

    return Response.json(
      { erro: "Erro interno ao salvar cliente." },
      { status: 500 }
    );
  }
}

async function listarClientes(env: Env): Promise<Response> {
  const resultado = await env.DB
    .prepare(
      `SELECT
        id,
        nome_comprador,
        nome_fantasia,
        cnpj_cpf,
        cep,
        endereco_completo,
        plano_contratado,
        metodo_pagamento,
        status,
        data_cadastro
      FROM clientes
      ORDER BY data_cadastro DESC`
    )
    .all();

  return Response.json({
    sucesso: true,
    total: resultado.results.length,
    clientes: resultado.results
  });
}
