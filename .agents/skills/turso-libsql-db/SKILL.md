---
name: turso-libsql-db
description: Implementação do Turso como banco de dados remoto, utilizando o cliente libSQL para garantir compatibilidade entre ambientes locais e remotos. Inclui práticas recomendadas para migração de dados, operações CRUD e segurança.
---

# SKILL: Turso + libSQL — SQLite Remoto & Persistência Gerenciada

**Trigram**: Banco de dados remoto, Turso, libSQL, migrações de dados, persistência serverless, SQLite em produção.

**Objetivo**: Implementar e gerenciar o Turso como banco de dados principal, utilizando o cliente libSQL para garantir compatibilidade entre ambientes locais (desenvolvimento) e remotos (produção).

---

## O que é Turso

O **Turso** é uma plataforma de banco de dados baseada no **libSQL**, um fork open-source do SQLite. Ele permite levar a simplicidade e a performance do SQLite para a nuvem.

* ✅ **Baseado em SQLite**: Mesma sintaxe SQL, tipos de dados e leveza.
* ✅ **Edge-ready**: Baixíssima latência, ideal para plataformas como Vercel, Netlify e Cloudflare Workers.
* ✅ **libSQL Client**: Driver unificado que alterna entre um arquivo local `.db` e uma conexão via HTTP/WebSockets.
* ✅ **Escalabilidade**: Suporta replicação global para colocar os dados perto do usuário.

### Comparativo: Local vs. Remoto

| Aspecto | SQLite Local (Arquivo) | Turso (Remoto) |
| :--- | :--- | :--- |
| **Ambiente ideal** | Desenvolvimento / CI | Produção / Preview |
| **Conexão** | Sistema de Arquivos | Protocolo libsql (HTTP) |
| **Concorrência** | Limitada (Escrita única) | Alta (Distribuído) |
| **Backup** | Manual / Snapshot | Automatizado pela plataforma |

---

## Arquitetura de Conexão Híbrida

Para garantir que o código funcione em qualquer lugar, utiliza-se o padrão de **Dual-Mode Connection**.



### Estrutura do Módulo de Conexão (`db.js`)

```javascript
import { createClient } from '@libsql/client';

let client = null;

export function getClient() {
  if (client) return client;

  // Se houver URL do Turso, usa remoto. Caso contrário, usa arquivo local.
  const url = process.env.DATABASE_URL || `file:${process.env.LOCAL_DB_PATH || 'local.db'}`;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  client = createClient({ url, authToken });
  return client;
}
```

---

## Setup e Configuração

### 1. Variáveis de Ambiente
Configure o seu arquivo `.env` para alternar entre os modos:

```bash
# Para Desenvolvimento Local
LOCAL_DB_PATH="dev.db"

# Para Produção (Turso)
DATABASE_URL="libsql://sua-db-nome-usuario.turso.io"
DATABASE_AUTH_TOKEN="seu_token_gerado_no_painel"
```

### 2. Inicialização de Schema (Idempotência)
Sempre verifique se a estrutura básica existe antes de realizar operações:

```javascript
export async function ensureSchema() {
  const db = getClient();
  // Exemplo: Verificar se uma tabela essencial existe
  const tableExists = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
  );

  if (tableExists.rows.length === 0) {
    // Executa script DDL (Data Definition Language)
    await db.execute(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
}
```

---

## Operações Comuns (CRUD Generatriz)

### 1. Leitura de Múltiplos Registros
```javascript
export async function getAll(tableName, limit = 10) {
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT * FROM ${tableName} LIMIT ?`,
    args: [limit]
  });
  return result.rows;
}
```

### 2. Inserção com Prevenção de SQL Injection
**Nunca** use interpolação de strings para valores. Use o array `args`.

```javascript
export async function createItem(data) {
  const db = getClient();
  const result = await db.execute({
    sql: "INSERT INTO items (name, category, value) VALUES (?, ?, ?)",
    args: [data.name, data.category, data.value]
  });
  return result.lastInsertRowid;
}
```

### 3. Transações Atômicas
Essencial para manter a integridade quando múltiplas tabelas são afetadas.

```javascript
const db = getClient();
const transaction = await db.transaction("write");

try {
  await transaction.execute("INSERT INTO logs (action) VALUES ('update')");
  await transaction.execute("UPDATE stats SET count = count + 1");
  await transaction.commit();
} catch (e) {
  await transaction.rollback();
  throw e;
}
```

---

## Migração de Dados (Local → Remoto)

Para subir dados do seu ambiente de teste para o Turso:

1.  **Dump do Local**: Gere um arquivo `.sql` do seu banco local.
2.  **CLI do Turso**: Utilize a CLI oficial para importar.
    ```bash
    turso db shell meu-banco < backup_local.sql
    ```
3.  **Scripts de Sync**: Você pode criar um script Node.js que lê de um `sqlite3.Database` local e executa `INSERTs` no cliente libSQL remoto.

---

## Boas Práticas e Segurança

* **Soft Deletes**: Em vez de `DELETE`, use uma coluna `deleted_at` para evitar perda acidental de dados.
* **WAL Mode**: Se estiver rodando localmente com muita concorrência, certifique-se que o SQLite está em modo *Write-Ahead Logging*.
* **Exposição de Token**: O `DATABASE_AUTH_TOKEN` tem privilégios totais. Nunca o exponha no front-end; as chamadas ao banco devem ser feitas via Server-Side (API Routes, Actions, etc).
* **Paginação**: SQLite é rápido, mas buscar 100k linhas via rede (remoto) causará timeout. Use `LIMIT` e `OFFSET`.

---

## Troubleshooting (Erros Comuns)

| Erro | Causa Provável | Solução |
| :--- | :--- | :--- |
| `libsql_error: URL_INVALID` | Prefixo faltando na URL. | Certifique-se que começa com `libsql://` ou `https://`. |
| `database is locked` | Conflito de escrita local. | Verifique se não há outro processo segurando o arquivo `.db`. |
| `401 Unauthorized` | Token expirado ou incorreto. | Gere um novo token via `turso db tokens create`. |
| `no such table` | Schema não sincronizado. | Execute seu script de `ensureSchema()` ou migração. |

---

### Checklist de Deploy
- [ ] Variáveis de ambiente configuradas no provedor de Cloud.
- [ ] Script de migração de schema testado.
- [ ] Conexão validada via `SELECT 1`.
- [ ] Backups automáticos habilitados no painel do Turso.

Como você pretende estruturar as camadas de acesso a dados (DAL) nesse projeto?