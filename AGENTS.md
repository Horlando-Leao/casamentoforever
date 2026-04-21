### Workflow obrigatório (TDD-first)

Toda tarefa deve seguir esta sequência:

1. **Reconhecimento** — ler arquivos relevantes, entender o estado atual
2. **Plano** — descrever o que vai mudar e quais arquivos são afetados
3. **Testes primeiro** — escrever ou atualizar testes que cobrem o comportamento esperado ANTES de implementar. Rodar `npm test` e confirmar que os novos testes falham (red)
4. **Execução** — implementar as mudanças até os testes passarem (green)
5. **Refatorar** — limpar a implementação mantendo os testes verdes
6. **Verificação** — reler os arquivos alterados, rodar `npm run build`, confirmar zero regressões
7. **Impacto sistêmico** — verificar se consumidores dos componentes alterados precisam de atualização (ex.: mudou um middleware → verificar todos os handlers que o usam)

### Disciplina de zero-suposição

- Todo dado criptografado **deve** passar por `encrypt()` antes de gravar e `decrypt()` ao ler
- Todo novo endpoint de escrita **deve** usar `requireAuth` ou `requirePrata`
- Toda ação significativa **deve** gerar `audit()` com action, entity e entityId
- Todo campo sensível novo **deve** ser adicionado às funções `decryptCondomino` ou `decryptFornecedor`
- Nunca assumir que uma coluna existe — verificar via migration pattern (`PRAGMA table_info`)

### Modo padrão de operação

- **Planejar antes de codar.** Sempre propor o plano e esperar aprovação antes de implementar.
- **Alterações pequenas e incrementais.** Preferir várias mudanças focadas a uma grande refatoração.
- **Atualizar a documentação.** Ao descobrir uma nova regra, padrão ou hurdle durante o trabalho, propor a atualização do `AGENTS.md` ou do doc apropriado em `docs/`.


## Skills disponíveis

Antes de resolver qualquer problema, consulte as skills em `.agents/skills/`. Quando o usuário digitar **"use skill \<nome\>"**, leia e siga o SKILL.md correspondente.

Quando o usuário solicitar algo que for compatível com uma skill, leia a skill para verificar se ela pode ajudar na tarefa e execute a skill.

| Skill | Caminho | Descrição |
|---|---|---|
| Query local | .agents/skills/query-local/SKILL.MD | Executa queries SQL no Postgres local para inspecionar dados |
| Criar skills | .agents/skills/creator-skills/SKILL.MD | Guia para criar novas skills no padrão do projeto |
| Mermaid → SVG | .agents/skills/mermaid-to-svg/SKILL.MD | Converte diagramas Mermaid em arquivos SVG |
| Teste local | .agents/skills/teste-local/SKILL.md | Orquestra arquitetura + test-api + query-local para validar uma feature localmente |
| Test API | .agents/skills/test-api/SKILL.md | Gera curl completo a partir da spec Swagger local (localhost:3001) |
| Safe Rename | .agents/skills/safe-rename/SKILL.md | Renomeia símbolo em todo o repo (incluindo .spec.ts) e valida com tsc:check |
| review-pr | .agents/skills/review-pr/SKILL.md | Code review com critérios de arquitetura e banco |
| pull-request | .agents/skills/pull-request/SKILL.md | Instruções para escrever uma boa descrição de PR |
| task-criteria-review | .agents/skills/task-criteria-review/SKILL.md | Valida se o diff da branch atende aos critérios de um ticket |