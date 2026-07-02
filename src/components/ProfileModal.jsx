import { useEffect } from 'react'
import { categories, openSections } from '../config/formConfig'
import styles from './ProfileModal.module.css'

const SCORE_LABEL = { 4: 'Siempre', 3: 'Casi siempre', 2: 'Algunas veces', 1: 'Rara vez' }

function scoreVariant(v) {
  if (v >= 3.5) return styles.emerald
  if (v >= 2.5) return styles.sky
  if (v >= 1.5) return styles.amber
  return styles.rose
}

function promCat(r, cat) {
  const vals = cat.questions
    .map((q) => Number(r[q.id]))
    .filter((v) => !isNaN(v) && v > 0)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function promedioGeneral(r) {
  const vals = []
  categories.forEach((cat) =>
    cat.questions.forEach((q) => {
      const v = Number(r[q.id])
      if (!isNaN(v) && v > 0) vals.push(v)
    }),
  )
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function iniciales(nombre) {
  return String(nombre || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function ProfileModal({ respuesta, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!respuesta) return null

  const r = respuesta
  const prom = promedioGeneral(r)
  const fecha = String(r.fecha ?? '').slice(0, 10)

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">

        {/* ── Cabecera fija ── */}
        <div className={styles.header}>
          <div className={styles.avatar}>{iniciales(r.profesional)}</div>
          <div className={styles.headerInfo}>
            <h2 className={styles.nombre}>{r.profesional}</h2>
            <span className={styles.fechaTag}>{fecha}</span>
          </div>
          {prom != null && (
            <div className={`${styles.promGral} ${scoreVariant(prom)}`}>
              <span className={styles.promNum}>{prom.toFixed(1)}</span>
              <span className={styles.promLabel}>promedio</span>
            </div>
          )}
          <button className={styles.cerrar} onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Cuerpo scrollable ── */}
        <div className={styles.body}>

          {/* Resumen visual por categoría */}
          <section className={styles.seccion}>
            <h3 className={styles.seccionTitulo}>Resumen por categoría</h3>
            <div className={styles.catGrid}>
              {categories.map((cat) => {
                const p = promCat(r, cat)
                return (
                  <div key={cat.id} className={styles.catCard}>
                    <span className={styles.catNombre}>{cat.title}</span>
                    <span className={`${styles.catScore} ${p != null ? scoreVariant(p) : ''}`}>
                      {p != null ? p.toFixed(1) : '—'}
                    </span>
                    <div className={styles.catBarFondo}>
                      <div
                        className={`${styles.catBarRelleno} ${p != null ? scoreVariant(p) : ''}`}
                        style={{ width: p != null ? `${(p / 4) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Detalle Likert por categoría */}
          {categories.map((cat) => (
            <section key={cat.id} className={styles.seccion}>
              <h3 className={styles.seccionTitulo}>{cat.title}</h3>
              <div className={styles.preguntasList}>
                {cat.questions.map((q) => {
                  const v = Number(r[q.id])
                  const valido = !isNaN(v) && v > 0
                  return (
                    <div key={q.id} className={styles.preguntaFila}>
                      <p className={styles.preguntaTexto}>{q.text}</p>
                      <span className={`${styles.scoreChip} ${valido ? scoreVariant(v) : styles.vacio}`}>
                        {valido ? (
                          <>
                            <span className={styles.scoreNum}>{v}</span>
                            <span className={styles.scoreEtiq}>{SCORE_LABEL[v]}</span>
                          </>
                        ) : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}

          {/* Reflexiones y compromisos */}
          {openSections.map((sec) => (
            <section key={sec.id} className={styles.seccion}>
              <h3 className={styles.seccionTitulo}>{sec.title}</h3>
              <div className={styles.abiertasList}>
                {sec.questions.map((q) => (
                  <div key={q.id} className={styles.abiertaCard}>
                    <p className={styles.abiertaPregunta}>{q.text}</p>
                    <p className={styles.abiertaRespuesta}>{r[q.id] || '—'}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
