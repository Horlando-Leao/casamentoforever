# CasamentoForever Hello World

Projeto de exemplo criado em `./casamentoforever` com:
- Frontend React + Vite + Tailwind CSS
- Estilo inspirado no `pwa-meve`
- Conexão com banco Turso via `@libsql/client` inspirada em `villadobosque`
- Roteiro simples para mobile e PWA

## Como rodar

1. Instale dependências:

```bash
cd casamentoforever
npm install
```

2. Preencha as variáveis no `.env` ou use `.env.example`:

```bash
TURSO_DATABASE_URL=libsql://<seu-db>.turso.io
TURSO_AUTH_TOKEN=<seu-token>
PORT=3001
```

3. Abra a API Turso:

```bash
npm run api
```

4. Em outro terminal, rode o frontend:

```bash
npm run dev
```

5. Acesse `http://localhost:5173`

## Estrutura

- `server.js` — backend Express que usa Turso/`@libsql/client`
- `src/App.tsx` — página Hello World mobile-friendly
- `src/index.css` — tokens de design e safe area para mobile
- `vite.config.ts` — proxy `/api` para o servidor local e configuração PWA

## Observações

- Se não houver `TURSO_DATABASE_URL`, o backend usa um banco local SQLite via `file:casamentoforever.db`
- O botão na página recarrega a mensagem `Hello World` via API
