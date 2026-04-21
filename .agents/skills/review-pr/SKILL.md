---
name: review-pr
description: Code review assistant with architecture and database validation criteria
---

Assistente code review:

1. **Resumo de Alto Nível** Em 2-3 frases, descreva:
   - **Impacto no produto**: O que esta mudança entrega para usuários/clientes?
   - **Abordagem de engenharia**: Padrões, frameworks ou boas práticas
     principais.

2. **Obter e delimitar o diff**
   - Execute `git fetch origin` para atualizar referências remotas.
   - Obtenha a branch atual: `git branch --show-current` (ou
     `git rev-parse --abbrev-ref HEAD`).
   - Liste apenas arquivos modificados na branch atual em relação à branch base:
     `git diff --name-only --diff-filter=M origin/<base-branch>...HEAD`.
   - Para cada arquivo listado, verifique se há diff real:
     `git diff --quiet origin/<base-branch>...HEAD -- <file>`; pule arquivos sem
     mudanças.

3. **Critérios de Avaliação** Para cada arquivo alterado, avalie no contexto do
   código existente. Considere interações com código relacionado. Avalie contra:
   - **Arquitetura & Design** (ref: `.cursor/skills/arquitetura/SKILL.md`):
     - Separação de camadas: Domain não depende de nada; Application depende
       apenas de Domain; Infra depende de Application/Domain.
     - Entidades de domínio estendem `Entity` e têm comportamento (não
       anêmicas).
     - Protocolos (classes abstratas) definidos em Application, implementados em
       Infra.
     - Evitar acoplamento desnecessário e respeitar limites de módulos.

   - **Banco de Dados** (ref: `.cursor/skills/data-base/SKILL.md`):
     - Colunas em `snake_case` minúsculo; tabelas no plural `snake_case`.
     - IDs como UUIDv7; datas em ISO-8601 UTC (sufixo Z).
     - Campos obrigatórios: `id`, `created_at`, `updated_at` (gerenciado por
       Domain), `deleted_at` (opcional).
     - `updated_at` atualizado pela camada de domínio.

   - **Complexidade & Manutenibilidade**:
     - Fluxo plano, baixa complexidade ciclomática, DRY, remover código morto,
       refatorar lógica densa.

4. **Reportar problemas em bullets aninhados** Para cada problema validado:
   - File: `<path>:<line-range>`
     - Issue: [Resumo de uma linha do problema]
     - Fix: [Sugestão concisa ou snippet de código]

5. **Problemas Priorizados** Título: `## Problemas Priorizados`. Agrupe por
   severidade nesta ordem (sem texto extra):
   - ### Crítico
   - ### Major

Mantenha tom profissional e conciso. Analise apenas arquivos com mudanças.
