# Roadmap Detallado: IA Generadora de Diseños UI/UX Editables
### Producto final completo · Equipo de 2-4 personas · "Google Stitch + motor de edición tipo Figma"

---

## 0. Resumen ejecutivo

| | |
|---|---|
| **Producto** | Plataforma que genera diseños UI/UX por IA donde cada elemento es editable directamente sobre un canvas |
| **Diferenciador** | El resto del mercado genera imágenes o código cerrado; nosotros generamos un **árbol de datos editable** |
| **Enfoque de este roadmap** | **Producto final, no MVP.** Colaboración en tiempo real, flujos multi-pantalla, componentes con variantes, design tokens, exportación multi-framework, biblioteca de plantillas, plugins y API pública están incluidos desde el diseño inicial del esquema y la arquitectura — no se tratan como "fase futura si hay demanda" |
| **Duración estimada total** | ~16-20 meses hasta lanzamiento público (equipo de 2-4) |
| **Mayor riesgo técnico** | Que el LLM genere el árbol JSON (ya con soporte de componentes, tokens y multi-pantalla) de forma consistente y válida |
| **Mayor riesgo de producto** | Que el editor se sienta "menos pulido" que Figma y la gente no lo adopte |
| **Mayor riesgo de alcance** | Construir todo el alcance a la vez con equipo de 2-4 alarga significativamente el time-to-market; se mitiga con orden de construcción estricto (ver sección 10) aunque ninguna pieza se recorte del producto final |

> **Nota de alcance respecto a versiones anteriores de este documento:** la versión previa de este roadmap usaba un enfoque de fases MVP → post-MVP (dejando colaboración en tiempo real, multi-pantalla, plugins y API pública "para después del lanzamiento, según demanda"). Esta versión reemplaza ese enfoque: todo ese alcance se construye como parte del producto final, antes del lanzamiento público. Como consecuencia directa, la duración total pasa de ~9-11 meses a ~16-20 meses con el mismo tamaño de equipo.

---

## Estado de implementación (este repositorio)

A medida que este roadmap se va llevando a código en el monorepo, esta
sección se actualiza para que quede claro qué fase tiene código real detrás
y qué fase es todavía solo plan. No reemplaza las entregas/gates descritos
en cada fase — un ítem puede estar "implementado" aquí y seguir sin cumplir
su gate de decisión (ej. el Spike A/B de Fase 0 sigue siendo un ejercicio a
correr con el LLM/infra reales, no algo que el código por sí solo resuelva).

| Fase | Estado | Notas |
|---|---|---|
| 0 — Investigación y validación | No iniciada | Los spikes técnicos (A: generación, B: colaboración CRDT) siguen pendientes de ejecutarse contra infraestructura real |
| 1 — Infraestructura y generación multi-pantalla | **Código base implementado** | `@lilo/design-schema` completo (nodos, tokens, componentes, `DesignDocument` multi-pantalla); `design-tree-service` (CRUD + esquema SQL); `generation-service` (prompt, validador con reintentos, cola BullMQ); `auth-service` (equipos); `editor-canvas` con navegación entre pantallas. Los adaptadores LLM (`ClaudeAdapter`/`OpenAiAdapter`) y las llamadas reales a Postgres son `TODO` explícitos — el *wiring* está, falta conectar las integraciones externas |
| 2 — Editor avanzado y sistema de diseño | **Implementada** | Capas (reordenar, bloquear/ocultar, agrupar/desagrupar), componentes con variantes, design tokens, historial undo/redo, atajos de teclado, `CanvasRenderer` real con Konva (8 tipos de nodo, drag, selección múltiple, modo preview). Pendiente real: handles de resize y auto-layout completo de `stack` |
| 3 — Colaboración en tiempo real | **Código base implementado** | `@lilo/collab-schema` (puente `DesignDocument` ↔ `Y.Doc`), `collaboration-service` (salas CRDT, protocolo WebSocket estándar de Yjs, Awareness/presencia, comentarios con menciones), `editor-canvas` (`useCollaboration`, `PresenceBar`, `CommentsPanel`). Limitación conocida y documentada en el código: el cliente sincroniza por pantalla completa, no por nodo individual — ver README de `editor-canvas` y de `collaboration-service` |
| 4 — Exportación multi-framework e integración Figma | **Código base implementado** | `export-service` (generadores React y Vue + Tailwind + router multi-pantalla, SVG real + rasterizado PNG con `sharp`, payload de importación a Figma) y `tools/figma-plugin/` (plugin real con Plugin API — ver corrección técnica en la sección de esta fase sobre qué puede y no puede hacer la REST API de Figma). Empaquetado a `.zip` de la descarga de código queda `TODO` |
| 5 — Cuentas, equipos y monetización | Parcial | Modelo de equipos y rutas de `auth-service` ya existen (de Fase 1); falta Stripe y `admin-dashboard` real |
| 6 — Plantillas, plugins y API pública | No iniciada | |
| 7 — Beta cerrada, hardening y lanzamiento | No iniciada | |

---

## 1. Fase 0 — Investigación y validación
**Duración: 5-7 semanas | Equipo: todos**

### Semana 1-2: Investigación de mercado y usuarios
- Mapeo competitivo detallado: Stitch, Galileo AI, Uizard, v0.dev, Framer AI, Figma AI (features, precios, limitaciones reales — probarlos, no solo leer marketing), **incluyendo específicamente sus capacidades de colaboración en tiempo real y multi-pantalla**, ya que son parte del alcance final
- 10-15 entrevistas con diseñadores UI/UX, PMs y founders no-técnicos sobre su flujo actual, frustraciones y expectativas de trabajo en equipo (colaboración simultánea, comentarios, handoff a desarrollo)
- Definir 2-3 perfiles de usuario objetivo (ej: diseñador freelance, founder no-técnico, equipo de producto pequeño que colabora activamente)

### Semana 3-5: Especificación técnica fundacional (esquema completo)
- **Entregable crítico:** `design-schema-spec.md` v1 — a diferencia de un enfoque MVP, el esquema se diseña **desde el inicio** contemplando: múltiples tipos de nodo (frame, texto, botón, imagen, stack, input, icon, divider), **componentes con variantes**, **design tokens globales**, **múltiples pantallas con navegación entre ellas (flujos)**, y metadatos necesarios para **edición colaborativa basada en CRDT** (IDs estables, estructura amigable a merge de Yjs)
- Prototipo de baja fidelidad en Figma del flujo completo: prompt → generación multi-pantalla → edición → colaboración → exportación

### Semana 6-7: Spikes técnicos (las validaciones más importantes del proyecto)
Dos spikes en paralelo, no uno solo, porque el alcance final añade un riesgo técnico propio además del de generación:

- **Spike A — Generación:** prompt → LLM (Claude/GPT-4 con structured outputs) → JSON válido según el schema completo (incluyendo componentes y multi-pantalla). Medir: % de generaciones válidas sin reintentos, tiempo de respuesta, costo por generación. **Gate de decisión:** ~90%+ de JSON válido con reintentos automáticos antes de avanzar.
- **Spike B — Colaboración:** prototipo desechable de edición simultánea de dos clientes sobre el mismo árbol vía Yjs/CRDT, para validar que el modelo de datos del schema (spike A) es compatible con merge automático sin conflictos destructivos. **Gate de decisión:** el árbol debe poder mergearse sin pérdida de datos en escenarios de edición concurrente del mismo nodo.
- Validar el concepto con 10-15 usuarios mostrando el prototipo (no los spikes técnicos, la maqueta de Figma), incluyendo el flujo de colaboración

**Entregables de la fase:** esquema JSON v1 completo (con componentes, tokens y multi-pantalla), resultados de ambos spikes técnicos, 3 perfiles de usuario validados, informe de investigación competitiva.

---

## 2. Fase 1 — Infraestructura y generación multi-pantalla
**Duración: 10-12 semanas | Equipo: frontend lead + backend/IA engineer**

### Sprint 1-2 (semanas 1-4): Infraestructura base
- Setup de monorepo, CI/CD, entornos (dev/staging/prod)
- `design-schema` package: esquema JSON v1 completo + validador (Zod/Pydantic), incluyendo componentes, tokens y referencias entre pantallas
- Auth básico (registro/login, JWT) — con modelo de equipos desde el inicio (no se agrega después)
- Base de datos: PostgreSQL con tablas `designs`, `design_versions`, `components`, `design_tokens`, `screens` (columna JSONB para cada árbol de pantalla + tabla de relación para navegación entre pantallas)
- Generation Service: endpoint que recibe prompt, llama al LLM, valida y devuelve el JSON — con soporte desde el día uno para **generar múltiples pantallas enlazadas** a partir de una sola petición (ej. "flujo de onboarding de 3 pantallas")

### Sprint 3-5 (semanas 5-9): Motor de canvas completo
- Renderizador: JSON → elementos visuales sobre Konva.js/Fabric.js
- Selección de elementos, multi-selección, mover y redimensionar (drag & drop, handles de resize)
- **Navegación entre pantallas dentro del editor** (tabs o árbol de pantallas, no solo una pantalla suelta)
- Sincronización canvas → JSON en tiempo real (single source of truth), con la estructura ya preparada para CRDT (cada mutación es una operación atómica, no un reemplazo completo del árbol)

### Sprint 6 (semanas 10-12): Panel de propiedades y persistencia
- Panel de propiedades (color, tamaño de fuente, texto, espaciado) **ya conectado a design tokens**, no solo valores sueltos
- Guardar/cargar proyectos (autosave cada X segundos) con versionado tipo Git desde el inicio
- Pantalla de "Mis diseños" con vista de proyectos multi-pantalla

**Entregable de la fase:** un usuario genera un flujo de varias pantallas desde un prompt, navega entre ellas en el editor, las edita con tokens aplicados y las guarda con historial de versiones.

---

## 3. Fase 2 — Editor avanzado y sistema de diseño
**Duración: 8-10 semanas | Equipo: frontend lead + diseñador de producto**

### Semanas 1-2: Capas y jerarquía
- Panel de capas (árbol visual de elementos por pantalla, reordenar por drag & drop)
- Agrupar/desagrupar elementos, bloquear/ocultar elementos

### Semanas 3-5: Componentes reutilizables con variantes
- Convertir un elemento en "componente" reutilizable
- Sistema de instancias con variantes (ej: botón primario/secundario/deshabilitado)
- Sincronización: editar el componente maestro actualiza sus instancias en **todas las pantallas** del proyecto
- Panel de biblioteca de componentes del proyecto

### Semanas 6-7: Design tokens
- Panel de estilos globales: paleta de colores, tipografías, espaciados reutilizables
- Aplicar tokens a elementos en vez de valores sueltos (rebranding de todo el diseño, incluidas todas las pantallas, en un solo cambio)
- Soporte de temas (ej. claro/oscuro) como conjuntos alternativos de tokens

### Semanas 8-10: Historial, atajos y pulido
- Undo/redo robusto (basado en el historial del árbol JSON, compatible con operaciones CRDT de la Fase 3)
- Atajos de teclado (copiar/pegar, duplicar, mover con flechas, navegar entre pantallas)
- Pulido de UX general del editor — aquí conviene invertir tiempo extra, es donde compite directamente con Figma

**Entregable de la fase:** editor con funcionalidad comparable a Figma para proyectos multi-pantalla con sistema de diseño (componentes + tokens) consistente.

---

## 4. Fase 3 — Colaboración en tiempo real
**Duración: 7-9 semanas | Equipo: backend/IA engineer + frontend lead**

A diferencia de un roadmap MVP, esta fase **no es condicional a demanda post-lanzamiento**: es parte del producto final y se construye antes del beta cerrado, apoyada en el Spike B de la Fase 0.

### Semanas 1-3: Documento compartido y sincronización
- Integración de Yjs (CRDT) sobre la estructura del árbol de diseño definida en el schema
- Servidor de WebSockets (`collaboration-service`) para sincronización y presencia (cursores de otros usuarios, selección compartida)
- Resolución de conflictos en ediciones simultáneas del mismo nodo/propiedad

### Semanas 4-5: Presencia y permisos en vivo
- Indicadores de presencia (avatares, cursores con nombre, quién está en qué pantalla)
- Permisos por rol dentro de un proyecto compartido (editor, comentarista, solo lectura)

### Semanas 6-7: Comentarios
- Comentarios anclados a elementos específicos del diseño (cualquier pantalla)
- Menciones (@usuario) y notificaciones básicas (email + in-app) cuando alguien comenta o resuelve un hilo

### Semanas 8-9: Hardening de colaboración
- Pruebas de carga con múltiples usuarios simultáneos sobre el mismo proyecto
- Manejo de desconexiones/reconexiones sin pérdida de cambios
- Rendimiento del canvas con colaboración activa y diseños grandes (100+ elementos)

**Entregable de la fase:** varios usuarios editan el mismo proyecto multi-pantalla simultáneamente, ven la presencia de los demás en tiempo real y comentan sobre elementos específicos.

---

## 5. Fase 4 — Exportación multi-framework e integración con Figma
**Duración: 7-8 semanas | Equipo: backend/IA engineer**

### Semanas 1-3: Exportación a código
- Export Service: JSON → React + Tailwind (componentes limpios, no HTML inline), respetando componentes y tokens del sistema de diseño
- Soporte adicional de exportación a Vue + Tailwind (segundo framework, diferenciador frente a v0.dev que es React-céntrico)
- Exportación de **flujos multi-pantalla completos** con el routing/navegación ya resuelto en el código generado (no solo una pantalla suelta)
- Preview del código generado antes de descargar

### Semanas 4-6: Integración con Figma
> **Corrección técnica respecto a la redacción original de esta sección:**
> la API REST pública de Figma es de solo lectura — no permite crear ni
> editar nodos de un archivo. Crear contenido en Figma únicamente es
> posible desde la **Plugin API**, que corre dentro de Figma, no desde un
> servidor externo. Ver `services/export-service/README.md` y
> `tools/figma-plugin/README.md` para el detalle de la arquitectura real
> implementada (payload de importación + plugin de Figma con Plugin API).
- `export-service` resuelve el `DesignDocument` (componentes, variantes, tokens) a un payload plano de comandos de creación con posiciones absolutas
- `tools/figma-plugin/` — plugin de Figma que pide ese payload y crea los nodos reales con `figma.createFrame()`/`createText()`/etc. vía la Plugin API, agrupando cada pantalla en su propio frame
- Botón "Enviar a Figma" dentro del editor, que prepara el payload y (opcionalmente) comenta en el archivo de Figma destino vía la parte de la REST API que sí existe (comentarios)

### Semanas 7-8: Exportación de assets
- Exportación como imagen (PNG/SVG) por pantalla o del flujo completo
- Generación de thumbnails para la biblioteca de proyectos y plantillas

**Entregable de la fase:** un usuario exporta un flujo completo a código funcional (React o Vue), a Figma, o como assets visuales, sin pasos manuales de reconstrucción.

---

## 6. Fase 5 — Cuentas, equipos y monetización
**Duración: 5-6 semanas | Equipo: backend/IA engineer**

### Semanas 1-2: Equipos y permisos
- Gestión de equipos (invitar miembros, roles: admin/editor/comentarista)
- Proyectos compartidos a nivel de equipo, no solo individuales

### Semanas 3-4: Billing
- Integración con Stripe: checkout, suscripciones, webhooks
- Planes: freemium (X generaciones/mes gratis, 1 proyecto colaborativo) + Pro (generaciones y proyectos ilimitados, exportación multi-framework, soporte prioritario) + Team (facturación centralizada, roles avanzados)
- Límites de uso aplicados en `generation-service` y `collaboration-service` (ej. tope de colaboradores simultáneos en plan free)

### Semanas 5-6: Panel de administración
- `admin-dashboard`: métricas de uso, moderación de contenido generado, gestión de usuarios/equipos/planes

**Entregable de la fase:** producto monetizable con equipos, roles, planes y panel interno de administración.

---

## 7. Fase 6 — Biblioteca de plantillas, plugins y API pública
**Duración: 6-7 semanas | Equipo: todos**

Este alcance, tratado como "roadmap continuo post-lanzamiento" en un enfoque MVP, aquí se construye **antes** del lanzamiento público porque es parte del producto final prometido.

### Semanas 1-2: Biblioteca de plantillas
- Catálogo de plantillas generadas por IA y curadas por el equipo, organizadas por caso de uso (onboarding, landing, dashboard, checkout)
- "Empezar desde plantilla" como alternativa al prompt en blanco

### Semanas 3-4: API pública
- Endpoints públicos documentados para generación y exportación, con autenticación por API key
- Rate limiting y cuotas ligadas al plan de facturación
- Documentación (`docs/api-reference.md` ampliado a referencia pública con ejemplos)

### Semanas 5-7: Plugins e integraciones
- Integración con Framer y Webflow (exportación directa, no solo descarga de código)
- Arquitectura de plugins para que terceros extiendan tipos de nodo o integraciones de exportación (diseño del SDK, no necesariamente un marketplace abierto desde el día uno)

**Entregable de la fase:** plataforma extensible, con plantillas listas para usar, API pública documentada e integraciones con herramientas externas del ecosistema de diseño.

---

## 8. Fase 7 — Beta cerrada, hardening y lanzamiento
**Duración: 6-8 semanas | Equipo: todos**

### Semana 1: Onboarding de beta
- Reclutar 30-60 usuarios beta de los perfiles validados en Fase 0, priorizando equipos (para probar colaboración real) y no solo usuarios individuales
- Onboarding guiado dentro del producto (tutorial interactivo: generación, edición, invitar a un colaborador, exportar)

### Semanas 2-5: Iteración basada en datos
- Instrumentación de analytics: tasa de generación → edición, uso de colaboración simultánea, componentes/tokens reutilizados, elementos más editados, puntos de abandono
- Entrevistas de seguimiento con usuarios beta (¿dónde se traban? ¿la colaboración se siente confiable? ¿qué esperaban exportar y no podían?)
- Rendimiento del canvas con diseños grandes (100+ elementos) y colaboración activa — optimizar renderizado si es necesario
- Corrección de bugs de UX y de sincronización CRDT reportados

### Semanas 6-8: Hardening final pre-lanzamiento
- Revisión de todos los flujos críticos (generación multi-pantalla, edición, colaboración, guardado, exportación multi-framework, Figma, billing)
- Pruebas de carga y preparación de infraestructura para escalar más allá de usuarios beta concurrentes
- Página de precios y planes definidos, landing + waitlist

**Entregable de la fase:** producto final validado con datos reales de uso en equipos colaborando activamente, con retención semana 1 → semana 4 medida y aceptable, listo para lanzamiento público.

---

## 9. Lanzamiento
**Duración: continua desde el mes 16-20**

### Lanzamiento
- Product Hunt, comunidades de diseño (Designer News, r/UXDesign, Discord de diseño)
- Contenido de lanzamiento (video demo del flujo completo: prompt → multi-pantalla → colaboración en vivo → exportación, comparativa vs. Stitch/Uizard/v0.dev/Framer)
- Seguimiento activo de feedback inicial las primeras 2-3 semanas

### Roadmap continuo post-lanzamiento (mes 20+)
Con el producto final ya completo, lo que queda post-lanzamiento es **crecimiento del alcance**, no alcance prometido pendiente:
- Marketplace abierto de plugins de terceros
- Más frameworks de exportación (Svelte, Angular)
- Modelos de IA propios/fine-tuned para reducir costo y mejorar consistencia de generación
- Expansión de la biblioteca de plantillas vía contribuciones de la comunidad

---

## 10. Cronograma resumido

| Fase | Duración | Acumulado |
|---|---|---|
| 0. Investigación y validación | 5-7 semanas | Semana 7 |
| 1. Infraestructura y generación multi-pantalla | 10-12 semanas | Semana 19 |
| 2. Editor avanzado y sistema de diseño | 8-10 semanas | Semana 29 |
| 3. Colaboración en tiempo real | 7-9 semanas | Semana 38 |
| 4. Exportación multi-framework e integración Figma | 7-8 semanas | Semana 46 |
| 5. Cuentas, equipos y monetización | 5-6 semanas | Semana 52 |
| 6. Plantillas, plugins y API pública | 6-7 semanas | Semana 59 |
| 7. Beta cerrada, hardening y lanzamiento | 6-8 semanas | Semana 67 |
| **Lanzamiento** | — | **~Mes 16-17** (hasta ~20 con margen de riesgo) |

**Orden de construcción, no de alcance:** ninguna fase recorta funcionalidad del producto final — el orden existe para que cada pieza se construya sobre fundamentos ya validados (el schema completo de Fase 0 es lo que hace posible construir colaboración CRDT en Fase 3 sin rediseñar el árbol de datos a mitad de camino).

---

## 11. Equipo y responsabilidades

| Rol | Responsabilidad principal | Fases con más carga |
|---|---|---|
| Frontend/Canvas lead | Motor de edición, colaboración en tiempo real (cliente), UX del editor | 1, 2, 3 |
| Backend/IA engineer | Pipeline de generación multi-pantalla, colaboración (servidor/CRDT), exportación, billing, infraestructura | 1, 3, 4, 5 |
| Diseñador de producto (puede ser part-time) | UX del editor, sistema de componentes/tokens, onboarding, landing, plantillas | 2, 6, 7 |
| Growth/PM (opcional, o compartido) | Validación con usuarios, API pública/docs, lanzamiento, precios | 0, 6, 7 |

Con equipo de 2, el alcance completo (sin recortes) es significativamente más exigente que un MVP: es recomendable sumar apoyo freelance puntual en colaboración en tiempo real (Fase 3) y exportación multi-framework (Fase 4), que son las fases con mayor riesgo técnico añadido respecto al enfoque MVP original.

---

## 12. Presupuesto estimado (órdenes de magnitud)

| Concepto | Estimado mensual |
|---|---|
| API de LLM (generación multi-pantalla) | Más alto que en un MVP de una sola pantalla — cachear generaciones repetidas y limitar en el plan free reduce costo significativamente |
| Infraestructura de colaboración (WebSockets, servidor CRDT) | Costo adicional respecto a un producto sin tiempo real — dimensionar tras el Spike B de Fase 0 |
| Hosting (backend + DB + storage) | Bajo en Fase 0-2 (entornos pequeños), crece en Fase 3+ con WebSockets persistentes y en Fase 7 con usuarios beta/reales |
| Herramientas (diseño, analytics, error tracking) | Costo fijo pequeño, mayormente planes gratuitos/starter en fases tempranas |
| Freelance (colaboración en tiempo real, exportación multi-framework) | Puntual en Fase 3 y 4 |

*Nota: los costos de API de LLM y de infraestructura de colaboración en tiempo real son las dos variables más sensibles del modelo de negocio en este roadmap de alcance completo — medirlas desde ambos spikes técnicos de la Fase 0 es crítico para dimensionar el plan de precios.*

---

## 13. Riesgos y mitigaciones (registro detallado)

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| LLM no genera JSON válido consistentemente (ahora con componentes/multi-pantalla, más complejo que un MVP) | Media-Alta | Alto | Structured outputs/function calling estrictos + validación de esquema + reintentos automáticos + fallback a plantillas |
| El modelo de datos no es compatible con merge CRDT y hay que rediseñarlo a mitad de camino | Media | Alto | Spike B de Fase 0 valida esto *antes* de construir el resto del sistema sobre el schema |
| Editor se siente inferior a Figma, baja adopción | Media | Alto | Invertir en UX del editor desde Fase 1, no dejarlo para el final; testear con usuarios reales en cada fase |
| Costos de API de IA + infraestructura de colaboración insostenibles | Media | Medio | Cachear generaciones similares, límites en plan free, explorar modelos más económicos, dimensionar WebSockets desde el Spike B |
| Equipo pequeño (2-4) no alcanza a cubrir el alcance completo en el tiempo estimado | Alta | Alto | Orden de construcción estricto por fases (sección 10); sumar freelance puntual en Fase 3 y 4; el roadmap ya asume 16-20 meses en vez de 9-11, para no comprometer calidad bajo presión de tiempo |
| Time-to-market tardío frente a competidores que lanzan MVPs más rápido | Alta | Medio | Riesgo aceptado explícitamente por decisión de producto: se prioriza lanzar con el producto final completo en vez de iterar públicamente con un MVP recortado |

---

## 14. Métricas de éxito por etapa

- **Fase 1-2 (Generación + Editor):** % de sesiones donde se edita al menos un elemento tras generar; % de proyectos multi-pantalla generados vs. de una sola pantalla
- **Fase 3 (Colaboración):** % de proyectos con más de un colaborador activo; tiempo medio de sesión colaborativa; incidentes de pérdida de datos por conflicto de merge (objetivo: cero)
- **Fase 4-5:** tiempo hasta la primera exportación exitosa; número de componentes/tokens reutilizados por proyecto; conversión a planes de pago
- **Fase 6:** uso de plantillas vs. prompt en blanco; adopción de la API pública (si hay early adopters técnicos en la beta)
- **Fase 7 (Beta):** retención semana 1 → semana 4, NPS de usuarios beta, tasa de finalización del onboarding
- **Lanzamiento:** conversión free → pago, generaciones por usuario/mes, % de proyectos con colaboración activa, tiempo hasta el primer diseño exportado

---

## 15. Próximos pasos inmediatos

1. Escribir `design-schema-spec.md` v1 **completo** (componentes, tokens, multi-pantalla y compatibilidad CRDT) — documento fundacional de todo el proyecto, ya no se puede dejar simplificado para "después"
2. Ejecutar el Spike A (generación) de la Fase 0: validar que el LLM elegido genera el JSON completo de forma confiable
3. Ejecutar el Spike B (colaboración) de la Fase 0: validar que ese mismo schema es mergeable con CRDT sin pérdida de datos
4. Prototipo de UX en Figma del flujo completo prompt → multi-pantalla → edición → colaboración → exportación
5. Decidir el motor de canvas (Konva vs Fabric vs custom) y la librería CRDT (Yjs es la opción por defecto) según los resultados de ambos spikes
6. Definir los 2-3 perfiles de usuario objetivo antes de las entrevistas de validación, incluyendo cómo colaboran hoy en equipo
