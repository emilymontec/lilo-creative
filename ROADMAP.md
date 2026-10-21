# Roadmap Detallado: IA Generadora de Diseños UI/UX Editables
### Producto completo · Equipo de 2-4 personas · "Google Stitch + motor de edición tipo Figma"

---

## 0. Resumen ejecutivo

| | |
|---|---|
| **Producto** | Plataforma que genera diseños UI/UX por IA donde cada elemento es editable directamente sobre un canvas |
| **Diferenciador** | El resto del mercado genera imágenes o código cerrado; nosotros generamos un **árbol de datos editable** |
| **Duración estimada total** | ~9-11 meses hasta lanzamiento público (equipo de 2-4) |
| **Mayor riesgo técnico** | Que el LLM genere el árbol JSON de forma consistente y válida |
| **Mayor riesgo de producto** | Que el editor se sienta "menos pulido" que Figma y la gente no lo adopte |

---

## 1. Fase 0 — Investigación y validación
**Duración: 4-6 semanas | Equipo: todos**

### Semana 1-2: Investigación de mercado y usuarios
- Mapeo competitivo detallado: Stitch, Galileo AI, Uizard, v0.dev, Framer AI, Figma AI (features, precios, limitaciones reales — probarlos, no solo leer marketing)
- 10-15 entrevistas con diseñadores UI/UX, PMs y founders no-técnicos sobre su flujo actual y frustraciones
- Definir 2-3 perfiles de usuario objetivo (ej: diseñador freelance, founder no-técnico, equipo de producto pequeño)

### Semana 3-4: Especificación técnica fundacional
- **Entregable crítico:** documento `design-schema-spec.md` — versión 1 del esquema JSON del árbol de diseño (tipos de nodo, propiedades editables, reglas de anidamiento)
- Definir qué tipos de elementos soporta la v1 (frame, texto, botón, imagen, contenedor/stack) — resistir la tentación de cubrir todo desde el inicio
- Prototipo de baja fidelidad en Figma del flujo prompt → generación → edición

### Semana 5-6: Spike técnico (la validación más importante del proyecto)
- Construir un prototipo desechable: prompt → LLM (Claude/GPT-4 con structured outputs) → JSON válido según el schema
- Medir: % de generaciones que producen JSON válido sin reintentos, tiempo de respuesta, costo por generación
- **Gate de decisión:** si el LLM no logra ~90%+ de JSON válido con reintentos automáticos, ajustar el schema o el enfoque de prompting antes de avanzar a Fase 1
- Validar el concepto con 10-15 usuarios mostrando el prototipo (no el spike técnico, la maqueta de Figma)

**Entregables de la fase:** esquema JSON v1, resultados del spike técnico, 3 perfiles de usuario validados, informe de investigación competitiva

---

## 2. Fase 1 — MVP núcleo: generación + editor básico
**Duración: 8-10 semanas | Equipo: frontend lead + backend/IA engineer**

### Sprint 1-2 (semanas 1-4): Infraestructura base
- Setup de monorepo, CI/CD básico, entornos (dev/staging)
- `design-schema` package: esquema JSON v1 + validador (Zod/Pydantic)
- Auth básico (registro/login, JWT)
- Base de datos: PostgreSQL con tabla `designs` (columna JSONB para el árbol)
- Generation Service: endpoint que recibe prompt, llama al LLM, valida y devuelve el JSON

### Sprint 3-4 (semanas 5-7): Motor de canvas
- Renderizador: JSON → elementos visuales sobre Konva.js/Fabric.js
- Selección de elementos (clic, resaltado)
- Mover y redimensionar elementos (drag & drop, handles de resize)
- Sincronización canvas → JSON en tiempo real (single source of truth)

### Sprint 5 (semanas 8-9): Panel de propiedades y persistencia
- Panel de propiedades básico (color, tamaño de fuente, texto, espaciado)
- Guardar/cargar proyectos (autosave cada X segundos)
- Pantalla de "Mis diseños" (lista de proyectos del usuario)

### Sprint 6 (semana 10): Integración y pulido
- Conectar generación + editor en un flujo único sin fricciones
- Testing end-to-end del flujo completo
- Corrección de bugs críticos

**Entregable de la fase:** demo funcional interna — un usuario escribe un prompt, obtiene un diseño, y puede moverlo/editarlo y guardarlo. **Métrica de salida de fase:** % de sesiones internas donde se edita al menos un elemento tras generar.

---

## 3. Fase 2 — Editor avanzado
**Duración: 6-8 semanas | Equipo: frontend lead + diseñador de producto**

### Semanas 1-2: Capas y jerarquía
- Panel de capas (árbol visual de elementos, reordenar por drag & drop)
- Agrupar/desagrupar elementos
- Bloquear/ocultar elementos

### Semanas 3-4: Componentes reutilizables
- Convertir un elemento en "componente" reutilizable
- Sistema de instancias con variantes (ej: botón primario/secundario)
- Sincronización: editar el componente maestro actualiza sus instancias

### Semanas 5-6: Design tokens
- Panel de estilos globales: paleta de colores, tipografías, espaciados reutilizables
- Aplicar tokens a elementos en vez de valores sueltos (facilita rebranding de todo el diseño)

### Semanas 7-8: Historial y atajos
- Undo/redo robusto (basado en el historial del árbol JSON, no solo del DOM)
- Atajos de teclado (copiar/pegar, duplicar, mover con flechas)
- Pulido de UX general del editor — aquí conviene invertir tiempo extra, es donde compite directamente con Figma

**Entregable de la fase:** editor con funcionalidad comparable a un Figma "mínimo viable" para diseños simples de 1-2 pantallas.

---

## 4. Fase 3 — Exportación y colaboración
**Duración: 6 semanas | Equipo: backend/IA engineer + frontend lead**

### Semanas 1-3: Exportación a código
- Export Service: JSON → React + Tailwind (generación de componentes limpios, no HTML inline)
- Preview del código generado antes de descargar
- Exportación como imagen (PNG/SVG) para uso rápido

### Semanas 4-5: Integración con Figma
- Uso de la API REST de Figma para crear nodos programáticamente desde el JSON
- Botón "Enviar a Figma" dentro del editor

### Semana 6: Comentarios (colaboración async)
- Comentarios anclados a elementos específicos del diseño
- Notificaciones básicas (email) cuando alguien comenta

**Nota de alcance:** la colaboración en tiempo real (edición simultánea multi-usuario con CRDT/Yjs) es cara en tiempo de desarrollo. Recomendación: dejarla fuera de esta fase y evaluarla después del lanzamiento según demanda real de usuarios beta.

**Entregable de la fase:** un usuario puede generar, editar, exportar a código funcional y compartir/comentar un diseño con su equipo.

---

## 5. Fase 4 — Beta cerrada y pulido
**Duración: 4-6 semanas | Equipo: todos**

### Semana 1: Onboarding de beta
- Reclutar 20-50 usuarios beta de los perfiles validados en Fase 0
- Onboarding guiado dentro del producto (tutorial interactivo del primer diseño)

### Semanas 2-4: Iteración basada en datos
- Instrumentación de analytics: tasa de generación → edición, elementos más editados, puntos de abandono
- Entrevistas de seguimiento con usuarios beta (¿dónde se traban? ¿qué esperaban que pudieran editar y no podían?)
- Rendimiento del canvas con diseños grandes (100+ elementos) — optimizar renderizado si es necesario
- Corrección de bugs de UX reportados

### Semanas 5-6: Pulido final pre-lanzamiento
- Revisión de todos los flujos críticos (generación, edición, guardado, exportación)
- Preparar infraestructura para escalar (más allá de 50 usuarios concurrentes)
- Página de precios y planes definidos

**Entregable de la fase:** producto validado con datos reales de uso, con retención semana 1 → semana 4 medida y aceptable.

---

## 6. Fase 5 — Lanzamiento y monetización
**Duración: continua desde el mes 9-10**

### Pre-lanzamiento (2 semanas antes)
- Landing page + waitlist
- Contenido de lanzamiento (video demo, casos de uso, comparativa vs. Stitch/Uizard)
- Plan de precios: freemium (X generaciones/mes gratis) + plan Pro (exportación ilimitada, componentes ilimitados)

### Lanzamiento
- Product Hunt, comunidades de diseño (Designer News, r/UXDesign, Discord de diseño)
- Seguimiento activo de feedback inicial las primeras 2 semanas

### Post-lanzamiento (roadmap continuo, meses 10-16+)
- Flujos multi-pantalla (prototipos con navegación entre pantallas)
- Colaboración en tiempo real (si la demanda de usuarios beta la valida)
- Plugins/integraciones (Framer, Webflow)
- Biblioteca de plantillas generadas por IA
- API pública para integrar la generación en otras herramientas

---

## 7. Cronograma resumido

| Fase | Duración | Acumulado |
|---|---|---|
| 0. Investigación y validación | 4-6 semanas | Semana 6 |
| 1. MVP núcleo | 8-10 semanas | Semana 16 |
| 2. Editor avanzado | 6-8 semanas | Semana 24 |
| 3. Exportación y colaboración | 6 semanas | Semana 30 |
| 4. Beta cerrada y pulido | 4-6 semanas | Semana 36 |
| 5. Lanzamiento | — | ~Mes 9-10 |

---

## 8. Equipo y responsabilidades

| Rol | Responsabilidad principal | Fases con más carga |
|---|---|---|
| Frontend/Canvas lead | Motor de edición, UX del editor | 1, 2 |
| Backend/IA engineer | Pipeline de generación, exportación, infraestructura | 1, 3 |
| Diseñador de producto (puede ser part-time) | UX del editor, onboarding, landing | 2, 4, 5 |
| Growth/PM (opcional, o compartido) | Validación con usuarios, lanzamiento, precios | 0, 4, 5 |

Con equipo de 2, es viable cubriendo frontend+canvas y backend+IA a la vez, apoyándose en freelance puntual para diseño UX.

---

## 9. Presupuesto estimado (órdenes de magnitud)

| Concepto | Estimado mensual |
|---|---|
| API de LLM (generación) | Variable según volumen — cachear generaciones repetidas y limitar en el plan free reduce costo significativamente |
| Hosting (backend + DB + storage) | Bajo en Fase 0-2 (entornos pequeños), crece en Fase 4-5 con usuarios beta/reales |
| Herramientas (diseño, analytics, error tracking) | Costo fijo pequeño, mayormente planes gratuitos/starter en fases tempranas |
| Freelance de diseño UX (si aplica) | Puntual en Fase 2 y 4 |

*Nota: los costos de API de LLM son la variable más sensible del modelo de negocio — es clave medirlos desde el spike técnico de la Fase 0 para dimensionar el plan de precios.*

---

## 10. Riesgos y mitigaciones (registro detallado)

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| LLM no genera JSON válido consistentemente | Media | Alto | Structured outputs/function calling estrictos + validación de esquema + reintentos automáticos + fallback a plantillas |
| Editor se siente inferior a Figma, baja adopción | Media | Alto | Invertir en UX del editor desde Fase 1, no dejarlo para el final; testear con usuarios reales en cada fase |
| Costos de API de IA insostenibles | Media | Medio | Cachear generaciones similares, límites en plan free, explorar modelos más económicos para iteraciones menores |
| Alcance se dispara (colaboración en tiempo real, multi-pantalla, etc.) | Alta | Medio | Mantener Fases 1-2 estrictamente en "generar + editar bien"; todo lo demás es explícitamente post-MVP |
| Equipo pequeño no alcanza a cubrir generación + editor + exportación | Media | Alto | Priorizar rigurosamente el orden de fases; considerar recortar colaboración/exportación a Figma si hay retraso |

---

## 11. Métricas de éxito por etapa

- **Fase 1 (MVP):** % de usuarios que editan al menos un elemento después de generar — valida la propuesta central del producto
- **Fase 2-3:** tiempo promedio en el editor por sesión, número de componentes reutilizados por proyecto
- **Fase 4 (Beta):** retención semana 1 → semana 4, NPS de usuarios beta, tasa de finalización del onboarding
- **Fase 5 (Lanzamiento):** conversión free → pago, generaciones por usuario/mes, tiempo hasta el primer diseño exportado

---

## 12. Próximos pasos inmediatos

1. Escribir `design-schema-spec.md` v1 (esquema JSON del árbol de diseño) — documento fundacional de todo el proyecto
2. Ejecutar el spike técnico de la Fase 0 (1-2 semanas): validar que el LLM elegido genera el JSON de forma confiable
3. Prototipo de UX en Figma del flujo completo prompt → generación → edición
4. Decidir el motor de canvas (Konva vs Fabric vs custom) según los resultados del spike
5. Definir los 2-3 perfiles de usuario objetivo antes de las entrevistas de validación
