# Cardapio API — Backend

API REST do **Cardapiaui** para gerenciamento de pratos, contatos e autenticação administrativa.

🌐 **Deploy:** [https://cardapio-api-8p32.onrender.com](https://cardapio-api-8p32.onrender.com)  
🔗 **Frontend:** [https://cardapiaui.netlify.app](https://cardapiaui.netlify.app)

---

## Tecnologias

- Node.js 18+ com TypeScript
- Express 5
- SQLite via better-sqlite3
- JWT (jsonwebtoken) + bcryptjs
- dotenv, cors

---

## Instalação e execução local

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env
# edite o .env com seus valores

# 3. Inicie em modo desenvolvimento
npm run dev
```

O servidor sobe em `http://localhost:3001`.

> O banco SQLite é criado automaticamente em `data/cardapio.db`.  
> O seed (admin + pratos) roda automaticamente ao iniciar o servidor.

Outros comandos:

```bash
npm run build      # compila TypeScript
npm start          # inicia sem nodemon
npm run seed       # roda o seed manualmente
```

---

## Variáveis de ambiente

| Variável          | Descrição                            | Padrão                        |
|-------------------|--------------------------------------|-------------------------------|
| `PORT`            | Porta do servidor                    | `3001`                        |
| `JWT_SECRET`      | Segredo para assinar tokens JWT      | *(obrigatório em produção)*   |
| `ADMIN_EMAIL`     | E-mail do administrador inicial      | `admin@cardapiaui.com`        |
| `ADMIN_PASSWORD`  | Senha do administrador inicial       | `admin123`                    |
| `FRONTEND_URL`    | Origem permitida pelo CORS           | `http://localhost:5173`       |

> **Produção:** troque `JWT_SECRET` e `ADMIN_PASSWORD` por valores seguros nas variáveis de ambiente do Render.

---

## Endpoints

### Health

```
GET /api/health
→ { "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

### Auth

| Método | Rota              | Auth | Descrição                      |
|--------|-------------------|------|--------------------------------|
| POST   | `/api/auth/login` | Não  | Login e retorno do token JWT   |
| GET    | `/api/auth/me`    | Sim  | Valida e decodifica o token    |

**POST /api/auth/login**
```json
// Body
{ "email": "admin@cardapiaui.com", "senha": "admin123" }

// Resposta 200
{ "token": "eyJ...", "admin": { "id": 1, "email": "admin@cardapiaui.com" } }
```

---

### Pratos

| Método | Rota                       | Auth | Descrição                        |
|--------|----------------------------|------|----------------------------------|
| GET    | `/api/pratos`              | Não  | Lista pratos ativos              |
| GET    | `/api/pratos/:id`          | Não  | Detalhe de um prato ativo        |
| GET    | `/api/pratos/admin/todos`  | Sim  | Lista todos (inclusive inativos) |
| POST   | `/api/pratos`              | Sim  | Cria novo prato                  |
| PUT    | `/api/pratos/:id`          | Sim  | Atualiza prato existente         |
| PATCH  | `/api/pratos/:id/toggle`   | Sim  | Ativa ou desativa um prato       |
| DELETE | `/api/pratos/:id`          | Sim  | Remove prato definitivamente     |

Categorias válidas: `Aves` | `Carnes` | `Peixes` | `Bebidas` | `Sobremesas` | `Petiscos`

---

### Contatos

| Método | Rota                        | Auth | Descrição                              |
|--------|-----------------------------|------|----------------------------------------|
| POST   | `/api/contatos`             | Não  | Envia sugestão pelo formulário         |
| GET    | `/api/contatos`             | Sim  | Lista contatos paginados               |
| GET    | `/api/contatos/:id`         | Sim  | Detalhe + marca como lido              |
| PATCH  | `/api/contatos/:id/lido`    | Sim  | Alterna status de leitura              |
| DELETE | `/api/contatos/:id`         | Sim  | Remove contato                         |

**GET /api/contatos** — query params:

| Param        | Descrição                        | Padrão |
|--------------|----------------------------------|--------|
| `page`       | Número da página                 | `1`    |
| `limit`      | Itens por página (máx 50)        | `20`   |
| `naoLidos`   | `true` para filtrar não lidos    | —      |

**POST /api/contatos**
```json
// Body
{ "nome": "Maria", "email": "maria@email.com", "mensagem": "Adoro o sarapatel da minha avó..." }

// Resposta 201
{ "id": 1, "nome": "Maria", "email": "maria@email.com", "mensagem": "...", "lido": false, "criadoEm": "..." }
```

---

### Dashboard

| Método | Rota             | Auth | Descrição               |
|--------|------------------|------|-------------------------|
| GET    | `/api/dashboard` | Sim  | Resumo geral do sistema |

```json
{
  "pratos": { "total": 10, "ativos": 10, "inativos": 0, "porCategoria": [...] },
  "contatos": { "total": 5, "naoLidos": 2 },
  "ultimosContatos": [...],
  "ultimosPratos": [...]
}
```

---

## Autenticação

Rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

O token expira em **8 horas**.

---

## Estrutura de arquivos

```
cardapio-api/
├── data/
│   └── cardapio.db          ← banco SQLite (gerado automaticamente)
├── src/
│   ├── middleware/
│   │   └── auth.ts          ← validação JWT
│   ├── routes/
│   │   ├── auth.ts          ← login e validação de token
│   │   ├── pratos.ts        ← CRUD de pratos
│   │   ├── contatos.ts      ← recepção e gestão de sugestões
│   │   └── dashboard.ts     ← resumo do painel admin
│   ├── db.ts                ← conexão SQLite e criação das tabelas
│   ├── seed.ts              ← popula admin e pratos iniciais
│   ├── server.ts            ← ponto de entrada do servidor
│   └── types.ts             ← tipos TypeScript
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Deploy (Render)

O repositório está conectado ao Render com deploy automático a cada push na branch `main`.

Configurações no painel do Render:
- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Environment variables:** `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`

> O banco SQLite no Render usa disco efêmero no free tier — os dados podem ser perdidos ao reiniciar o serviço. Para persistência em produção, considere migrar para PostgreSQL (ex: Neon ou Supabase).
