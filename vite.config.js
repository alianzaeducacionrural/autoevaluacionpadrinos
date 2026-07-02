import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` coincide con el nombre del repositorio en GitHub Pages:
// https://alianzaeducacionrural.github.io/autoevaluacionpadrinos/
export default defineConfig({
  plugins: [react()],
  base: '/autoevaluacionpadrinos/',
})
