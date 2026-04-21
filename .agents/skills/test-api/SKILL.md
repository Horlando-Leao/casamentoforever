---
name: test-api
description: Busca a documentação da API local (http://localhost:3001/api/docs.json), localiza o endpoint que o usuário quer testar e gera um curl completo e pronto para executar
---

# **Test API — Gerador de curl a partir da documentação Swagger**

Use esta skill sempre que o usuário quiser testar um endpoint da API local.

## **Fluxo obrigatório**

### 1. Buscar a documentação

Execute o comando abaixo para obter a spec OpenAPI completa:

```bash
curl -s http://localhost:3001/api/docs.json
```

> Se o servidor não estiver rodando, avise o usuário e pare aqui.

### 2. Identificar o endpoint

A partir do JSON retornado, localize o path e o método HTTP que o usuário quer testar. Use as seguintes estratégias de busca (em ordem):

- Busca exata pelo path (ex.: `/attendances`)
- Busca por palavra-chave no `summary` ou `operationId`
- Busca por tag (ex.: `Attendances`, `Auth`)

Se houver mais de um candidato, liste-os e peça ao usuário para escolher antes de continuar.

### 3. Montar o curl

Com o endpoint encontrado, extraia da spec:

| Campo spec | Onde usar no curl |
|---|---|
| `path` | URL completa `http://localhost:3001{path}` |
| `method` | `-X METHOD` |
| `parameters` (query/path) | query string ou substituição no path |
| `requestBody` → `content.application/json.schema` | `-d '{...}'` com body de exemplo |
| `security` | header `-H "Authorization: Bearer <TOKEN>"` quando presente |

**Regras de montagem:**

- Sempre inclua `-H "Content-Type: application/json"` quando houver body.
- Para campos obrigatórios, gere valores de exemplo realistas (não `string` genérico).
- Para campos opcionais, inclua comentados com `# opcional:` logo abaixo.
- Se o endpoint exigir autenticação (bearer ou apiKey), adicione o header e instrua o usuário a substituir `<TOKEN>` pelo valor real.
- Use `\` para quebrar linhas longas, tornando o curl legível.

### 4. Apresentar o resultado

Exiba o curl em bloco de código `bash` pronto para copiar e colar. Inclua, logo abaixo:

- **Path:** o endpoint encontrado
- **Método:** GET / POST / PUT / PATCH / DELETE
- **Auth:** Sim / Não
- **Observações:** qualquer detalhe relevante sobre parâmetros ou comportamento esperado

## **Exemplo de output esperado**

```bash
curl -s -X POST http://localhost:3001/attendances \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "condominiumId": "cond-uuid-aqui",
    "visitorName": "João Silva",
    "scheduledAt": "2026-04-10T14:00:00Z"
    # opcional: "notes": "Visita de manutenção"
  }'
```

**Path:** `POST /attendances`  
**Auth:** Sim (Bearer token)  
**Observações:** `scheduledAt` deve estar no formato ISO 8601.

## **Regras rápidas**

- Nunca invente endpoints — use apenas o que está na spec.
- Se o campo `example` existir na spec, use-o como valor no body.
- Nunca inclua dados sensíveis reais (senhas, tokens) no output — use sempre placeholders.
- Se o usuário não especificar qual endpoint quer testar, pergunte antes de buscar.