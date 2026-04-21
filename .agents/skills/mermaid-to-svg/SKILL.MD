---
name: mermaid-to-svg
description: Use esta skill quando o usuário pedir para converter, renderizar ou transformar um diagrama Mermaid (texto ou arquivo .mmd) em um arquivo de imagem SVG.
---

# **Mermaid to SVG Converter**

Esta skill transforma definições de texto Mermaid em diagramas visuais SVG de alta qualidade usando `@mermaid-js/mermaid-cli` via `npx`.

## **Instruções Passo a Passo**

1. **Identificação:** Identifique o(s) diagrama(s) Mermaid (bloco de código no chat ou arquivo `.mmd`).
2. **Preparação:** Se o conteúdo estiver no chat ou embutido em um `.md`, extraia cada bloco `mermaid` em um arquivo temporário `.mmd` separado (ex.: `temp_diagrama.mmd`).
3. **Execução:** Execute o script de renderização:
   ```bash
   bash .cursor/skills/mermaid-to-svg/scripts/render_mermaid.sh <entrada.mmd> <saida.svg>
   ```
4. **Validação:** Verifique se o `.svg` foi gerado com sucesso no diretório de destino.
5. **Limpeza:** Apague os arquivos `.mmd` temporários após a conversão.

## **Requisitos do Ambiente**

- **Node.js v18+** obrigatório — o script detecta automaticamente o Node.js do nvm e o prioriza sobre o do sistema.
- Se falhar com `Cannot find module 'node:path'`, o `node` do sistema é antigo (ex.: v12). O script resolve isso automaticamente via `~/.nvm`.
- Na primeira execução, o `npx` instala o `@mermaid-js/mermaid-cli` e o `puppeteer` — **pode levar 1-3 minutos**. Nas seguintes, é instantâneo.
- Use o **Monitor tool** para acompanhar a conclusão em background, filtrando por `Sucesso|Erro`.

## **Boas práticas de sintaxe Mermaid**

Erros de parse são comuns. Siga estas regras para evitá-los:

| Situação | Regra |
|---|---|
| Labels com `{}`, `()`, `,` ou `→` | Sempre envolva em aspas duplas: `"right(value)"` |
| `<br/>` dentro de labels | Não é suportado — use texto inline ou quebre em duas setas |
| Cores de `rect` | Use `rgba(r, g, b, alpha)` em vez de `rgb()` para controlar opacidade |
| Múltiplos diagramas num `.md` | Extraia cada bloco em um `.mmd` separado antes de renderizar |

## **Restrições**

- Não substitua o arquivo original `.mmd`, sempre gere um novo `.svg`.
- Se o usuário não especificar o nome de saída, use o mesmo nome do arquivo de entrada com extensão `.svg`.
- Nunca execute `DELETE` ou `DROP` como parte desta skill.

## **Exemplo de Fluxo**

```bash
# 1. Criar arquivo temporário com o conteúdo Mermaid
# 2. Renderizar
bash .cursor/skills/mermaid-to-svg/scripts/render_mermaid.sh temp_fluxo.mmd docs/fluxo.svg

# 3. Limpar temporário
rm temp_fluxo.mmd
```