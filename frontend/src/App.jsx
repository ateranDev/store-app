import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProductosPage from './pages/ProductosPage';
import ClientesPage from './pages/ClientesPage';
import VentasPage from './pages/VentasPage';
import FiadosPage from './pages/FiadosPage';
import ReportesPage from './pages/ReportesPage';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/ventas" element={<VentasPage />} />
          <Route path="/fiados" element={<FiadosPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;