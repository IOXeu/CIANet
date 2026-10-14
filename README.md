# CIANet

CIANet é uma plataforma para conexão entre clientes e empresas prestadoras de serviços.

A API permite cadastrar usuários e empresas, gerenciar serviços, criar agendamentos e registrar avaliações.

## Funcionalidades

- Cadastro e login de usuários
- Cadastro de empresas prestadoras
- Cadastro e listagem de serviços
- Criação de agendamentos
- Listagem de agendamentos por cliente e empresa
- Atualização do status do agendamento
- Avaliação de serviços concluídos
- Cálculo da média de avaliações por empresa

## Tecnologias

- Cloudflare Workers
- TypeScript
- Cloudflare D1
- Wrangler

## Estrutura do projeto

```text
CIANet/
├─ src/
│  ├─ index.ts
│  ├─ db.ts
│  ├─ auth.ts
│  ├─ empresas.ts
│  ├─ servicos.ts
│  ├─ agendamentos.ts
│  └─ avaliacoes.ts
├─ migrations/
│  └─ 0001_criar_estrutura_inicial.sql
├─ README.md
├─ package.json
├─ tsconfig.json
└─ wrangler.jsonc
```

## Rotas da API

### Sistema

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Verifica se a API está online |

### Usuários

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/usuarios/cadastro` | Cadastra um usuário |
| POST | `/api/usuarios/login` | Realiza login |

### Empresas

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/empresas` | Cadastra uma empresa |
| GET | `/api/empresas` | Lista empresas |
| GET | `/api/empresas/:id` | Busca empresa por ID |
| GET | `/api/empresas/:id/servicos` | Lista serviços da empresa |
| GET | `/api/empresas/:id/avaliacoes` | Lista avaliações da empresa |
| GET | `/api/empresas/:id/media-avaliacoes` | Média das avaliações |

### Serviços

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/servicos` | Cadastra um serviço |
| GET | `/api/servicos/:id` | Busca serviço por ID |

### Agendamentos

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/agendamentos` | Cria agendamento |
| GET | `/api/clientes/:id/agendamentos` | Lista agendamentos do cliente |
| GET | `/api/empresas/:id/agendamentos` | Lista agendamentos da empresa |
| PATCH | `/api/agendamentos/:id/status` | Atualiza status |

### Avaliações

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/avaliacoes` | Cria avaliação |

## Banco de dados

O projeto utiliza o Cloudflare D1.

As tabelas principais são:

- `usuarios`
- `empresas`
- `servicos`
- `agendamentos`
- `avaliacoes`

As migrações ficam na pasta `migrations/`.
