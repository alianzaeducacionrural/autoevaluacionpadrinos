import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import styles from './CategoryChart.module.css'

/**
 * Gráfico de barras con el promedio del equipo (escala 1–4) en cada categoría.
 * `data` = [{ nombre, promedio }].
 */
export default function CategoryChart({ data }) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.titulo}>Promedio del equipo por categoría</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="nombre"
            angle={-20}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 12 }}
            height={70}
          />
          <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [Number(v).toFixed(2), 'Promedio']} />
          <Bar dataKey="promedio" fill="#1e7a35" radius={[6, 6, 0, 0]}>
            <LabelList
              dataKey="promedio"
              position="top"
              formatter={(v) => Number(v).toFixed(2)}
              style={{ fontSize: 12, fill: '#1a6128', fontWeight: 700 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
