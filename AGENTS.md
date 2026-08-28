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

## Contexto do projeto
ler o documento em ./README.md

## Como rodar o projeto
ler o documento em ./docs/como-rodar-o-projeot.md

## 📄 Lista de Páginas do Sistema

| Arquivo | Descrição / Função |
| :--- | :--- |
| **`Login.jsx`** | Tela de autenticação dos noivos com busca automática de casal por e-mail. |
| **`Register.jsx`** | Tela de cadastro de novos casais (criação de conta e slug do casal). |
| **`Dashboard.jsx`** | Painel principal privado do casal (gerenciamento dos presentes cadastrados, atalhos de compartilhamento e navegação). |
| **`GiftForm.jsx`** | Formulário para criação e edição de presentes (nome, imagem, preço, links de lojas e descrição). |
| **`GiftDetail.jsx`** | Visualização detalhada de um presente específico no painel privado do casal. |
| **`ReceivedGifts.jsx`** | Central de presentes reservados pelos convidados (exibe quem reservou, contato WhatsApp, links de compra, marcação de recebido e desvinculação). |
| **`EventForm.jsx`** | Formulário de edição dos detalhes do casamento (data, horário, endereço, link do Google Maps, Dress Code e orientações). |
| **`PublicEventDetail.jsx`** | Página pública do convite acessada pelo convidado via QR Code ou link (exibe contagem regressiva, local no mapa, dress code e catálogo de presentes com opção de reserva). |