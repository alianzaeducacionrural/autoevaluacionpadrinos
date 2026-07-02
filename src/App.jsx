import { HashRouter, Routes, Route } from 'react-router-dom'
import Formulario from './pages/Formulario'
import Admin from './pages/Admin'

// HashRouter (no BrowserRouter) para que las rutas funcionen en GitHub Pages
// sin configuración de servidor. Ver sección 3 del plan.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Formulario />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  )
}
