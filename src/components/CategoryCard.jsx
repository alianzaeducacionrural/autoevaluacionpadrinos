import styles from './CategoryCard.module.css'

/**
 * Card contenedora de una sección del formulario (una categoría Likert o un
 * grupo de preguntas abiertas). El contenido se pasa como children.
 */
export default function CategoryCard({ index, title, children }) {
  return (
    <section className={styles.card}>
      <header className={styles.cabecera}>
        {index != null && <span className={styles.indice}>{index}</span>}
        <h2 className={styles.titulo}>{title}</h2>
      </header>
      <div className={styles.cuerpo}>{children}</div>
    </section>
  )
}
