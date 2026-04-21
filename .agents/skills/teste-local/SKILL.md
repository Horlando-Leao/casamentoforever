---
name: teste-local
description: Guia completo para testar uma feature localmente: orienta quando usar as skills arquitetura, query-local e test-api durante o ciclo de desenvolvimento e validação local.
compatibility: Requer servidor NestJS rodando em localhost:3001 e Postgres local acessível
---

# **Teste Local — Orquestração de Skills**

Use esta skill quando quiser testar ou validar uma feature completa no ambiente local. Ela **não substitui** as outras skills — ela indica **quando e por que** chamar cada uma delas.

---

## Skills envolvidas

| Skill | Quando chamar |
|---|---|
| **arquitetura** | Antes de escrever ou revisar qualquer código |
| **query-local** | Para inspecionar o estado do banco após uma operação |
| **test-api** | Para gerar e executar o curl de teste do endpoint |

---

## Fluxo de teste local

### Etapa 1 — Revisar o código antes de testar

> **Use a skill `arquitetura`**

Antes de executar qualquer teste, verifique se a implementação segue as regras do projeto:

- A entidade de domínio estende `Entity` e tem comportamento?
- O handler retorna `Either<string, void>`?
- O controller trata o `Either` antes de responder?
- O DTO tem decorators do Swagger?
- A validação Zod está no controller?

Se algo estiver fora do padrão, corrija antes de prosseguir. Testar código fora das regras de arquitetura gera falsos negativos.

---

### Etapa 2 — Testar o endpoint via HTTP

> **Use a skill `test-api`**

Com o servidor rodando (`npm run start:dev` ou equivalente), gere o curl para o endpoint que deseja testar:

1. Informe à skill qual endpoint quer testar (ex.: "criação de atendimento")
2. A skill buscará a spec em `http://localhost:3001/api/docs.json`
3. Execute o curl gerado no terminal
4. Observe o status HTTP e o corpo da resposta

**Sinais de problema:**
- `500` → erro interno, verifique os logs do servidor
- `400` → payload inválido, revise o body do curl
- `401/403` → token ausente ou inválido, substitua o `<TOKEN>` por um válido
- `404` → endpoint não registrado no módulo ou rota errada

---

### Etapa 3 — Verificar o efeito no banco de dados

> **Use a skill `query-local`**

Após executar o curl com sucesso (status `2xx`), confirme que os dados foram persistidos corretamente:

```sql
-- Exemplo: verificar o último registro inserido
SELECT * FROM <tabela> ORDER BY created_at DESC LIMIT 5;
```

Use a skill para:
- Confirmar que o registro foi criado/atualizado/removido
- Inspecionar campos que não aparecem na resposta da API
- Verificar integridade referencial (foreign keys, enums, etc.)
- Comparar o estado antes e depois de uma operação

---

## Quando usar cada skill fora deste fluxo

| Situação | Skill recomendada |
|---|---|
| Está implementando novo código | `arquitetura` — para seguir os padrões |
| Quer saber quais endpoints existem | `test-api` — lista e busca na spec |
| Quer ver dados direto no banco | `query-local` — query SQL sem passar pela API |
| Vai criar migration ou tabela nova | `query-local` — para validar a estrutura criada |
| Suspeita de bug na persistência | `query-local` + `test-api` em conjunto |

---

## Checklist rápido de teste local

- [ ] Servidor está rodando em `localhost:3001`
- [ ] Banco Postgres local está acessível
- [ ] Código segue as regras de `arquitetura`
- [ ] Curl gerado por `test-api` retornou `2xx`
- [ ] Dados confirmados no banco via `query-local`