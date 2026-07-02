/**
 * formConfig.js — Fuente única de verdad del formulario "Diálogo de Desempeño
 * y Crecimiento Profesional" (secciones 4 y 5 del plan).
 *
 * Esta configuración alimenta:
 *   - El render dinámico del formulario (Fase 3).
 *   - El render del panel de administración (Fase 6).
 *   - El mapeo por encabezados de columna en Google Sheets (Fase 4).
 *
 * IMPORTANTE: las llaves de las preguntas (`cr1`, `ca1`, `ref1`, ...) deben
 * coincidir EXACTAMENTE con los encabezados de la hoja `Respuestas`, para que
 * el Apps Script mapee por nombre de columna y no por posición fija.
 */

/**
 * Escala Likert compartida por las 18 preguntas de las 5 categorías (sección 4.2).
 * Se renderiza como 4 botones/radio (una sola respuesta por fila).
 * Orden de mayor a menor para presentarla de izquierda a derecha.
 */
export const likertScale = [
  { value: 4, label: 'Siempre' },
  { value: 3, label: 'Casi siempre' },
  { value: 2, label: 'Algunas veces' },
  { value: 1, label: 'Rara vez' },
]

/**
 * Las 5 categorías con sus 18 preguntas Likert (sección 4.3).
 * `id` de cada pregunta = llave de columna en Sheets.
 */
export const categories = [
  {
    id: 'cr',
    title: 'Compromiso y responsabilidad',
    questions: [
      { id: 'cr1', text: 'Cumplo puntualmente los horarios establecidos para las actividades de campo.' },
      { id: 'cr2', text: 'Cumplo puntualmente los horarios para reuniones y actividades de oficina.' },
      { id: 'cr3', text: 'Entrego oportunamente las tareas y productos asignados.' },
      { id: 'cr4', text: 'Remito la información solicitada dentro de los tiempos establecidos.' },
      { id: 'cr5', text: 'Los informes de actividades responden a los criterios establecidos que aseguran la calidad de los mismos: redacción, ortografía, contenido.' },
    ],
  },
  {
    id: 'ca',
    title: 'Comunicación y articulación',
    questions: [
      { id: 'ca1', text: 'Mantengo una comunicación oportuna con la Coordinación Pedagógica sobre avances, novedades y dificultades.' },
      { id: 'ca2', text: 'Informo oportunamente situaciones que requieren decisiones o acompañamiento.' },
      { id: 'ca3', text: 'Atiendo y respondo de manera oportuna las solicitudes de entidades e instituciones.' },
    ],
  },
  {
    id: 'dp',
    title: 'Desarrollo profesional',
    questions: [
      { id: 'dp1', text: 'Participo activamente en los procesos de formación propuestos.' },
      { id: 'dp2', text: 'Busco fortalecer mis conocimientos mediante procesos de autoformación.' },
      { id: 'dp3', text: 'Incorporo en mi práctica los aprendizajes obtenidos en los espacios de formación.' },
    ],
  },
  {
    id: 'te',
    title: 'Trabajo en equipo y convivencia',
    questions: [
      { id: 'te1', text: 'Contribuyo a mantener un ambiente de respeto y colaboración dentro del equipo.' },
      { id: 'te2', text: 'Escucho y valoro las opiniones de mis compañeros.' },
      { id: 'te3', text: 'Participo de manera propositiva en la solución de dificultades del equipo.' },
    ],
  },
  {
    id: 'gt',
    title: 'Gestión con actores del territorio',
    questions: [
      { id: 'gt1', text: 'Mantengo relaciones respetuosas y colaborativas con los Comités Municipales.' },
      { id: 'gt2', text: 'Establezco una comunicación efectiva con las Secretarías de Educación.' },
      { id: 'gt3', text: 'Fortalezco la articulación con Directores de Núcleo y Rectores.' },
      { id: 'gt4', text: 'Represento adecuadamente al Área de Educación en los diferentes escenarios institucionales.' },
    ],
  },
]

/**
 * Preguntas de texto abierto, agrupadas en las dos secciones del plan:
 *   - Reflexión (sección 4.4): ref1–ref4
 *   - Compromiso de mejoramiento (sección 4.5): compromiso, tres_palabras
 * Todas son obligatorias (sección 4.6).
 */
export const openSections = [
  {
    id: 'reflexion',
    title: 'Preguntas de reflexión',
    questions: [
      { id: 'ref1', text: '¿Cuál considero que ha sido mi principal fortaleza? ¿Qué evidencia la respalda?' },
      { id: 'ref2', text: '¿Qué aspecto de mi desempeño requiere mayor fortalecimiento y por qué?' },
      { id: 'ref3', text: '¿Qué acción concreta implementaré durante el próximo trimestre para mejorar mi desempeño?' },
      { id: 'ref4', text: '¿Qué apoyo requiero de la coordinación pedagógica para fortalecer mi gestión?' },
    ],
  },
  {
    id: 'compromiso',
    title: 'Compromiso de mejoramiento',
    questions: [
      { id: 'compromiso', text: 'Mi principal compromiso para el próximo semestre es:' },
      { id: 'tres_palabras', text: 'Si hoy un rector, un Director de Núcleo, una Secretaría de Educación o un compañero describiera mi forma de trabajar en tres palabras, ¿cuáles creo que serían? ¿Coinciden con la imagen profesional que deseo proyectar? ¿Por qué?' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Derivados (para no repetir listas de llaves en el resto del proyecto).
// ---------------------------------------------------------------------------

/** IDs de las 18 preguntas Likert, en orden: ['cr1', ..., 'gt4']. */
export const likertFieldIds = categories.flatMap((c) => c.questions.map((q) => q.id))

/** IDs de las 6 preguntas abiertas, en orden: ['ref1', ..., 'tres_palabras']. */
export const openFieldIds = openSections.flatMap((s) => s.questions.map((q) => q.id))

/**
 * Encabezados de la hoja `Respuestas` en el orden exacto de la sección 5.
 * `id` se genera en el frontend y `timestamp` en el Apps Script; el resto
 * son las llaves que envía el JSON del formulario.
 */
export const sheetHeaders = [
  'id',
  'timestamp',
  'profesional',
  'fecha',
  ...likertFieldIds,
  ...openFieldIds,
]
