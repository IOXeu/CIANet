// =====================================================
// CIANet — API principal
// =====================================================

import { respostaErro, respostaSucesso } from "./db";
import { cadastrarUsuario, entrarUsuario } from "./auth";
import {
  buscarEmpresa,
  cadastrarEmpresa,
  listarEmpresas,
} from "./empresas";
import {
  buscarServico,
  cadastrarServico,
  listarServicosDaEmpresa,
} from "./servicos";
import {
  atualizarStatusAgendamento,
  criarAgendamento,
  listarAgendamentosDaEmpresa,
  listarAgendamentosDoCliente,
} from "./agendamentos";
import {
  criarAvaliacao,
  listarAvaliacoesDaEmpresa,
  obterMediaAvaliacoes,
} from "./avaliacoes";

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const caminho = url.pathname;
    const metodo = request.method;

    const partes = caminho.split("/").filter((parte) => parte !== "");

    try {
      // Rota inicial
      if (caminho === "/" && metodo === "GET") {
        return respostaSucesso({
          nome: "CIANet API",
          status: "online",
          versao: "1.0.0",
        });
      }

      // Autenticação
      if (caminho === "/api/usuarios/cadastro" && metodo === "POST") {
        return await cadastrarUsuario(env.DB, request);
      }

      if (caminho === "/api/usuarios/login" && metodo === "POST") {
        return await entrarUsuario(env.DB, request);
      }

      // Empresas
      if (caminho === "/api/empresas" && metodo === "POST") {
        return await cadastrarEmpresa(env.DB, request);
      }

      if (caminho === "/api/empresas" && metodo === "GET") {
        return await listarEmpresas(env.DB);
      }

      if (partes[0] === "api" && partes[1] === "empresas" && partes.length === 3 && metodo === "GET") {
        return await buscarEmpresa(env.DB, partes[2]);
      }

      // Serviços
      if (caminho === "/api/servicos" && metodo === "POST") {
        return await cadastrarServico(env.DB, request);
      }

      if (
        partes[0] === "api" &&
        partes[1] === "empresas" &&
        partes[2] === "servicos" &&
        partes.length === 4 &&
        metodo === "GET"
      ) {
        return await listarServicosDaEmpresa(env.DB, partes[3]);
      }

      if (
        partes[0] === "api" &&
        partes[1] === "servicos" &&
        partes.length === 3 &&
        metodo === "GET"
      ) {
        return await buscarServico(env.DB, partes[2]);
      }

      // Agendamentos
      if (caminho === "/api/agendamentos" && metodo === "POST") {
        return await criarAgendamento(env.DB, request);
      }

      if (
        partes[0] === "api" &&
        partes[1] === "clientes" &&
        partes[2] === "agendamentos" &&
        partes.length === 4 &&
        metodo === "GET"
      ) {
        return await listarAgendamentosDoCliente(env.DB, partes[3]);
      }

      if (
        partes[0] === "api" &&
        partes[1] === "empresas" &&
        partes[2] === "agendamentos" &&
        partes.length === 4 &&
        metodo === "GET"
      ) {
        return await listarAgendamentosDaEmpresa(env.DB, partes[3]);
      }

      if (
        partes[0] === "api" &&
        partes[1] === "agendamentos" &&
        partes.length === 4 &&
        partes[3] === "status" &&
        metodo === "PATCH"
      ) {
        return await atualizarStatusAgendamento(env.DB, partes[2], request);
      }

      // Avaliações
      if (caminho === "/api/avaliacoes" && metodo === "POST") {
        return await criarAvaliacao(env.DB, request);
      }

      if (
        partes[0] === "api" &&
        partes[1] === "empresas" &&
        partes[2] === "avaliacoes" &&
        partes.length === 4 &&
        metodo === "GET"
      ) {
        return await listarAvaliacoesDaEmpresa(env.DB, partes[3]);
      }

      if (
        partes[0] === "api" &&
        partes[1] === "empresas" &&
        partes[2] === "media-avaliacoes" &&
        partes.length === 4 &&
        metodo === "GET"
      ) {
        return await obterMediaAvaliacoes(env.DB, partes[3]);
      }

      return respostaErro("Rota não encontrada.", 404);
    } catch (erro) {
      console.error("Erro na API:", erro);
      return respostaErro("Erro interno do servidor.", 500);
    }
  },
};
