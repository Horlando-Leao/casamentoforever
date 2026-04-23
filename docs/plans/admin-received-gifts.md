# Plano de Implementação: Tela Administrativa de Presentes Recebidos

## Objetivo
Criar uma tela administrativa, acessível apenas por usuários logados, para visualização e gerenciamento dos presentes que foram dados pelos convidados.

## Requisitos da Interface
A tela exibirá uma lista (tabela ou cards) contendo as informações dos presentes recebidos:
- **Nome do Convidado** (quem presenteou)
- **Telefone do Convidado**
- **Data da Ação**
- **Nome do Presente**
- **Valor do Presente**

Para cada item na lista, o administrador terá acesso às seguintes **ações**:
1. **Abrir WhatsApp:** Um botão que redireciona para a URL `https://wa.me/<telefone_do_convidado>` para facilitar o contato direto.
2. **Aceitar como Recebido:** Um botão/ação para confirmar que o presente ou o valor foi devidamente recebido.
3. **Remover/Cancelar Presente:** Um botão/ação para remover o registro de presente dado (útil em caso de desistência do convidado ou engano).

## Arquitetura e Componentes

### 1. Frontend (React)
- **Nova Página/Rota:** Criar ou atualizar uma página administrativa (ex: `src/pages/ReceivedGifts.jsx` ou integrar ao `Dashboard.jsx`).
- **Componente de Tabela/Lista:** Criar um componente de interface para exibir os dados listados de forma responsiva.
- **Integração de API:** 
  - `GET /api/gifts/received` (ou similar) para buscar a lista de presentes dados.
  - `PUT /api/gifts/:id/accept` para marcar o presente como recebido.
  - `DELETE /api/gifts/:id/remove` para remover o vínculo do presente.
- **Formatação:** Implementar máscara ou formatação para número de telefone e formatação monetária (BRL) para o valor.

### 2. Backend (API/Banco de Dados)
- **Endpoints Necessários:**
  - Garantir que exista um endpoint para listar os presentes que já foram escolhidos por convidados, retornando os dados agregados (Presente + Dados do Convidado).
  - Endpoint para atualizar o status do presente para "Recebido" (adicionar um campo `status` ou `received_at` na tabela se não existir).
  - Endpoint para "desvincular" ou deletar a intenção de presente, retornando o presente para a lista pública se aplicável.
- **Regras de Negócio (`AGENTS.md`):**
  - Todas as rotas de mutação (`PUT`, `DELETE`) deverão utilizar middleware de autenticação (`requireAuth`).
  - As ações de alteração de status ou exclusão **devem** gerar um evento de auditoria `audit()` com `action`, `entity` e `entityId`.
  - Dados sensíveis, se aplicável, devem ser criptografados/descriptografados conforme a disciplina de zero-suposição.

## Passo a Passo da Implementação (TDD-first)

1. **Testes do Backend:**
   - Escrever testes para os novos endpoints ou para as alterações nos endpoints existentes (ex: testes para marcar como recebido e para remover presente). Executar para ver falhar (red).
   - Implementar as rotas, controllers e services até os testes passarem (green).
2. **Integração Frontend:**
   - Criar os serviços de API no frontend (ex: em `src/services/giftService.js`).
   - Construir o UI da tela consumindo esses serviços.
3. **Refinamento de UI/UX:**
   - Adicionar o botão do WhatsApp com o link dinâmico (`wa.me`).
   - Adicionar feedbacks visuais (toasts de sucesso/erro) ao aceitar ou remover um presente.
   - Garantir design mobile-first e responsividade usando Tailwind CSS.

## Solicitação de Aprovação
Por favor, revise este plano. Se estiver de acordo, confirmarei para iniciar o desenvolvimento (Backend primeiro, seguido pelo Frontend).
