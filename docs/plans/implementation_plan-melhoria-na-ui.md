# Plano de Melhoria de UI/UX: CasamentoForever

Este plano detalha as etapas para transformar a interface do usuário da aplicação em um design impressionante, moderno e elegante, digno de um aplicativo de casamento premium, com forte foco na experiência **mobile-first** solicitada anteriormente.

## User Review Required

> [!IMPORTANT]  
> Este plano propõe mudanças visuais significativas. Por favor, revise a paleta de cores expandida e o uso proposto de animações. Se você tiver referências de design específicas (links do Dribbble, Pinterest) que gostaria de seguir, por favor me informe!

## Open Questions

> [!QUESTION]  
> 1. Você gostaria de incorporar **Framer Motion** para animações fluidas (transições de página, modais suaves, itens de lista aparecendo) ou prefere manter apenas transições CSS simples com Tailwind?
> 2. Para a navegação em dispositivos móveis (quando o casal estiver logado), você prefere um **menu hambúrguer** tradicional no topo ou uma **barra de navegação inferior (Bottom Tab Bar)**, que costuma ser mais amigável para uso com uma mão?

## Proposed Changes

### 1. Design System & Tema (Tailwind)

Vamos enriquecer a paleta de cores e adicionar utilitários para criar profundidade e elegância.

#### [MODIFY] [tailwind.config.ts](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/tailwind.config.ts)
- **Cores Expandidas**: Adicionar variações tonais para `gold` e `rose-gold` (ex: `gold-light`, `gold-dark`) para possibilitar hover states mais ricos e gradientes.
- **Backgrounds**: Introduzir uma cor `cream-alt` para criar contraste sutil entre seções (ex: alternar o fundo entre branco puro e creme).
- **Sombras (Shadows)**: Criar sombras suaves e difusas (estilo *glassmorphism* ou *soft UI*) para os cartões de presentes (`GiftCard`), substituindo bordas duras.
- **Animações Customizadas**: Adicionar utilitários no `tailwind.config.ts` para micro-interações (ex: `animate-fade-in-up`).

#### [MODIFY] [src/index.css](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/src/index.css)
- Refinar a tipografia global. Aumentar o `line-height` do corpo (Lato) para melhor legibilidade.
- Ajustar o espaçamento de letras (`letter-spacing`) dos títulos (Playfair Display) para um toque mais luxuoso.
- Padronizar os estilos base de formulários para foco global.

---

### 2. Componentes Base e Layout

Vamos criar componentes reutilizáveis e polidos.

#### [MODIFY] [src/components/GiftCard.jsx](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/src/components/GiftCard.jsx)
- **Visual**: Remover bordas pesadas. Aplicar `shadow-soft` (novo) e `rounded-2xl` para bordas mais arredondadas e amigáveis.
- **Interação**: Adicionar efeito de elevação sutil no hover (`hover:-translate-y-1 hover:shadow-lg transition-all`).
- **Imagens**: Proporção consistente (ex: `aspect-square` ou `aspect-[4/3]`) com `object-cover` e um placeholder elegante em gradiente enquanto a imagem carrega.
- **Tipografia do Card**: Destacar o preço em `gold` e usar `Playfair Display` para o título do presente.

#### [MODIFY] [src/components/ImagePreview.jsx](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/src/components/ImagePreview.jsx)
- Tornar o upload de imagens mais convidativo, com uma área de "Drag & Drop" estilizada com bordas tracejadas (`border-dashed`), ícones amigáveis e feedback visual de arrasto.

---

### 3. Páginas (Mobile-First)

Refatorar as páginas principais para garantir que fiquem perfeitas em telas pequenas e escalem graciosamente para desktop.

#### [MODIFY] [src/pages/PublicGiftList.jsx](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/src/pages/PublicGiftList.jsx)
- **Header (Hero Section)**: Adicionar uma área de destaque (Hero) no topo com os nomes dos noivos em tipografia grande e cursiva (Playfair), talvez sobre uma imagem de fundo desfocada ou um gradiente suave de `cream` para `rose-gold`.
- **Grid de Presentes**: Garantir um grid responsivo (`grid-cols-1` no mobile, `sm:grid-cols-2`, `lg:grid-cols-3` ou `4`).
- **Filtros/Busca**: Mover a barra de busca e filtros para uma barra fixa no topo ao rolar (sticky) em dispositivos móveis, com visual clean.

#### [MODIFY] [src/pages/GiftDetail.jsx](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/src/pages/GiftDetail.jsx)
- Layout estilo "App de E-commerce Premium".
- Imagem ocupando a largura total no mobile (`w-full`), sem margens laterais no topo.
- Detalhes (título, preço, descrição) em um cartão branco com bordas superiores arredondadas que "desliza" sobre a imagem.
- Botão "Presentear" fixo na parte inferior da tela (`fixed bottom-0 w-full`) em dispositivos móveis para facilitar a ação (Call to Action principal).

#### [MODIFY] [src/pages/Login.jsx](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/src/pages/Login.jsx) & [Register.jsx](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/src/pages/Register.jsx)
- Centralizar os formulários em telas de desktop usando um layout de split-screen (metade formulário, metade uma imagem bonita ou padrão de casamento).
- Em mobile, formulários ocupando 100% da largura, com inputs grandes (`py-3`) e botões imponentes.
- Focar no contraste e legibilidade das mensagens de erro.

#### [MODIFY] [src/pages/Dashboard.jsx](file:///home/horlando.leao/Documentos/meusprojetos/casamentoforever/src/pages/Dashboard.jsx)
- Otimizar a tabela ou lista de presentes para os noivos no mobile, talvez transformando linhas da tabela em cartões expansíveis em telas pequenas (já que tabelas são difíceis de ler no celular).

---

## Verification Plan

### Testes Visuais e Responsividade
- Abrir a aplicação e usar a ferramenta de inspeção do navegador para simular dispositivos (iPhone SE, iPhone 14 Pro, iPad, Desktop).
- Verificar se não há rolagem horizontal acidental (overflow).
- Validar se todos os botões e links possuem áreas de toque (`touch targets`) de pelo menos 44x44px.

### Testes Automatizados
- Rodar os testes existentes (se houver `npm test`) para garantir que as alterações no JSX e nas classes Tailwind não quebraram a renderização dos componentes.
- Garantir que a build de produção passa sem erros: `npm run build`.
