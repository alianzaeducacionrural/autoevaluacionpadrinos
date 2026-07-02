# Plan técnico: Autoevaluación de Desempeño — Diálogo de Desempeño y Crecimiento Profesional

## 1. Objetivo del proyecto

Digitalizar el formulario "Diálogo de Desempeño y Crecimiento Profesional" para que cada miembro del equipo pueda diligenciarlo desde un enlace web, y construir un panel de administración (sin autenticación) donde se pueda revisar y analizar las respuestas de todo el equipo.

## 2. Arquitectura general

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌───────────────────┐
│  React + Vite (SPA)  │  HTTP  │  Google Apps Script (GAS) │  API   │  Google Sheets     │
│  GitHub Pages        │ ─────► │  Web App (doPost/doGet)   │ ─────► │  (base de datos)   │
│  /  → Formulario     │        │  Sin autenticación        │        │  Hoja "Respuestas" │
│  /admin → Panel      │        └──────────────────────────┘        └───────────────────┘
└─────────────────────┘
```

- **Frontend:** React + Vite, mismo stack usado en proyectos anteriores del equipo (Colombia a Todo Colombiano, Seguimiento a Egresados).
- **Backend/API:** Google Apps Script publicado como Web App, actuando como capa intermedia entre el frontend y Google Sheets (mismo patrón que "Sistema de Seguimiento a Egresados").
- **Base de datos:** Google Sheets — una hoja `Respuestas` con una fila por autoevaluación enviada.
- **Hosting:** GitHub Pages (repo nuevo o dentro de la organización `alianzaeducacionrural`, a definir).
- **Autenticación:** ninguna, ni en el formulario ni en `/admin` (decisión explícita). Ver sección 8 sobre implicaciones.

## 3. Estructura de rutas de la app

| Ruta | Vista | Descripción |
|---|---|---|
| `/` | Formulario | Autoevaluación que diligencia cada profesional |
| `/admin` | Panel de administración | Tabla de respuestas + promedios y gráficas por categoría |

Usar React Router con `HashRouter` (no `BrowserRouter`) para que las rutas funcionen correctamente en GitHub Pages sin configuración adicional de servidor.

## 4. Estructura del formulario

### 4.1 Datos generales

| Campo | Tipo | Notas |
|---|---|---|
| `profesional` | Select (lista desplegable) | Lista fija del equipo, definida en `src/config/team.js`. **Placeholder — reemplazar con los nombres reales antes de publicar.** |
| `fecha` | Date | Se autocompleta con la fecha actual, editable |

### 4.2 Escala de valoración (Likert 1–4)

Todas las preguntas de las 5 categorías usan la misma escala, mostrada como 4 botones/radio (no checkboxes, para forzar una sola respuesta por fila):

| Valor | Significado |
|---|---|
| 4 | Siempre |
| 3 | Casi siempre |
| 2 | Algunas veces |
| 1 | Rara vez |

### 4.3 Categorías y preguntas (18 ítems en total)

Definir esto como un array de configuración (`src/config/formConfig.js`) que alimenta tanto el render del formulario como las llaves de columnas en Sheets — una sola fuente de verdad.

**1. Compromiso y responsabilidad** (`cr`)
1. `cr1` — Cumplo puntualmente los horarios establecidos para las actividades de campo.
2. `cr2` — Cumplo puntualmente los horarios para reuniones y actividades de oficina.
3. `cr3` — Entrego oportunamente las tareas y productos asignados.
4. `cr4` — Remito la información solicitada dentro de los tiempos establecidos.
5. `cr5` — Los informes de actividades responden a los criterios establecidos que aseguran la calidad de los mismos: redacción, ortografía, contenido.

**2. Comunicación y articulación** (`ca`)
1. `ca1` — Mantengo una comunicación oportuna con la Coordinación Pedagógica sobre avances, novedades y dificultades.
2. `ca2` — Informo oportunamente situaciones que requieren decisiones o acompañamiento.
3. `ca3` — Atiendo y respondo de manera oportuna las solicitudes de entidades e instituciones.

**3. Desarrollo profesional** (`dp`)
1. `dp1` — Participo activamente en los procesos de formación propuestos.
2. `dp2` — Busco fortalecer mis conocimientos mediante procesos de autoformación.
3. `dp3` — Incorporo en mi práctica los aprendizajes obtenidos en los espacios de formación.

**4. Trabajo en equipo y convivencia** (`te`)
1. `te1` — Contribuyo a mantener un ambiente de respeto y colaboración dentro del equipo.
2. `te2` — Escucho y valoro las opiniones de mis compañeros.
3. `te3` — Participo de manera propositiva en la solución de dificultades del equipo.

**5. Gestión con actores del territorio** (`gt`)
1. `gt1` — Mantengo relaciones respetuosas y colaborativas con los Comités Municipales.
2. `gt2` — Establezco una comunicación efectiva con las Secretarías de Educación.
3. `gt3` — Fortalezco la articulación con Directores de Núcleo y Rectores.
4. `gt4` — Represento adecuadamente al Área de Educación en los diferentes escenarios institucionales.

### 4.4 Preguntas de reflexión (texto abierto)

| Campo | Pregunta |
|---|---|
| `ref1` | ¿Cuál considero que ha sido mi principal fortaleza? ¿Qué evidencia la respalda? |
| `ref2` | ¿Qué aspecto de mi desempeño requiere mayor fortalecimiento y por qué? |
| `ref3` | ¿Qué acción concreta implementaré durante el próximo trimestre para mejorar mi desempeño? |
| `ref4` | ¿Qué apoyo requiero de la coordinación pedagógica para fortalecer mi gestión? |

### 4.5 Compromiso de mejoramiento (texto abierto)

| Campo | Pregunta |
|---|---|
| `compromiso` | Mi principal compromiso para el próximo semestre es: |
| `tres_palabras` | Si hoy un rector, un Director de Núcleo, una Secretaría de Educación o un compañero describiera mi forma de trabajar en tres palabras, ¿cuáles creo que serían? ¿Coinciden con la imagen profesional que deseo proyectar? ¿Por qué? |

### 4.6 UX del formulario

- Formulario dividido por secciones (una card por categoría) con barra de progreso simple.
- Validación: todas las preguntas Likert y `profesional` son obligatorias; las de texto abierto son obligatorias también (son el corazón del ejercicio de reflexión).
- Pantalla de confirmación al enviar ("Tu autoevaluación fue registrada correctamente").
- Botón deshabilitado + spinner mientras se envía, para evitar doble envío.
- No hay edición posterior: cada envío es una autoevaluación única (sin período/ciclo).

## 5. Estructura de la hoja de Google Sheets

Nombre de la hoja: `Respuestas`. Una fila por envío, columnas en este orden:

| Columna | Campo | Tipo |
|---|---|---|
| A | `id` | UUID generado en el frontend |
| B | `timestamp` | Fecha/hora de envío (generada en GAS con `new Date()`) |
| C | `profesional` | Texto |
| D | `fecha` | Fecha ingresada en el formulario |
| E–I | `cr1`–`cr5` | Número 1–4 |
| J–L | `ca1`–`ca3` | Número 1–4 |
| M–O | `dp1`–`dp3` | Número 1–4 |
| P–R | `te1`–`te3` | Número 1–4 |
| S–V | `gt1`–`gt4` | Número 1–4 |
| W–Z | `ref1`–`ref4` | Texto largo |
| AA | `compromiso` | Texto largo |
| AB | `tres_palabras` | Texto largo |

La primera fila de la hoja debe tener estos mismos encabezados (deben coincidir exactamente con las llaves usadas en el JSON que envía el frontend, para que el Apps Script pueda mapear por nombre de columna en vez de por posición fija — así es más fácil agregar/quitar preguntas después).

## 6. Google Apps Script (capa API)

Crear un único archivo `Code.gs` vinculado a la hoja de cálculo, con dos funciones:

- **`doPost(e)`**: recibe JSON del formulario (`e.postData.contents`), genera `id` y `timestamp` si no vienen, y hace `sheet.appendRow(...)` mapeando por encabezados. Retorna `{ status: "ok" }` como JSON.
- **`doGet(e)`**: si `e.parameter.action === "list"`, retorna todas las filas de `Respuestas` como JSON (array de objetos, usando la primera fila como llaves). Este es el endpoint que consume el panel `/admin`. Sin ningún chequeo de autenticación, según lo definido.

Notas de implementación para Claude Code:
- Publicar el script como **Web App** (`Deploy > New deployment > Web app`), acceso: "Anyone" (para que GitHub Pages, que no tiene backend propio, pueda llamarlo sin login).
- Habilitar CORS agregando los headers correspondientes en las respuestas de `doGet`/`doPost` usando `ContentService` con `setMimeType(ContentService.MimeType.JSON)`.
- Guardar la URL del Web App desplegado en una variable de entorno del frontend (`.env` → `VITE_GAS_API_URL`), no hardcodeada.

## 7. Panel de administración (`/admin`)

Sin login. Al cargar, hace `GET {VITE_GAS_API_URL}?action=list` y con la respuesta construye:

1. **Tabla de respuestas**: una fila por envío, columnas `profesional`, `fecha`, promedio general (1–4), y un botón "Ver detalle" que abre un modal/expansión con las 18 respuestas Likert agrupadas por categoría y las 6 respuestas abiertas completas.
2. **Promedios y gráficas por categoría**: gráfico de barras con el promedio del equipo en cada una de las 5 categorías (`cr`, `ca`, `dp`, `te`, `gt`), calculado sobre todas las respuestas cargadas. Usar `recharts` para los gráficos.
3. **Filtro simple**: buscador de texto por nombre de profesional sobre la tabla.

No se requiere autenticación ni roles — es una decisión explícita del equipo, ver consideración de seguridad abajo.

## 8. Consideración de seguridad (léxico, no bloqueante)

Como no hay autenticación, cualquier persona con el enlace `/admin` puede ver todas las respuestas del equipo (incluyendo las reflexiones abiertas), y cualquiera con la URL del Apps Script podría, en teoría, hacer `POST` de datos falsos a la hoja. Como es un formulario interno de equipo y la decisión de no usar auth ya está tomada, dos mitigaciones simples y de bajo costo que puedes considerar más adelante sin cambiar la arquitectura:

- No enlazar `/admin` desde ningún menú público; compartir la URL solo internamente (seguridad por "no listado", no por control de acceso real).
- Restringir el deployment de Apps Script con un parámetro secreto simple en la URL (`?key=...`) si en algún momento se quiere subir un poco el nivel sin construir un sistema de login completo.

Esto queda a tu criterio — no es parte del alcance actual, solo una nota para tenerla presente.

## 9. Estructura de carpetas propuesta (React + Vite)

```
autoevaluacion-equipo/
├── src/
│   ├── config/
│   │   ├── team.js              # lista de nombres del equipo (placeholder a llenar)
│   │   └── formConfig.js        # categorías + preguntas (fuente única de verdad)
│   ├── pages/
│   │   ├── Formulario.jsx
│   │   └── Admin.jsx
│   ├── components/
│   │   ├── LikertQuestion.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── ResponsesTable.jsx
│   │   └── CategoryChart.jsx
│   ├── services/
│   │   └── api.js               # fetch POST/GET contra VITE_GAS_API_URL
│   ├── App.jsx                  # HashRouter con las 2 rutas
│   └── main.jsx
├── .env.example
├── vite.config.js
└── package.json
```

## 10. Fases de implementación sugeridas para Claude Code

1. **Setup del proyecto** — Vite + React + React Router + Tailwind (o el sistema de estilos que se use en los otros proyectos del equipo) + recharts.
2. **`formConfig.js`** — definir el array de categorías/preguntas como fuente única de verdad.
3. **Formulario (`/`)** — render dinámico desde `formConfig.js`, validación, envío a GAS, pantalla de confirmación.
4. **Google Apps Script** — crear la hoja `Respuestas` con encabezados, escribir `doPost`/`doGet`, desplegar como Web App, probar con Postman o `curl` antes de conectar el frontend.
5. **Conectar formulario a GAS** — variable de entorno, manejo de errores de red, estado de carga.
6. **Panel admin (`/admin`)** — tabla + gráficas de promedios por categoría.
7. **Despliegue a GitHub Pages** — configurar `vite.config.js` con el `base` correcto y el workflow de deploy (o `gh-pages` npm package, como en proyectos anteriores del equipo).
8. **Prueba end-to-end** — llenar el formulario real, verificar que llega a Sheets, verificar que el panel admin lo refleja.

## 11. Pendientes antes de desarrollar

- [ ] Reemplazar `team.js` con los nombres reales del equipo.
- [ ] Crear la hoja de Google Sheets vacía con los encabezados de la sección 5, y obtener su ID.
- [ ] Definir el nombre del repositorio en GitHub y si irá bajo la organización `alianzaeducacionrural` o una cuenta personal.
- [ ] Decidir si se aplica alguna de las mitigaciones de seguridad de la sección 8, o se deja completamente abierto.
