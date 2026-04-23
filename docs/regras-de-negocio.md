# Regras de Negócio - CasamentoForever

Este documento descreve as regras de negócio implementadas no projeto CasamentoForever, abrangendo desde a arquitetura multi-inquilino até a experiência de visitantes e administradores.

## 1. Arquitetura Multi-inquilino (Multi-tenancy)

O sistema foi projetado para hospedar múltiplos casamentos em uma única plataforma.

*   **Identificação via Slug:** Cada casal (tenant) possui um identificador único na URL (ex: `casamentoforever.com/#/mariaejoao/lista`).
*   **Isolamento de Dados:** Usuários e presentes são vinculados estritamente a um `tenant_id`. O acesso cruzado entre inquilinos é bloqueado no backend via `authMiddleware`.
*   **Nomes dos Noivos:** Cada inquilino possui dois campos de nome (`nome1` e `nome2`), que são exibidos na interface pública e no dashboard. Caso não existam, o sistema utiliza o `slug` como fallback.

## 2. Autenticação e Segurança (Administradores)

*   **Registro e Criação de Tenant:** Ao se registrar, se o `slug` fornecido na URL ainda não existir, um novo inquilino é criado. Se já existir mas estiver sem nomes definidos, os nomes são atualizados.
*   **Descoberta de Tenant no Login:** Existe um endpoint de login global (`/api/auth/login`) que identifica o inquilino pelo e-mail, permitindo que o administrador acesse seu painel sem precisar digitar o slug manualmente.
*   **Criptografia e JWT:** 
    *   Senhas são armazenadas com hash SHA-256 + `JWT_SECRET`.
    *   Tokens JWT contêm `userId`, `tenantId` e `tenantSlug`.
    *   **Regra de Ouro:** Toda ação de escrita deve ser protegida por autenticação e validação de tenant.

## 3. Gestão de Presentes (Painel Administrativo)

Os noivos gerenciam sua lista através do Dashboard e da página de Detalhes.

*   **CRUD de Presentes:** Operações completas de criação, edição e exclusão.
*   **Campos de Presente:** 
    *   **Obrigatório:** Nome.
    *   **Opcionais:** Imagem (URL), Preço, Chave PIX, e até 3 Links de Lojas externas.
*   **Visibilidade de Reservas:** 
    *   O backend armazena `reserved_by_name`, `reserved_by_whatsapp` e `reserved_at`.
    *   *Nota de Revisão:* Atualmente, estes dados estão disponíveis na API, mas a interface administrativa (Dashboard/GiftDetail) precisa de atualização para exibi-los claramente ao casal.
*   **Compartilhamento:** O sistema gera um link curto para a lista pública no formato `#/:tenant/lista`.

## 4. Experiência do Visitante (Página Pública)

A página pública foca na simplicidade e conversão (reserva).

*   **Fluxo de Reserva:**
    1.  O convidado escolhe um presente "Disponível".
    2.  Fornece Nome e WhatsApp.
    3.  O sistema confirma a reserva e **revela** a Chave PIX e os links de compra.
*   **Privacidade:** Dados sensíveis (PIX e Links) são omitidos da API pública (`/api/:tenant/public/gifts`) para itens que não foram reservados pelo usuário atual na sessão.
*   **Feedback Visual:** Itens reservados aparecem em escala de cinza (grayscale) com a etiqueta "RESERVADO".

## 5. Regras de Reserva e Pagamento

*   **Exclusividade:** Um presente só pode ser reservado por uma pessoa. Tentativas simultâneas resultam em erro 409 (Conflict).
*   **Limite Anti-Abuso:** O sistema impõe o limite de **apenas uma reserva por número de WhatsApp** por casamento (tenant).
*   **Pagamento Direto:** O CasamentoForever **não processa pagamentos**. Ele atua como um facilitador, fornecendo a Chave PIX do casal ou links de lojas para que o convidado conclua a transação externamente.
*   **Cancelamento:** A reserva é considerada um compromisso. O cancelamento por parte do convidado não está disponível na interface; o administrador deve intervir se necessário.

## 6. Navegação e Mobile-First

*   **Design Responsivo:** A aplicação utiliza Tailwind CSS com foco em dispositivos móveis.
*   **Navegação Inferior (BottomNav):** Em dispositivos móveis, uma barra de navegação persistente facilita a alternância entre a Lista de Presentes, o Painel de Acesso e o Dashboard.
*   **Modais:** Reservas e instruções de sucesso são tratadas em modais para evitar trocas de página desnecessárias e manter o contexto do convidado.

## 7. Conformidade (AGENTS.MD)

Conforme as diretrizes do projeto:
*   **Auditoria:** Ações significativas (criação/exclusão/reserva) devem gerar registros de auditoria via `audit()` (implementação em progresso).
*   **Criptografia:** Campos sensíveis em trânsito ou repouso devem seguir os padrões de `encrypt()`/`decrypt()` definidos no core do projeto.

---
*Revisado em: 23 de Abril de 2026*
