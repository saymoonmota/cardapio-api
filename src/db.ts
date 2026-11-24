import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(__dirname, '..', 'data')
const DB_PATH = path.join(DB_DIR, 'cardapio.db')

// Garante que a pasta data/ existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const db = new Database(DB_PATH)

// Habilita WAL para melhor performance em leituras concorrentes
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─── Criação das tabelas ─────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    NOT NULL UNIQUE,
    senha_hash TEXT    NOT NULL,
    criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pratos (
    id                    TEXT    PRIMARY KEY,
    nome                  TEXT    NOT NULL,
    categoria             TEXT    NOT NULL CHECK(categoria IN ('Aves','Carnes','Peixes','Bebidas','Sobremesas','Petiscos')),
    tempo_preparo_minutos INTEGER NOT NULL DEFAULT 0,
    descricao             TEXT    NOT NULL DEFAULT '',
    imagem                TEXT    NOT NULL DEFAULT '',
    imagem_alt            TEXT    NOT NULL DEFAULT '',
    aviso_imagem          TEXT    NOT NULL DEFAULT '',
    credito_imagem        TEXT    NOT NULL DEFAULT '',
    fonte_imagem          TEXT,
    ingredientes          TEXT    NOT NULL DEFAULT '[]',
    modo_preparo          TEXT    NOT NULL DEFAULT '',
    acompanhamentos       TEXT    NOT NULL DEFAULT '[]',
    ativo                 INTEGER NOT NULL DEFAULT 1,
    criado_em             TEXT    NOT NULL DEFAULT (datetime('now')),
    atualizado_em         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contatos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT    NOT NULL,
    email     TEXT    NOT NULL,
    mensagem  TEXT    NOT NULL,
    lido      INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_contatos_lido     ON contatos(lido);
  CREATE INDEX IF NOT EXISTS idx_contatos_criado   ON contatos(criado_em DESC);
  CREATE INDEX IF NOT EXISTS idx_pratos_categoria  ON pratos(categoria);
  CREATE INDEX IF NOT EXISTS idx_pratos_ativo      ON pratos(ativo);
`)

export default db
