import { likertScale } from '../config/formConfig'
import styles from './LikertQuestion.module.css'

/**
 * Una pregunta Likert: enunciado + 4 botones de la escala compartida.
 * Se usa role="radiogroup"/"radio" para forzar una sola respuesta por fila.
 */
export default function LikertQuestion({ question, value, onChange, error }) {
  return (
    <div className={`${styles.fila} ${error ? styles.filaError : ''}`}>
      <p className={styles.texto}>{question.text}</p>
      <div className={styles.opciones} role="radiogroup" aria-label={question.text}>
        {likertScale.map((op) => (
          <button
            key={op.value}
            type="button"
            role="radio"
            aria-checked={value === op.value}
            onClick={() => onChange(question.id, op.value)}
            className={`${styles.opcion} ${value === op.value ? styles.activa : ''}`}
          >
            <span className={styles.valor}>{op.value}</span>
            <span className={styles.label}>{op.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
