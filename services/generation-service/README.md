# @lilo/generation-service

> Orquesta prompt -> LLM -> JSON del árbol de diseño. Prompt engineering, function calling/structured outputs, validación de esquema y cola de reintentos.

Puerto por defecto: `4001`

## Desarrollo

```bash
npm install
npm run dev
```

## Submódulos

- `src/prompt-templates/` — plantillas de prompt + few-shot examples del esquema JSON
- `src/llm-adapters/` — adaptadores para Claude, GPT-4 y modelos de visión (interfaz común)
- `src/schema-validator/` — valida el JSON generado contra `@lilo/design-schema` antes de devolverlo
- `src/queue/` — jobs en background con BullMQ/Redis para generaciones largas

## Flujo

1. Recibe `prompt` (+ opcional imagen de referencia)
2. Arma el prompt final con `prompt-templates` + esquema
3. Llama al LLM vía `llm-adapters` forzando structured output
4. Valida con `schema-validator` (reintento automático si falla, hasta N veces)
5. Devuelve el árbol JSON válido o un error estructurado

