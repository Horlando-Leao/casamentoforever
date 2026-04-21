---
name: safe-rename
description: Renomeia com segurança um campo de DTO, entidade ou propriedade em todo o repositório, garantindo que nenhum arquivo dependente fique quebrado antes de declarar a tarefa concluída
compatibility: Requer acesso ao terminal para executar grep e npm run tsc:check
---

# **Safe Rename — Renomeação Segura em Todo o Repositório**

Use esta skill sempre que precisar renomear um campo de DTO, propriedade de entidade, variável exportada ou qualquer símbolo que possa estar referenciado em múltiplos arquivos, incluindo arquivos de teste.

---

## Fluxo obrigatório

### Etapa 1 — Mapear todas as ocorrências antes de editar

Execute o grep pelo nome antigo em **todo o repositório**, sem exceções:

```bash
grep -rn "<<NOME_ANTIGO>>" --include="*.ts" .
```

Liste cada arquivo encontrado antes de fazer qualquer edição. Se houver mais de 10 ocorrências, apresente a lista ao usuário e confirme o escopo antes de continuar.

**Arquivos que nunca podem ser ignorados:**
- `*.spec.ts` e `*.test.ts` — testes unitários e de integração
- `*.dto.ts` — definições de DTO
- `*.entity.ts` — entidades de domínio
- `*.controller.ts` — controllers
- `*.module.ts` — módulos (podem reexportar)
- `*.md` — documentação (ex.: AGENTS.md, README)

---

### Etapa 2 — Aplicar as edições

Com a lista mapeada, aplique as substituições em todos os arquivos identificados. Use `replace_all` ao editar para não deixar ocorrências residuais.

---

### Etapa 3 — Verificar tipos

Após todas as edições, execute a verificação de tipos:

```bash
source ~/.nvm/nvm.sh && nvm use && npm run tsc:check
```

Se houver erros de TypeScript:
1. Leia cada erro com atenção
2. Corrija o arquivo apontado
3. Reexecute `tsc:check` até que a saída esteja limpa

---

### Etapa 4 — Verificar lint

```bash
source ~/.nvm/nvm.sh && nvm use && npm run biome:check
```

Se houver problemas de lint, execute o auto-fix:

```bash
source ~/.nvm/nvm.sh && nvm use && npm run biome:check:fix
```

---

### Etapa 5 — Confirmar que nenhuma ocorrência antiga sobrou

```bash
grep -rn "<<NOME_ANTIGO>>" --include="*.ts" .
```

A saída deve estar **vazia**. Se ainda houver ocorrências, volte à Etapa 2.

---

### Etapa 6 — Declarar concluído

Só reporte a tarefa como concluída após:

- [ ] Nenhuma ocorrência do nome antigo restante no repositório
- [ ] `npm run tsc:check` sem erros
- [ ] `npm run biome:check` sem erros

---

## Regras rápidas

- Nunca declare "pronto" sem passar pelo `tsc:check`.
- Arquivos `*.spec.ts` são obrigatórios no grep — eles quebram silenciosamente se esquecidos.
- Se o campo renomeado faz parte de uma interface ou type público, verifique também os consumidores em `libs/src/`.
