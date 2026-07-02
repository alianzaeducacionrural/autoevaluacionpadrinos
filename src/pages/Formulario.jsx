import { useMemo, useState } from 'react'
import {
  categories,
  openSections,
  likertScale,
  likertFieldIds,
  openFieldIds,
} from '../config/formConfig'
import { team } from '../config/team'
import { enviarAutoevaluacion } from '../services/api'
import CategoryCard from '../components/CategoryCard'
import LikertQuestion from '../components/LikertQuestion'
import styles from './Formulario.module.css'

const HOY = new Date().toISOString().slice(0, 10)

function estadoInicial() {
  const base = { profesional: '', fecha: HOY }
  likertFieldIds.forEach((id) => { base[id] = null })
  openFieldIds.forEach((id) => { base[id] = '' })
  return base
}

export default function Formulario() {
  const [datos, setDatos] = useState(estadoInicial)
  const [intentoEnvio, setIntentoEnvio] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  function setCampo(id, valor) {
    setDatos((prev) => ({ ...prev, [id]: valor }))
  }

  const faltantes = useMemo(() => {
    const f = new Set()
    if (!datos.profesional) f.add('profesional')
    likertFieldIds.forEach((id) => { if (datos[id] == null) f.add(id) })
    openFieldIds.forEach((id) => { if (!datos[id]?.trim()) f.add(id) })
    return f
  }, [datos])

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorEnvio('')
    if (faltantes.size > 0) {
      setIntentoEnvio(true)
      document
        .querySelector(`[data-campo="${[...faltantes][0]}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setEnviando(true)
    try {
      await enviarAutoevaluacion({ id: crypto.randomUUID(), ...datos })
      setEnviado(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
          Tu autoevaluación fue registrada correctamente. Gracias por tomarte el tiempo
          de reflexionar sobre tu trabajo.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.pagina}>
      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.kicker}>Área de Educación · Comité de Cafeteros de Caldas</span>
          <h1 className={styles.heroTitulo}>
            Diálogo de Desempeño y<br />Crecimiento Profesional
          </h1>

          <div className={styles.bloques}>
            <div className={styles.bloque}>
              <span className={styles.bloqueLabel}>Objetivo</span>
              <p className={styles.bloqueTexto}>
                Promover un ejercicio de autoevaluación y reflexión sobre el desempeño
                individual, mediante la valoración de aspectos clave del ejercicio
                profesional, con el fin de reconocer fortalezas, identificar oportunidades
                de mejora y establecer compromisos que contribuyan al fortalecimiento del
                equipo y a la calidad de los procesos de acompañamiento.
              </p>
            </div>
            <div className={styles.bloque}>
              <span className={styles.bloqueLabel}>Instrucciones</span>
              <p className={styles.bloqueTexto}>
                Este no es un ejercicio de calificación, sino una oportunidad para
                reflexionar sobre nuestra práctica profesional. La invitación es a
                responder con honestidad, reconociendo los logros alcanzados y aquellos
                aspectos que pueden fortalecerse. La información servirá como insumo para
                la retroalimentación individual y la construcción de acciones de
                mejoramiento continuo.
              </p>
            </div>
          </div>

          {/* Escala */}
          <div className={styles.escala}>
            <span className={styles.escalaTitulo}>Escala de valoración</span>
            <div className={styles.escalaChips}>
              {likertScale.map((op) => (
                <span key={op.value} className={styles.chip}>
                  <span className={styles.chipNum}>{op.value}</span>
                  {op.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
              className={`${styles.control} ${
                intentoEnvio && faltantes.has('profesional') ? styles.controlError : ''
              }`}
            >
              <option value="">Selecciona tu nombre…</option>
              {team.map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.campo}>
            <label htmlFor="fecha" className={styles.etiqueta}>Fecha</label>
            <input
              id="fecha"
              type="date"
              value={datos.fecha}
              onChange={(e) => setCampo('fecha', e.target.value)}
              className={styles.control}
            />
          </div>
        </CategoryCard>

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
                  placeholder="Escribe tu reflexión…"
                  className={`${styles.control} ${styles.textarea} ${
                    intentoEnvio && faltantes.has(q.id) ? styles.controlError : ''
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
            <><span className={styles.spinner} /> Enviando…</>
          ) : (
            'Enviar mi autoevaluación'
          )}
        </button>
      </form>
    </div>
  )
}
