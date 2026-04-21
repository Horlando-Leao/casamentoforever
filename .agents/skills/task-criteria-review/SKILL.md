---
name: task-criteria-review
description: Revisa se os critérios e requisitos de uma tarefa (Jira etc.) foram implementados no diff da branch atual vs main. Use quando o usuário fornecer ID ou conteúdo de um ticket e quiser validar se as mudanças de código atendem aos requisitos, critérios de aceite ou subtarefas.
---

# Revisão de Critérios da Tarefa

Valida se as mudanças da branch atual (diff vs main) implementam todos os
requisitos descritos na tarefa.

## Pré-requisitos

- Usuário fornece: ID da tarefa (ex.: OP-168) e/ou conteúdo (descrição,
  critérios de aceite, subtarefas)
- Repositório Git com branch `main` e branch de feature atual

## Fluxo

### Passo 1: Obter requisitos da tarefa

**Se o usuário colar o conteúdo:** Use diretamente.

**Se apenas o ID for fornecido:**

- Tente buscar via `fetch` em instâncias públicas do Jira:
  `https://<jira-domain>/browse/<TICKET-ID>`
- Se falhar ou exigir autenticação: peça ao usuário que cole descrição,
  critérios de aceite e subtarefas.

**Extraia da tarefa:**

- Título / resumo
- Descrição
- Critérios de aceite
- Subtarefas (se houver)
- Definição de pronto

### Passo 2: Obter o diff

```bash
git fetch origin
git diff --name-only origin/main...HEAD
```

Para diff completo:

```bash
git diff origin/main...HEAD
```

Use `origin/main` ou `origin/master` conforme a branch base do projeto. Prefira
`origin/main`.

### Passo 3: Cruzar requisitos com o diff

Para cada requisito/critério da tarefa:

1. Verifique se há código correspondente no diff (arquivos novos, lógica
   alterada, testes, migrations etc.).
2. Marque como: ✅ Implementado | ⚠️ Parcial | ❌ Não encontrado

Considere:

- Critérios de aceite → implementação em domain, application ou infra
- Subtarefas → áreas distintas do diff (ex.: migration, service, controller)
- Casos de borda → testes em `.spec.ts` ou similar

### Passo 4: Relatório de saída

Use este template:

```markdown
# Revisão de Critérios: [TICKET-ID]

## Resumo da tarefa

[Resumo em uma linha]

## Cobertura dos requisitos

| Requisito    | Status   | Evidência (arquivo/área) |
| ------------ | -------- | ------------------------ |
| [Critério 1] | ✅/⚠️/❌ | [path ou snippet]        |
| [Critério 2] | ...      | ...                      |

## Resumo do diff

- **Arquivos alterados:** N
- **Branch base:** main
- **Branch atual:** [nome]

## Achados

- **Implementado:** [lista]
- **Parcial/Incerteza:** [lista com sugestões]
- **Faltando:** [lista - o que adicionar]
```

## Observações

- Não assuma que requisitos foram atendidos sem evidência no diff. Associe cada
  requisito a mudanças concretas.
- Para "Parcial" ou "Não encontrado", sugira arquivos ou padrões a implementar.
- Se o diff for muito grande, foque no mapeamento requisito→arquivo; evite
  repetir o diff inteiro.
- Prefira correspondência semântica: ex. "API de criação de usuário" →
  controller/handler + DTOs, não apenas nomes de arquivo.

# Exemplos - Revisão de Critérios da Tarefa

## Exemplo 1: Usuário cola o conteúdo da tarefa

**Usuário:** Verifica se minha branch implementou tudo do OP-168. O ticket diz:

```
OP-168: Seed de roles e usuários do sistema
Descrição: Criar migration que insere roles e usuários padrão ao subir a aplicação.
Critérios de aceite:
- [ ] Tabela roles populada com: admin, operator, viewer
- [ ] Usuário admin criado com email admin@gruvi.com
- [ ] Migration idempotente (pode rodar várias vezes sem erro)
```

**Agente:** Obtém o diff (`git diff origin/main...HEAD`), analisa migrations e
arquivos de seed, e gera o relatório mapeando cada critério aos arquivos
alterados.

---

## Exemplo 2: Usuário fornece apenas o ID

**Usuário:** Revisa os critérios da tarefa OP-200 na branch atual.

**Agente:** Tenta `mcp_web_fetch` na URL do Jira. Se falhar (auth, privado),
pede ao usuário para colar descrição e critérios de aceite.

---

## Exemplo 3: Saída do relatório (trecho)

```markdown
# Revisão de Critérios: OP-168

## Resumo da tarefa

Seed de roles e usuários do sistema

## Cobertura dos requisitos

| Requisito                                | Status | Evidência (arquivo/área)                           |
| ---------------------------------------- | ------ | -------------------------------------------------- |
| Tabela roles com admin, operator, viewer | ✅     | migrations/...SeedSystemBase.ts: INSERT INTO roles |
| Usuário admin com admin@gruvi.com        | ✅     | migrations/...SeedSystemBase.ts: INSERT INTO users |
| Migration idempotente                    | ⚠️     | Falta verificação ON CONFLICT ou IF NOT EXISTS     |
```
