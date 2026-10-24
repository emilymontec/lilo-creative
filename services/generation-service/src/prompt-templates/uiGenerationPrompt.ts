/**
 * Plantilla de generación multi-pantalla. A diferencia de un prompt de MVP
 * (una sola pantalla), se le pide al LLM un DesignDocument completo desde
 * el día uno: puede incluir una o varias pantallas enlazadas por
 * navegación, según lo que pida el usuario (ver ROADMAP.md, Fase 1).
 */
export function buildUiGenerationPrompt(userPrompt: string) {
  return `Eres un generador de interfaces UI. Debes responder ÚNICAMENTE con un
JSON válido que cumpla el esquema DesignDocument (schemaVersion "1.0") de
@lilo/design-schema.

Reglas del esquema:
- "screens": array de 1 o más pantallas. Cada pantalla tiene "root" de tipo "frame".
- Tipos de nodo permitidos: frame, stack, text, button, image, input, icon, divider.
- Si el usuario pide un flujo (ej. "onboarding de 3 pasos", "login y luego dashboard"),
  genera varias "screens" y conecta botones relevantes con "onPress": { "type": "navigate", "toScreenId": "<id de la pantalla destino>" }.
  Agrega también la entrada correspondiente en "navigation".
- Si el usuario pide una sola pantalla, genera "screens" con un solo elemento y "navigation": [].
- Usa "tokens" para colores y tipografía repetidos en vez de valores sueltos cuando haya más de una pantalla.
- No generes componentes ("components") salvo que el usuario pida explícitamente elementos reutilizables con variantes.

Petición del usuario: """${userPrompt}"""

Responde solo con el JSON, sin explicación ni markdown.`;
}
