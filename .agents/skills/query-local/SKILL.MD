---
name: query-local
description: Executa queries SQL diretamente no banco Postgres local (gruvi-concierge-orquestrador) para validar/verificar dados ou tabelas
---

# **PostgreSQL Local Query**

Use esta skill para consultar a base de dados local de forma rápida.

## **Ligação**

**String de Conexão:**

postgresql://gco\_hml\_user:gruvi\_concierge\_orquestrador\_hml@localhost:5432/gruvi-concierge-orquestrador

## **Como Executar**

Sempre que precisar de consultar dados, execute o comando abaixo no terminal:

psql
"postgresql://gco\_hml\_user:gruvi\_concierge\_orquestrador\_hml@localhost:5432/gruvi-concierge-orquestrador"
\-P pager=off \-c "\<\<SUA\_QUERY\>\>"

## **Regras Rápidas**

- **Output:** Use sempre \-P pager=off para o resultado aparecer direto no chat.
- **Segurança:** Nunca execute DELETE ou DROP sem pedir confirmação explícita ao
  utilizador.
- **Performance:** Adicione LIMIT 10 em tabelas desconhecidas.

## **Exemplos**

- SELECT \* FROM users LIMIT 5;
- \\dt (para listar tabelas)
- SELECT count(\*) FROM webhooks;
