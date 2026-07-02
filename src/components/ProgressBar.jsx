import styles from './ProgressBar.module.css'

/**
 * Barra de progreso fija en la parte superior del formulario.
 * Muestra el porcentaje de preguntas obligatorias ya respondidas.
 */
export default function ProgressBar({ respondidas, total }) {
  const porcentaje = total > 0 ? Math.round((respondidas / total) * 100) : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <span className={styles.marca}>Autoevaluación de Desempeño</span>
        <span className={styles.contador}>
          {respondidas} / {total}
        </span>
      </div>
      <div className={styles.fondo}>
        <div className={styles.relleno} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  )
}
