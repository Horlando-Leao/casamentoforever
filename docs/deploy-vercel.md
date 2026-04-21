# Deploy no Vercel — Torres de Olinda

Guia completo sobre como funciona o deploy das APIs no Vercel e integração com Turso.

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Produção)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Edge: Frontend React SPA (dist/)                    │  │
│  │  - HTML + CSS + JS estático do Vite                 │  │
│  │  - Servido via CDN global                           │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │ fetch /api/*                            │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  Serverless Functions: Node.js Runtime (api/*)       │  │
│  │  - /api/auth.js                                      │  │
│  │  - /api/condominos.js                                │  │
│  │  - /api/fornecedores.js                              │  │
│  │  - /api/categorias.js                                │  │
│  │  - /api/tags.js                                      │  │
│  │  - /api/admin.js                                     │  │
│  │  - /api/fornecedores/[id]/tags.js (rota dinâmica)   │  │
│  │                                                      │  │
│  │  Cada request = uma instância do handler             │  │
│  │  Cold start: ~500ms; Warm: ~50ms                     │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │ @libsql/client                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  Database: Turso (SQLite remoto)                     │  │
│  │  - TURSO_DATABASE_URL                                │  │
│  │  - TURSO_AUTH_TOKEN                                  │  │
│  │  - Backup automático, replicação geográfica           │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Diferença chave**: Em produção, cada API é uma **serverless function** independente (não há Express server persistente). O `server.js` roda apenas em dev/Docker.

---

## Como Funciona em Produção (Vercel)

### 1. Request chegando

```
Cliente (navegador) → GET https://villa-do-bosque.vercel.app/api/fornecedores
     ↓
Vercel routing → /api/fornecedores
     ↓
Node.js runtime inicia api/fornecedores.js como serverless function
     ↓
handler(req, res) executa
     ↓
Resposta JSON retorna ao cliente
     ↓
Serverless function encerra (sem manter estado)
```

### 2. Padrão de handler (todos os `api/*.js`)

Cada arquivo em `api/` é uma **serverless function** com esta assinatura:

```javascript
export default async function handler(req, res) {
  // req = objeto com { method, body, query, headers, ... }
  // res = objeto com { status(), json(), end(), ... }

  if (req.method === 'GET') {
    // lidar com GET
    return res.status(200).json({ ... })
  }

  if (req.method === 'POST') {
    // lidar com POST
    return res.status(201).json({ ... })
  }

  if (req.method === 'PUT') {
    // lidar com PUT
    return res.status(200).json({ ... })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
```

**Importante**: Ao contrário do Express, **não há `next()` ou middleware global** em serverless functions. Cada função é independente.

### 3. Exemplo real: `api/auth.js`

```javascript
export default async function handler(req, res) {
  // GET: retorna dados do usuário autenticado
  if (req.method === 'GET') {
    const payload = verifyToken(req)
    if (!payload) return res.status(401).json({ error: 'Token inválido' })
    const condomino = await dbGet('SELECT * FROM condominos WHERE id = ?', payload.sub)
    return res.status(200).json(decryptCondomino(condomino))
  }

  // POST: faz login
  if (req.method === 'POST') {
    const { telefone } = req.body
    if (!telefone) return res.status(400).json({ error: 'Telefone obrigatório' })

    const digits = telefone.replace(/\D/g, '')
    const phoneHash = hash(digits)
    let condomino = await dbGet('SELECT * FROM condominos WHERE telefone_hash = ?', phoneHash)

    if (!condomino) {
      // Criar novo usuário
      await dbRun('INSERT INTO condominos (...) VALUES (...)', ...)
      condomino = await dbGet('SELECT * FROM condominos WHERE telefone_hash = ?', phoneHash)
    }

    const token = signToken(condomino.id)  // JWT
    return res.status(200).json({ ...decryptCondomino(condomino), token })
  }

  return res.status(405).end()
}
```

---

## Build & Deploy Pipeline

### 1. Local (npm run build)

```bash
$ npm run build

> vite build
> tsc --noEmit  (se houver typescript)

✔ built 3 files in 0.5s

dist/
  index.html      (SPA root)
  assets/
    main-xxx.js   (React + Vite bundle)
    style-xxx.css (Tailwind CSS)
```

**O Vite**:
- Bundle frontend (React, Tailwind, etc.)
- Minifica e otimiza
- **Não** toca em `api/*.js` (APIs ficam como está)

### 2. Deploy (vercel deploy ou git push)

Quando você faz push para GitHub (ou roda `vercel --prod`):

```
Git push → GitHub webhook → Vercel detecta
     ↓
Vercel inicia build
     ↓
$ npm run build   (Vite constrói dist/)
     ↓
Vercel escaneia:
  - dist/* → assets estáticos (Edge network)
  - api/* → serverless functions (Node.js runtime)
     ↓
Deploy pronto:
  - Frontend em https://villa-do-bosque.vercel.app/
  - API em https://villa-do-bosque.vercel.app/api/*
```

### 3. Arquivo de configuração: `vercel.json`

```json
{
  "buildCommand": "npm run build",         // Qual comando rodar
  "outputDirectory": "dist",                // Onde fica o build
  "framework": "vite",                      // Detecção automática
  "headers": [ ... ],                       // Security headers
  "rewrites": [ ... ]                       // URL rewrites (explicado abaixo)
}
```

---

## Roteamento & Rewrites

### Como URLs são roteadas em Vercel

```
https://villa-do-bosque.vercel.app/api/auth
     ↓ (vercel.json rewrites)
→ /api/auth.js (serverless function)
```

```
https://villa-do-bosque.vercel.app/api/admin/usuarios
     ↓ (vercel.json rewrites)
→ /api/admin?route=usuarios
  (redireciona para api/admin.js com query param)
```

```
https://villa-do-bosque.vercel.app/
     ↓ (vercel.json rewrites)
→ /index.html (SPA root, fallback)

https://villa-do-bosque.vercel.app/admin/moderar
     ↓ (não é /api/*, cai no fallback)
→ /index.html (React Router DOM pega de lá)
```

### Rewrite para admin dinâmico

```json
{
  "rewrites": [
    { "source": "/api/admin/:route", "destination": "/api/admin?route=:route" }
  ]
}
```

**Por quê?**: Admin tem um handler genérico (`api/admin.js`) que lida com múltiplas sub-rotas:
- `/api/admin/usuarios` → `api/admin.js` recebe `req.query.route = 'usuarios'`
- `/api/admin/fornecedores` → `api/admin.js` recebe `req.query.route = 'fornecedores'`

---

## Variáveis de Ambiente em Produção

### Configurar no Vercel Dashboard

1. Acesse projeto no Vercel
2. Settings → **Environment Variables**
3. Adicione cada variável:

| Variável | Valor | Escopo |
|----------|-------|--------|
| `ENCRYPTION_KEY` | 32+ chars aleatórios | Production |
| `JWT_SECRET` | 32+ chars aleatórios | Production |
| `TURSO_DATABASE_URL` | `libsql://xxxxx.turso.io` | Production |
| `TURSO_AUTH_TOKEN` | `eyJ...` | Production |
| `INITIAL_ADMIN_PHONE` | `+55159999...` (opcional) | Production |

### Verificar no CLI

```bash
vercel env list                    # Listar variáveis
vercel env add ENCRYPTION_KEY production  # Adicionar interativamente
vercel env pull                    # Puxar para .env.local (dev)
```

### Acesso dentro das funções

```javascript
// Em qualquer api/*.js
const key = process.env.ENCRYPTION_KEY
const dbUrl = process.env.TURSO_DATABASE_URL
const token = process.env.TURSO_AUTH_TOKEN

if (!key || !dbUrl || !token) {
  throw new Error('Variáveis de ambiente faltando')
}
```

---

## Fluxo Completo: Login + Criar Fornecedor

### Passo 1: Login (POST /api/auth)

```javascript
// Frontend (src/lib/api.js)
const response = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ telefone: '5515999999999' })
})
const { token, nivel } = await response.json()
localStorage.setItem('villa_session', JSON.stringify({ token }))
```

```javascript
// Backend (api/auth.js)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { telefone } = req.body
    const phoneHash = hash(telefone.replace(/\D/g, ''))
    
    // Buscar ou criar
    let condomino = await dbGet(
      'SELECT * FROM condominos WHERE telefone_hash = ? AND deleted_at IS NULL',
      phoneHash
    )
    if (!condomino) {
      await dbRun(
        'INSERT INTO condominos (telefone, telefone_hash, role) VALUES (?, ?, ?)',
        encrypt(telefone),
        phoneHash,
        'condomino'
      )
      condomino = await dbGet('SELECT * FROM condominos WHERE telefone_hash = ?', phoneHash)
    }

    // Gerar JWT
    const token = signToken(condomino.id)  // JWT com { sub: condomino.id, exp: ... }
    
    // Audit
    await audit(req, { action: 'login', entity: 'condomino', entityId: condomino.id })

    return res.status(200).json({
      id: condomino.id,
      nivel: condomino.nivel,
      token
    })
  }
}
```

**O que acontece**:
1. Serverless function inicia
2. Query: `SELECT` usuario por telefone_hash
3. Se não existe: `INSERT` novo usuario
4. Gera JWT `eyJ...` (válido por 7 dias)
5. Registra auditoria em `audit_log`
6. Retorna token ao cliente
7. Cliente salva em `localStorage`
8. Serverless function encerra

### Passo 2: Criar Fornecedor (POST /api/fornecedores)

```javascript
// Frontend (src/components/NovoFornecedor.jsx)
const token = localStorage.getItem('villa_session').token
const response = await fetch('/api/fornecedores', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ← JWT
  },
  body: JSON.stringify({
    nome: 'Dirley',
    telefone: '5515997194756',
    categorias: [1, 2],  // IDs de categorias
    tags: ['bom preço', 'rápido']  // nomes de tags
  })
})
```

```javascript
// Backend (api/fornecedores.js)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // 1) Verificar autenticação
    const ctx = await requirePrata(req, res)
    if (!ctx) return  // Resposta já enviada (401/403)
    const { user } = ctx  // { id, role, nivel }

    // 2) Validar input
    const { nome, telefone, descricao, categorias, tags } = req.body
    if (!nome || !telefone) return res.status(400).json({ error: 'Faltam campos' })

    // 3) Criptografar dados sensíveis
    const encNome = encrypt(nome)
    const encTelefone = encrypt(telefone)
    const encDescricao = encrypt(descricao)

    // 4) Inserir fornecedor
    const { lastInsertRowid } = await dbRun(
      'INSERT INTO fornecedores (nome, telefone, descricao, indicado_por) VALUES (?, ?, ?, ?)',
      encNome,
      encTelefone,
      encDescricao,
      user.id  // Quem criou
    )
    const fornecedorId = Number(lastInsertRowid)

    // 5) Inserir categorias
    for (const catId of categorias) {
      await dbRun(
        'INSERT INTO fornecedor_categorias (fornecedor_id, categoria_id) VALUES (?, ?)',
        fornecedorId,
        catId
      )
    }

    // 6) Inserir tags (com status 'pendente' se novas)
    for (const tagNome of tags) {
      let tag = await dbGet('SELECT id FROM tags WHERE nome = ?', tagNome)
      if (!tag) {
        // Tag nova = pendente
        await dbRun(
          'INSERT INTO tags (nome, status) VALUES (?, ?)',
          tagNome,
          'pendente'
        )
        tag = await dbGet('SELECT id FROM tags WHERE nome = ?', tagNome)
      }
      await dbRun(
        'INSERT INTO fornecedor_tags (fornecedor_id, tag_id) VALUES (?, ?)',
        fornecedorId,
        tag.id
      )
    }

    // 7) Audit
    await audit(req, {
      action: 'criar',
      entity: 'fornecedor',
      entityId: fornecedorId,
      details: JSON.stringify({ nome, telefone })
    })

    return res.status(201).json({ id: fornecedorId })
  }
}
```

**O que acontece**:
1. Serverless function inicia
2. Verifica JWT no header `Authorization: Bearer ...`
3. Valida role/nivel (é `prata` ou `super`?)
4. Valida dados de entrada
5. **Múltiplas queries** (INSERT fornecedor, INSERT categorias, INSERT tags)
6. Registra auditoria
7. Retorna `{ id }`
8. Serverless function encerra

---

## Diferenças: Docker/Local vs Vercel

| Aspecto | Docker/Local (server.js) | Vercel (serverless) |
|---------|--------------------------|-------------------|
| **Startup** | Express app roda uma vez | Cada request = novo handler |
| **Middleware** | Global (app.use) | Em cada function |
| **Estado persistente** | Variáveis locais | ❌ Não existe (stateless) |
| **Conexão BD** | Aberta continuamente | Nova conexão por request |
| **Timeout** | Sem limite | 60s (função) |
| **Cold start** | 0 (sempre warm) | ~500ms (primeira vez) |
| **Scale** | Manual | Automático (Vercel) |

---

## Troubleshooting

### 1) "Cannot find module" em produção

**Causa**: Dependências não foram instaladas.

**Solução**:
```bash
npm install          # Local
vercel redeploy      # Force rebuild em Vercel
```

### 2) "Token inválido" após deploy

**Causa**: `JWT_SECRET` mudou ou não está sincronizado.

**Solução**:
```bash
# Verificar JWT_SECRET em Vercel
vercel env list

# Confirmar que é a mesma localmente
cat .env | grep JWT_SECRET

# Se diferente, atualizar
vercel env add JWT_SECRET production  # Remove a antiga, adiciona nova
vercel redeploy
```

### 3) Banco de dados vazio em produção

**Causa**: Turso não foi configurado ou `ensureDb()` não rodou.

**Solução**:
```bash
# 1) Verificar TURSO_DATABASE_URL no Vercel
vercel env list

# 2) Testar conexão
node -e "import('./api/_db.js').then(m => m.ensureDb()).then(() => console.log('OK'))"

# 3) Se schema está vazio, rodar migrate
node scripts/migrate-to-turso.js
```

### 4) Cold start muito lento (>3s)

**Causa**: Bundle grande ou timeout de conexão ao Turso.

**Solução**:
- Verificar tamanho do bundle: `npm run build && du -sh dist/`
- Aumentar timeout de conexão no `api/_db.js`
- Usar Turso regional mais próximo

### 5) "Vercel Functions size exceeded 50MB"

**Causa**: `node_modules` muito grande.

**Solução**:
```json
// vercel.json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

---

## Checklist: Antes de Deploy em Produção

- [ ] `npm run check` passa (lint + testes)
- [ ] `npm run build` sem erros
- [ ] Variáveis de ambiente configuradas no Vercel:
  - [ ] `ENCRYPTION_KEY` (32+ chars)
  - [ ] `JWT_SECRET` (32+ chars, diferente de `ENCRYPTION_KEY`)
  - [ ] `TURSO_DATABASE_URL` (libsql://...)
  - [ ] `TURSO_AUTH_TOKEN` (token do Turso)
  - [ ] `INITIAL_ADMIN_PHONE` (opcional, apenas primeira vez)
- [ ] Dados migrados ao Turso (via `scripts/migrate-to-turso.js`)
- [ ] Backup local feito (`/tmp/condominio_backup.db`)
- [ ] Testes de integração passando contra Turso (não só SQLite local)
- [ ] URLs de API adicionadas ao CORS (se aplicável)
- [ ] Security headers presentes no `vercel.json`

---

## Referências

- [Vercel Functions Docs](https://vercel.com/docs/functions/serverless-functions)
- [Node.js Runtime](https://vercel.com/docs/functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Rewrites & Redirects](https://vercel.com/docs/edge-middleware/redirects)
- Projeto: `vercel.json`, `api/*.js`, `server.js`, `docs/checklists.md`
