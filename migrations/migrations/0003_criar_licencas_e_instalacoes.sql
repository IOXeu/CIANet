-- =====================================================
-- CIANet — Licenças e instalações
-- =====================================================

CREATE TABLE IF NOT EXISTS licencas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chave TEXT NOT NULL UNIQUE,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT,
  plano_instalacoes INTEGER NOT NULL CHECK (plano_instalacoes IN (1, 3, 5, 7)),
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'expirada', 'bloqueada')),
  data_compra TEXT NOT NULL DEFAULT (datetime('now')),
  data_expiracao TEXT
);

CREATE TABLE IF NOT EXISTS instalacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  licenca_id INTEGER NOT NULL,
  nome_computador TEXT NOT NULL,
  dispositivo_id TEXT NOT NULL,
  sistema_operacional TEXT,
  versao_cianet TEXT,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'desativada')),
  ativada_em TEXT NOT NULL DEFAULT (datetime('now')),
  ultimo_acesso TEXT,
  FOREIGN KEY (licenca_id) REFERENCES licencas(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_licenca_dispositivo
ON instalacoes(licenca_id, dispositivo_id);

CREATE INDEX IF NOT EXISTS idx_licencas_chave ON licencas(chave);
CREATE INDEX IF NOT EXISTS idx_instalacoes_licenca ON instalacoes(licenca_id);
