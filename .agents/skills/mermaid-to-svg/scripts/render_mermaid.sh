#!/bin/bash

# Script para renderizar Mermaid para SVG usando npx (Mermaid CLI)
# Uso: ./render_mermaid.sh input.mmd output.svg

INPUT_FILE=$1
OUTPUT_FILE=$2

if [ -z "$INPUT_FILE" ] || [ -z "$OUTPUT_FILE" ]; then
    echo "Erro: Argumentos insuficientes."
    echo "Uso: bash render_mermaid.sh <input.mmd> <output.svg>"
    exit 1
fi

# Verifica se o arquivo de entrada existe
if [ ! -f "$INPUT_FILE" ]; then
    echo "Erro: Arquivo de entrada '$INPUT_FILE' não encontrado."
    exit 1
fi

# O sistema pode ter um Node.js antigo em /usr/bin/node.
# Prioriza o Node.js do nvm (>= v18) se disponível.
NVM_NODE=$(ls -d "$HOME/.nvm/versions/node"/*/bin 2>/dev/null | sort -V | tail -1)
if [ -n "$NVM_NODE" ]; then
    export PATH="$NVM_NODE:$PATH"
fi

# Valida versão mínima do Node.js (v18+)
NODE_MAJOR=$(node --version 2>/dev/null | sed 's/v\([0-9]*\).*/\1/')
if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 18 ]; then
    echo "Erro: Node.js v18+ é necessário. Versão encontrada: $(node --version 2>/dev/null || echo 'não encontrada')"
    echo "Instale via nvm: nvm install 20"
    exit 1
fi

echo "Usando Node.js $(node --version) em $(which node)"
echo "Iniciando renderização de $INPUT_FILE para $OUTPUT_FILE..."

# Executa o mmdc via npx
# --quiet silencia logs desnecessários
# --backgroundColor transparent garante que o SVG se adapte a temas escuros/claros
npx -p @mermaid-js/mermaid-cli mmdc \
    -i "$INPUT_FILE" \
    -o "$OUTPUT_FILE" \
    --backgroundColor transparent

if [ $? -eq 0 ]; then
    echo "Sucesso! Diagrama renderizado em: $OUTPUT_FILE"
else
    echo "Erro durante a renderização. Verifique se o código Mermaid é válido."
    exit 1
fi