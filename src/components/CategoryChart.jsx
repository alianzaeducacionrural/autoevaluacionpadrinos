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

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif"
const BAR_COLOR = '#6366f1'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipVal}>{Number(payload[0].value).toFixed(2)}</p>
    </div>
  )
}

export default function CategoryChart({ data }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.cabecera}>
        <h2 className={styles.titulo}>Promedio del equipo</h2>
        <span className={styles.sub}>Escala 1 – 4</span>
      </div>
      {/* Barras horizontales: las etiquetas largas caben en el eje Y */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 56, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="rgba(15,23,42,0.06)"
          />
          <XAxis
            type="number"
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: FONT }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            width={210}
            tick={{ fontSize: 12, fill: '#475569', fontFamily: FONT, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(99,102,241,0.06)' }}
          />
          <Bar dataKey="promedio" fill={BAR_COLOR} radius={[0, 6, 6, 0]} maxBarSize={36}>
            <LabelList
              dataKey="promedio"
              position="right"
              formatter={(v) => Number(v).toFixed(1)}
              style={{ fontSize: 12, fill: '#475569', fontWeight: 700, fontFamily: FONT }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
