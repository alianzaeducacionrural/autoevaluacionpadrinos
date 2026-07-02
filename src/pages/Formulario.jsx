import { useMemo, useState } from 'react'
import {
  categories,
  openSections,
  likertFieldIds,
  openFieldIds,
} from '../config/formConfig'
import { team } from '../config/team'
import { enviarAutoevaluacion } from '../services/api'
import ProgressBar from '../components/ProgressBar'
import CategoryCard from '../components/CategoryCard'
import LikertQuestion from '../components/LikertQuestion'
import styles from './Formulario.module.css'

const HOY = new Date().toISOString().slice(0, 10)

/** Estado inicial: profesional/fecha + likert en null + abiertas en ''. */
function estadoInicial() {
  const base = { profesional: '', fecha: HOY }
  likertFieldIds.forEach((id) => {
    base[id] = null
  })
  openFieldIds.forEach((id) => {
    base[id] = ''
  })
  return base
}

// Total de campos obligatorios: profesional + 18 Likert + 6 abiertas.
const TOTAL_OBLIGATORIOS = 1 + likertFieldIds.length + openFieldIds.length

export default function Formulario() {
  const [datos, setDatos] = useState(estadoInicial)
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  function setCampo(id, valor) {
    setDatos((prev) => ({ ...prev, [id]: valor }))
  }

  // Cuenta de obligatorios respondidos, para la barra de progreso.
  const respondidas = useMemo(() => {
    let n = 0
    if (datos.profesional) n++
    likertFieldIds.forEach((id) => {
      if (datos[id] != null) n++
    })
    openFieldIds.forEach((id) => {
      if (datos[id] && datos[id].trim()) n++
    })
    return n
  }, [datos])

  // IDs de campos obligatorios sin responder (para marcar en rojo tras intentar enviar).
  const faltantes = useMemo(() => {
    const f = new Set()
    if (!datos.profesional) f.add('profesional')
    likertFieldIds.forEach((id) => {
      if (datos[id] == null) f.add(id)
    })
    openFieldIds.forEach((id) => {
      if (!datos[id] || !datos[id].trim()) f.add(id)
    })
    return f
  }, [datos])

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorEnvio('')
    if (faltantes.size > 0) {
      setIntentoEnvio(true)
      // Sube a la primera sección incompleta.
      const primero = document.querySelector(`[data-campo="${[...faltantes][0]}"]`)
      primero?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setEnviando(true)
    try {
      const payload = { id: crypto.randomUUID(), ...datos }
      await enviarAutoevaluacion(payload)
      setEnviado(true)
    } catch (err) {
      setErrorEnvio(err.message || 'Ocurrió un error al enviar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className={styles.confirmacion}>
        <div className={styles.checkCirculo}>✓</div>
        <h1>¡Autoevaluación registrada!</h1>
        <p>
          Tu autoevaluación fue registrada correctamente. Gracias por completar el
          ejercicio de reflexión.
        </p>
      </div>
    )
  }

  return (
    <>
      <ProgressBar respondidas={respondidas} total={TOTAL_OBLIGATORIOS} />

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <header className={styles.intro}>
          <h1>Diálogo de Desempeño y Crecimiento Profesional</h1>
          <p>
            Área de Educación — Comité de Cafeteros de Caldas. Responde con
            honestidad; este es un ejercicio de reflexión personal.
          </p>
        </header>

        {/* Datos generales */}
        <CategoryCard title="Datos generales">
          <div className={styles.campo} data-campo="profesional">
            <label htmlFor="profesional" className={styles.etiqueta}>
              Profesional <span className={styles.asterisco}>*</span>
            </label>
            <select
              id="profesional"
              value={datos.profesional}
              onChange={(e) => setCampo('profesional', e.target.value)}
              className={`${styles.select} ${
                intentoEnvio && faltantes.has('profesional') ? styles.inputError : ''
              }`}
            >
              <option value="">Selecciona tu nombre…</option>
              {team.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.campo}>
            <label htmlFor="fecha" className={styles.etiqueta}>
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              value={datos.fecha}
              onChange={(e) => setCampo('fecha', e.target.value)}
              className={styles.input}
            />
          </div>
        </CategoryCard>

        {/* Escala de referencia */}
        <p className={styles.escalaNota}>
          Escala: <strong>4</strong> Siempre · <strong>3</strong> Casi siempre ·{' '}
          <strong>2</strong> Algunas veces · <strong>1</strong> Rara vez
        </p>

        {/* Categorías Likert */}
        {categories.map((cat, i) => (
          <CategoryCard key={cat.id} index={i + 1} title={cat.title}>
            {cat.questions.map((q) => (
              <div key={q.id} data-campo={q.id}>
                <LikertQuestion
                  question={q}
                  value={datos[q.id]}
                  onChange={setCampo}
                  error={intentoEnvio && faltantes.has(q.id)}
                />
              </div>
            ))}
          </CategoryCard>
        ))}

        {/* Preguntas abiertas */}
        {openSections.map((sec) => (
          <CategoryCard key={sec.id} title={sec.title}>
            {sec.questions.map((q) => (
              <div key={q.id} className={styles.campo} data-campo={q.id}>
                <label htmlFor={q.id} className={styles.etiqueta}>
                  {q.text} <span className={styles.asterisco}>*</span>
                </label>
                <textarea
                  id={q.id}
                  rows={4}
                  value={datos[q.id]}
                  onChange={(e) => setCampo(q.id, e.target.value)}
                  className={`${styles.textarea} ${
                    intentoEnvio && faltantes.has(q.id) ? styles.inputError : ''
                  }`}
                />
              </div>
            ))}
          </CategoryCard>
        ))}

        {intentoEnvio && faltantes.size > 0 && (
          <p className={styles.aviso}>
            Faltan {faltantes.size} respuesta(s) por completar. Todas las preguntas son
            obligatorias.
          </p>
        )}

        {errorEnvio && <p className={styles.errorBanner}>{errorEnvio}</p>}

        <button type="submit" className={styles.enviar} disabled={enviando}>
          {enviando ? (
            <>
              <span className={styles.spinner} /> Enviando…
            </>
          ) : (
            'Enviar autoevaluación'
          )}
        </button>
      </form>
    </>
  )
}
