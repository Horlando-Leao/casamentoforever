# Plano de Implementação: Modernização Mobile-First

## Objetivo
Transformar a aplicação em uma experiência nativa-like, priorizando o uso em dispositivos móveis sem comprometer a usabilidade em desktop. O foco é em ergonomia, performance e uma estética premium.

## Estratégias Principais

### 1. Navegação Ergonômica (Bottom Navigation)
Em dispositivos móveis, o polegar alcança mais facilmente a parte inferior da tela.
- **Implementação:** Criar um componente `BottomNav` que aparece apenas em telas pequenas (`md:hidden`).
- **Ações:** Links para Início, Lista de Presentes, e (se logado) Painel.

### 2. Bottom Sheets (Modais Deslizantes)
Substituir modais centralizados por "Bottom Sheets" em dispositivos móveis para facilitar a interação.
- **Implementação:** O modal de reserva de presentes e o modal de instruções de PIX devem deslizar de baixo para cima em telas mobile.
- **Componente:** Utilizar transições do Tailwind/Headless UI para suavidade.

### 3. Otimização de Touch e Feedback
- **Touch Targets:** Garantir que todos os botões e inputs tenham no mínimo 44x44px de área clicável.
- **Micro-interações:** Adicionar estados `:active` mais pronunciados (efeito de "press") e transições suaves em todos os elementos clicáveis.
- **Inputs:** Usar tipos de input corretos (`tel`, `email`, `numeric`) para acionar o teclado virtual apropriado.

### 4. Layout e Visual Premium
- **Full Screen Experience:** Utilizar `min-h-[100dvh]` para evitar problemas com barras de navegação de browsers mobile.
- **Imagens:** Implementar lazy-loading e suporte a formatos modernos (WebP) para carregar a lista de presentes mais rápido.
- **Skeleton Screens:** Adicionar carregamento progressivo (skeletons) em vez de apenas um spinner central para melhorar a percepção de velocidade.

### 5. PWA (Progressive Web App)
Aproveitar o `vite-plugin-pwa` já instalado.
- **Offline Mode:** Garantir que a lista de presentes (cacheada) possa ser visualizada mesmo sem conexão.
- **Prompt de Instalação:** Criar um banner discreto e elegante convidando o usuário a "Instalar o App" para melhor experiência.

## Mudanças Propostas por Componente

### [Frontend]

#### [NEW] `src/components/BottomNav.jsx`
Componente de navegação fixa na base para telas mobile.

#### [MODIFY] `src/pages/PublicGiftList.jsx`
- Ajustar o grid de presentes para ser mais fluido em telas pequenas.
- Alterar o Modal de Reserva para comportamento de Bottom Sheet em mobile.
- Implementar skeletons durante o `loading`.

#### [MODIFY] `src/index.css`
- Adicionar utilitários para `100dvh` e suporte a `safe-area-inset`.
- Refinar estilos globais de botões para estados de toque.

## Plano de Verificação

### Testes Manuais (Simulação de Dispositivos)
- Validar via Chrome DevTools em resoluções de iPhone SE, iPhone 12 Pro e Pixel 7.
- Testar comportamento de "Add to Home Screen" no Android/iOS (se possível em ambiente de staging).

### Performance
- Rodar Lighthouse Mobile e garantir pontuação > 90 em Performance e Best Practices.

## Solicitação de Aprovação
Este plano foca na usabilidade moderna. Por favor, revise os pontos, especialmente a troca de Modais por Bottom Sheets. Após aprovação, iniciarei a criação do componente `BottomNav`.
