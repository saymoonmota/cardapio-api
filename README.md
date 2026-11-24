# Cardapio API

Backend do **Cardapiaui** — painel de gerenciamento de pratos e contatos.

Construído com Node.js, Express, SQLite (better-sqlite3) e JWT.

---

## Requisitos

- Node.js 18+
- npm

---

## Instalação e primeiro uso

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente (edite os valores antes de rodar)
cp .env.example .env

# 3. Popule o banco com o admin e os pratos iniciais
npm run seed

# 4. Inicie o servidor em modo desenvolvimento
npm run dev
```

O servidor sobe em `http://localhost:3001` por padrão.

---

## Variáveis de ambiente (.env)

| Variável        | Descrição                              | Padrão                       |
|-----------------|----------------------------------------|------------------------------|
| `PORT`          | Porta do servidor                      | `3001`                       |
| `JWT_SECRET`    | Segredo para assinar tokens JWT        | *(obrigatório)*              |
| `ADMIN_EMAIL`   | E-mail do administrador inicial        | `admin@cardapiaui.com`       |
| `ADMIN_PASSWORD`| Senha do administrador inicial         | `admin123`                   |
| `FRONTEND_URL`  | Origem permitida pelo CORS             | `http://localhost:5173`      |

> **Produção:** troque `JWT_SECRET` e `ADMIN_PASSWORD` por valores seguros.

---

## Endpoints

### Auth

| Método | Rota             | Auth | Descrição                        |
|--------|------------------|------|----------------------------------|
| POST   | /api/auth/login  | Não  | Faz login e retorna token JWT    |
| GET    | /api/auth/me     | Não  | Valida e decodifica o token      |

**POST /api/auth/login**
```json
// Body
{ "email": "admin@cardapiaui.com", "senha": "admin123" }

// Resposta 200
{ "token": "eyJ...", "admin": { "id": 1, "email": "admin@cardapiaui.com" } }
```

---

### Pratos

| Método | Rota                        | Auth | Descrição                             |
|--------|-----------------------------|------|---------------------------------------|
| GET    | /api/pratos                 | Não  | Lista pratos ativos (uso do frontend) |
| GET    | /api/pratos/:id             | Não  | Detalhe de um prato ativo             |
| GET    | /api/pratos/admin/todos     | Sim  | Lista todos (inclusive inativos)      |
| POST   | /api/pratos                 | Sim  | Cria novo prato                       |
| PUT    | /api/pratos/:id             | Sim  | Atualiza prato                        |
| PATCH  | /api/pratos/:id/toggle      | Sim  | Ativa/desativa prato                  |
| DELETE | /api/pratos/:id             | Sim  | Remove prato definitivamente          |

**Campos do prato:**
```json
{
  "id": "carne-de-sol",
  "nome": "Carne de Sol",
  "categoria": "Carnes",
  "tempoPreparoMinutos": 75,
  "descricao": "...",
  "imagem": "/images/foto-carne-sol.jpg",
  "imagemAlt": "...",
  "avisoImagem": "...",
  "creditoImagem": "...",
  "fonteImagem": null,
  "ingredientes": ["Carne de sol", "Cebola"],
  "modoPreparo": "...",
  "acompanhamentos": ["Macaxeira frita"],
  "ativo": true
}
```

Categorias válidas: `Aves` | `Carnes` | `Peixes` | `Bebidas` | `Sobremesas` | `Petiscos`

---

### Contatos

| Método | Rota                        | Auth | Descrição                              |
|--------|-----------------------------|------|----------------------------------------|
| POST   | /api/contatos               | Não  | Envia sugestão (formulário do frontend)|
| GET    | /api/contatos               | Sim  | Lista contatos (paginado)              |
| GET    | /api/contatos/:id           | Sim  | Detalhe + marca como lido              |
| PATCH  | /api/contatos/:id/lido      | Sim  | Alterna status de leitura              |
| DELETE | /api/contatos/:id           | Sim  | Remove contato                         |

**GET /api/contatos** — query params:
- `page` (número da página, padrão: 1)
- `limit` (itens por página, máx: 50, padrão: 20)
- `naoLidos=true` (filtra apenas não lidos)

**POST /api/contatos**
```json
// Body
{ "nome": "Maria", "email": "maria@email.com", "mensagem": "Adoro o sarapatel da minha avó..." }

// Resposta 201
{ "id": 1, "nome": "Maria", "email": "maria@email.com", "mensagem": "...", "lido": false, "criadoEm": "..." }
```

---

### Dashboard

| Método | Rota           | Auth | Descrição               |
|--------|----------------|------|-------------------------|
| GET    | /api/dashboard | Sim  | Resumo geral do sistema |

**Resposta:**
```json
{
  "pratos": {
    "total": 10,
    "ativos": 10,
    "inativos": 0,
    "porCategoria": [
      { "categoria": "Carnes", "total": 4 },
      { "categoria": "Sobremesas", "total": 2 }
    ]
  },
  "contatos": {
    "total": 5,
    "naoLidos": 2
  },
  "ultimosContatos": [...],
  "ultimosPratos": [...]
}
```

---

### Health

```
GET /api/health
→ { "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

## Autenticação

Rotas protegidas exigem o header:
```
Authorization: Bearer <token>
```

O token expira em **8 horas**.

---

## Integração com o frontend

Para conectar o frontend ao backend real, altere `src/services/api.ts` do projeto **cardapiaui**:

```typescript
const API_URL = 'http://localhost:3001'

export async function buscarPratos(): Promise<Prato[]> {
  const res = await fetch(`${API_URL}/api/pratos`)
  if (!res.ok) throw new Error('Falha ao buscar pratos')
  return res.json()
}

export async function enviarContato(nome: string, email: string, mensagem: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/contatos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, mensagem }),
  })
  if (!res.ok) throw new Error('Falha ao enviar mensagem')
}
```

---

## Estrutura de arquivos

```
cardapio-api/
├── data/               ← banco SQLite gerado automaticamente
│   └── cardapio.db
├── src/
│   ├── middleware/
│   │   └── auth.ts     ← validação de JWT
│   ├── routes/
│   │   ├── auth.ts     ← login
│   │   ├── pratos.ts   ← CRUD de pratos
│   │   ├── contatos.ts ← recepção e gestão de contatos
│   │   └── dashboard.ts← resumo do painel
│   ├── db.ts           ← conexão e criação das tabelas
│   ├── seed.ts         ← popula banco inicial
│   ├── server.ts       ← ponto de entrada
│   └── types.ts        ← tipos TypeScript
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```
