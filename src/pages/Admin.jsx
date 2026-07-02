import { useEffect, useMemo, useState } from 'react'
import { categories } from '../config/formConfig'
import { listarRespuestas } from '../services/api'
import CategoryChart from '../components/CategoryChart'
import ResponsesTable from '../components/ResponsesTable'
import styles from './Admin.module.css'

/** Promedio del equipo (1–4) en una categoría, sobre todas las respuestas. */
function promedioCategoria(respuestas, cat) {
  const vals = []
  respuestas.forEach((r) => {
    cat.questions.forEach((q) => {
      const v = Number(r[q.id])
      if (!isNaN(v) && v > 0) vals.push(v)
    })
  })
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export default function Admin() {
  const [respuestas, setRespuestas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    let activo = true
    listarRespuestas()
      .then((data) => {
        if (activo) setRespuestas(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (activo) setError(err.message || 'No se pudieron cargar las respuestas.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  const datosGrafico = useMemo(
    () =>
      categories.map((cat) => ({
        nombre: cat.title,
        promedio: promedioCategoria(respuestas, cat),
      })),
    [respuestas],
  )

  const filtradas = useMemo(() => {
    const q = filtro.trim().toLowerCase()
    if (!q) return respuestas
    return respuestas.filter((r) =>
      String(r.profesional || '').toLowerCase().includes(q),
    )
  }, [respuestas, filtro])

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecera}>
        <h1>Panel de Administración</h1>
        <p>Autoevaluaciones registradas por el equipo del Área de Educación.</p>
      </header>

      {cargando && <p className={styles.estado}>Cargando respuestas…</p>}
      {error && <p className={styles.errorBanner}>{error}</p>}

      {!cargando && !error && (
        <>
          <div className={styles.resumen}>
            <div className={styles.stat}>
              <span className={styles.statNumero}>{respuestas.length}</span>
              <span className={styles.statLabel}>autoevaluaciones</span>
            </div>
          </div>

          {respuestas.length > 0 && <CategoryChart data={datosGrafico} />}

          <div className={styles.filtroWrap}>
            <input
              type="text"
              placeholder="Buscar por nombre…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className={styles.filtro}
            />
          </div>

          <ResponsesTable respuestas={filtradas} />
        </>
      )}
    </div>
  )
}
