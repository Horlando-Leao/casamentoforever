Esta é a versão genérica da doc de **Deploy no Vercel**, focada na arquitetura de **Serverless Functions** com integração de banco de dados remoto (libSQL/Turso). Ela remove o contexto de "Torres de Olinda" e foca no padrão arquitetural aplicável a qualquer aplicação moderna de stack única (Monorepo ou API+Frontend).

---

# SKILL: Vercel Deploy — Serverless Architecture & libSQL Integration

**Trigram**: Deploy Vercel, Serverless Functions, Vite/React Build, Configuração de Ambiente, Ciclo de Vida da Requisição.

**Objetivo**: Compreender o modelo mental de execução serverless, configurar o pipeline de deploy contínuo e garantir a integração segura entre a camada de API e o banco de dados remoto.

---

## Visão Geral da Arquitetura

Em um deploy Vercel, a aplicação deixa de ser um servidor "ligado 24/7" e passa a ser um conjunto de recursos distribuídos:



```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Produção)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Edge Network: Frontend SPA (Pasta dist/)            │  │
│  │  - HTML, CSS, JS e Imagens estáticas                │  │
│  │  - Cache global (CDN)                                │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │ chamadas HTTP /api/* │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  Serverless Functions: Node.js Runtime (Pasta api/*)  │  │
│  │  - Cada arquivo .js vira um endpoint individual      │  │
│  │  - Execução on-demand (Stateless)                    │  │
│  │  - Cold start: ~500ms; Warm: ~50ms                   │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │ Conexão via Driver (ex: @libsql/client) │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │  External DB: Turso / SQLite Remoto                  │  │
│  │  - Persistência de dados fora do Vercel              │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

> **Diferença Crítica**: O servidor Express (`server.js`) geralmente só é usado em desenvolvimento. Em produção, o Vercel utiliza o roteamento de arquivos dentro da pasta `api/`.

---

## Anatomia de uma Serverless Function

Ao contrário de um servidor tradicional que gerencia rotas internamente, no Vercel, o **sistema de arquivos é o roteador**.

### 1. O Handler Padrão
Cada arquivo em `api/*.js` deve exportar uma função `default`:

```javascript
// api/items.js -> Acessível em /api/items
export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Lógica de leitura
      return res.status(200).json({ data: [] });
    case 'POST':
      // Lógica de criação
      return res.status(201).json({ success: true });
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
```

### 2. Ciclo de Vida: Cold Start vs. Warm


As funções são "congeladas" quando não estão em uso. O primeiro acesso após um tempo de inatividade pode ser levemente mais lento (**Cold Start**), enquanto acessos subsequentes aproveitam a instância já ligada (**Warm**).

---

## Pipeline de Build e Deploy

O Vercel utiliza um workflow baseado em Git para automatizar o ciclo de entrega.



### 1. Build Local (`npm run build`)
O comando de build (geralmente do Vite) prepara o frontend:
* Compila JSX/TypeScript.
* Minifica CSS e JS.
* Gera a pasta `dist/` com o conteúdo estático.

### 2. Deploy no Vercel
Ao detectar um `git push`, o Vercel:
1. Executa o script de build definido no `package.json`.
2. Sobe a pasta `dist/` para os servidores de borda (CDN).
3. Transforma os scripts em `api/` em funções Lambda/Serverless.

---

## Configuração: `vercel.json`

Este arquivo controla como o Vercel interpreta seu projeto.

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { 
      "source": "/api/resource/:id", 
      "destination": "/api/resource.js?id=:id" 
    },
    { 
      "source": "/(.*)", 
      "destination": "/index.html" 
    }
  ]
}
```
* **Rewrites de API**: Permite criar rotas dinâmicas ou amigáveis sem mudar a estrutura de arquivos.
* **SPA Fallback**: Garante que rotas do Frontend (ex: `/dashboard`) sejam tratadas pelo React Router dentro do `index.html`.

---

## Gerenciamento de Variáveis de Ambiente

As variáveis de ambiente são cruciais para a segurança, pois impedem que segredos (como senhas de banco) fiquem no código.

| Variável | Exemplo de Uso |
| :--- | :--- |
| `DATABASE_URL` | String de conexão com o Turso/libSQL. |
| `AUTH_SECRET` | Chave para assinar tokens JWT. |
| `API_KEY` | Credenciais de serviços de terceiros (E-mail, SMS). |

### Como configurar:
1. No Dashboard do Vercel: `Project Settings` > `Environment Variables`.
2. No CLI: `vercel env add NAME_OF_VAR`.
3. Localmente: Use um arquivo `.env` (nunca o envie para o Git).

---

## Comparação: Docker/Local vs. Vercel

| Característica | Local (Node/Docker) | Produção (Vercel) |
| :--- | :--- | :--- |
| **Persistência em Memória** | Sim (Variáveis globais funcionam) | Não (Funções são destruídas após o uso) |
| **Roteamento** | Gerenciado pelo Express/Fastify | Gerenciado pelo Sistema de Arquivos |
| **Banco de Dados** | SQLite local (arquivo `.db`) | Banco Remoto (Turso via libSQL) |
| **Tempo de Execução** | Infinito (ou até crashar) | Geralmente limitado a 10s-60s |

---

## Checklist de Deploy em Produção

Antes de considerar o deploy como concluído, verifique:

- [ ] **Variáveis de Ambiente**: Todas as chaves do `.env` local foram replicadas no painel do Vercel?
- [ ] **Build Check**: O comando `npm run build` roda localmente sem erros de lint ou tipos?
- [ ] **Conexão com Banco**: A URL do banco remoto (`libsql://...`) está correta e com o token de autenticação?
- [ ] **Rewrites**: O `vercel.json` está configurado para não quebrar o roteamento do frontend (SPA)?
- [ ] **Segurança**: As funções sensíveis (POST/PUT/DELETE) possuem verificação de token ou permissão?

---

### Referências Úteis
* [Vercel Serverless Functions Documentation](https://vercel.com/docs/functions)
* [libSQL JS SDK Guide](https://docs.turso.tech/sdk/js)
* [Vite Production Guide](https://vitejs.dev/guide/build.html)

Dada a natureza **stateless** (sem estado) das Serverless Functions, como você planeja gerenciar sessões de usuário ou cache de dados sem depender de variáveis globais no servidor?