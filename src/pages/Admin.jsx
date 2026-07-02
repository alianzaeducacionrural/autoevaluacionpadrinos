import { useEffect, useMemo, useState } from 'react'
import { categories } from '../config/formConfig'
import { listarRespuestas } from '../services/api'
import CategoryChart from '../components/CategoryChart'
import ResponsesTable from '../components/ResponsesTable'
import ProfileModal from '../components/ProfileModal'
import styles from './Admin.module.css'

function promedioCategoria(respuestas, cat) {
  const vals = []
  respuestas.forEach((r) =>
    cat.questions.forEach((q) => {
      const v = Number(r[q.id])
      if (!isNaN(v) && v > 0) vals.push(v)
    }),
  )
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export default function Admin() {
  const [respuestas, setRespuestas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('')
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    let activo = true
    listarRespuestas()
      .then((data) => { if (activo) setRespuestas(Array.isArray(data) ? data : []) })
      .catch((err) => { if (activo) setError(err.message || 'No se pudieron cargar las respuestas.') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [])

  const datosGrafico = useMemo(
    () => categories.map((cat) => ({
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

      {/* ── Header ── */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.titulo}>Panel de resultados</h1>
            <p className={styles.subtitulo}>Autoevaluaciones · Área de Educación</p>
          </div>
        </div>
      </div>

      <div className={styles.contenido}>

        {cargando && (
          <div className={styles.estado}>
            <div className={styles.spinner} />
            <p>Cargando autoevaluaciones…</p>
          </div>
        )}

        {error && <div className={styles.errorBanner}>{error}</div>}

        {!cargando && !error && (
          <>
            {/* Stats */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statNum}>{respuestas.length}</span>
                <span className={styles.statLabel}>Autoevaluaciones</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNum}>{filtradas.length}</span>
                <span className={styles.statLabel}>Mostrando</span>
              </div>
            </div>

            {/* Gráfica */}
            {respuestas.length > 0 && <CategoryChart data={datosGrafico} />}

            {/* Buscador + lista */}
            <div className={styles.listaSection}>
              <div className={styles.listaHeader}>
                <h2 className={styles.listaTitulo}>Respuestas individuales</h2>
                <input
                  type="text"
                  placeholder="Buscar por nombre…"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className={styles.busqueda}
                />
              </div>
              <ResponsesTable respuestas={filtradas} onSelect={setSeleccionado} />
            </div>
          </>
        )}
      </div>

      {/* Modal de perfil */}
      {seleccionado && (
        <ProfileModal
          respuesta={seleccionado}
          onClose={() => setSeleccionado(null)}
        />
      )}
    </div>
  )
}
