import { Fragment, useState } from 'react'
import { categories, openSections, likertFieldIds } from '../config/formConfig'
import styles from './ResponsesTable.module.css'

/** Promedio general (1–4) de las 18 preguntas Likert de una respuesta. */
function promedioGeneral(r) {
  const vals = likertFieldIds
    .map((id) => Number(r[id]))
    .filter((v) => !isNaN(v) && v > 0)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function Detalle({ r }) {
  return (
    <div className={styles.detalle}>
      {categories.map((cat) => (
        <div key={cat.id} className={styles.grupo}>
          <h4 className={styles.grupoTitulo}>{cat.title}</h4>
          {cat.questions.map((q) => (
            <div key={q.id} className={styles.itemLikert}>
              <span className={styles.itemTexto}>{q.text}</span>
              <span className={styles.itemValor}>{r[q.id] || '—'}</span>
            </div>
          ))}
        </div>
      ))}

      {openSections.map((sec) => (
        <div key={sec.id} className={styles.grupo}>
          <h4 className={styles.grupoTitulo}>{sec.title}</h4>
          {sec.questions.map((q) => (
            <div key={q.id} className={styles.itemAbierto}>
              <p className={styles.preguntaAbierta}>{q.text}</p>
              <p className={styles.respuestaAbierta}>{r[q.id] || '—'}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function ResponsesTable({ respuestas }) {
  const [expandido, setExpandido] = useState(null)

  if (!respuestas.length) {
    return <p className={styles.vacio}>No hay respuestas que coincidan.</p>
  }

  return (
    <div className={styles.tablaWrap}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Profesional</th>
            <th>Fecha</th>
            <th>Promedio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {respuestas.map((r) => {
            const prom = promedioGeneral(r)
            const abierto = expandido === r.id
            return (
              <Fragment key={r.id}>
                <tr>
                  <td>{r.profesional}</td>
                  <td>{String(r.fecha ?? '').slice(0, 10)}</td>
                  <td>
                    <span className={styles.badge}>
                      {prom != null ? prom.toFixed(2) : '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.verBtn}
                      onClick={() => setExpandido(abierto ? null : r.id)}
                    >
                      {abierto ? 'Ocultar' : 'Ver detalle'}
                    </button>
                  </td>
                </tr>
                {abierto && (
                  <tr>
                    <td colSpan={4} className={styles.celdaDetalle}>
                      <Detalle r={r} />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
