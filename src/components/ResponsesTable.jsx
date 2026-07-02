import { categories } from '../config/formConfig'
import styles from './ResponsesTable.module.css'

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

function scoreVariant(v) {
  if (v >= 3.5) return styles.emerald
  if (v >= 2.5) return styles.sky
  if (v >= 1.5) return styles.amber
  return styles.rose
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

export default function ResponsesTable({ respuestas, onSelect }) {
  if (!respuestas.length) {
    return (
      <div className={styles.vacio}>
        <span className={styles.vacioIcon}>📋</span>
        <p>No hay autoevaluaciones que coincidan.</p>
      </div>
    )
  }

  return (
    <div className={styles.lista}>
      {respuestas.map((r) => {
        const prom = promedioGeneral(r)
        const fecha = String(r.fecha ?? '').slice(0, 10)
        return (
          <div key={r.id} className={styles.fila}>
            <div className={styles.avatar}>{iniciales(r.profesional)}</div>
            <div className={styles.info}>
              <span className={styles.nombre}>{r.profesional}</span>
              <span className={styles.fecha}>{fecha}</span>
            </div>
            {prom != null && (
              <span className={`${styles.scorePill} ${scoreVariant(prom)}`}>
                {prom.toFixed(1)}
              </span>
            )}
            <button
              type="button"
              className={styles.verBtn}
              onClick={() => onSelect(r)}
            >
              Ver perfil
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
