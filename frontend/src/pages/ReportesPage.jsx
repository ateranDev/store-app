import { useState, useEffect } from 'react';
import { Calendar, ArrowUpRight, ShoppingBag, Download } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import * as reportesApi from '../api/reportes';

const formatoInput = (fecha) => fecha.toISOString().split('T')[0];
const hoy = new Date();
const hace30Dias = new Date();
hace30Dias.setDate(hoy.getDate() - 30);

function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState(formatoInput(hace30Dias));
  const [fechaFin, setFechaFin] = useState(formatoInput(hoy));
  const [rangoActivo, setRangoActivo] = useState(30);

  const [resumen, setResumen] = useState({ cantidad_ventas: 0, total_vendido: 0, ganancia_total: 0 });
  const [ventasDetalle, setVentasDetalle] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReporte();
  }, [fechaInicio, fechaFin]);

  const cargarReporte = async () => {
    try {
      setLoading(true);
      const [resumenData, gananciasData] = await Promise.all([
        reportesApi.getResumen(fechaInicio, fechaFin),
        reportesApi.getGananciasPorVenta(fechaInicio, fechaFin),
      ]);
      setResumen(resumenData);
      setVentasDetalle(gananciasData);
    } catch (error) {
      console.error('Error al cargar el reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const datosGrafico = ventasDetalle
    .reduce((acc, venta) => {
      const dia = new Date(venta.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      const existente = acc.find((item) => item.dia === dia);
      if (existente) {
        existente.ganancia += Number(venta.ganancia);
      } else {
        acc.push({ dia, ganancia: Number(venta.ganancia) });
      }
      return acc;
    }, [])
    .reverse();

  const aplicarRango = (dias) => {
    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(fin.getDate() - dias);
    setFechaInicio(formatoInput(inicio));
    setFechaFin(formatoInput(fin));
    setRangoActivo(dias);
  };

  const handleExportar = async () => {
    try {
      const blob = await reportesApi.exportarExcel(fechaInicio, fechaFin);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${fechaInicio}_a_${fechaFin}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('No hay compras registradas en ese período, o hubo un error al generar el archivo');
    }
  };

  // Últimas ventas primero
  const ventasOrdenadas = [...ventasDetalle].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  return (
    <div>
      {/* Encabezado + filtro en la misma línea */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reportes</h1>
          <p className="text-sm text-slate-500 mt-1">Analiza tus ventas y ganancias</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 rounded-xl p-1">
            {[7, 30, 90].map((dias) => (
              <button
                key={dias}
                onClick={() => aplicarRango(dias)}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  rangoActivo === dias
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {dias}d
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-500">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                setRangoActivo(null);
              }}
              className="focus:outline-none w-[110px]"
            />
            <span className="text-slate-300">–</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value);
                setRangoActivo(null);
              }}
              className="focus:outline-none w-[110px]"
            />
          </div>

          <button
            onClick={handleExportar}
            className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors"
          >
            <Download size={15} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tarjeta principal: ganancia + gráfico integrado */}
      <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/60 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-slate-400 mb-1">Ganancia total</p>
            <p className="text-3xl font-bold text-slate-800">
              ${Number(resumen.ganancia_total).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Total vendido</p>
            <p className="text-3xl font-bold text-slate-800">
              ${Number(resumen.total_vendido).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-1">Ventas realizadas</p>
            <p className="text-3xl font-bold text-slate-800">{resumen.cantidad_ventas}</p>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            Cargando...
          </div>
        ) : datosGrafico.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
            No hay datos en este período.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={datosGrafico}>
              <defs>
                <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="dia"
                tick={{ fontSize: 11, fill: '#cbd5e1' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Ganancia']}
                contentStyle={{
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 13,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="ganancia"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#colorGanancia)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detalle por venta — con scroll interno, contenida en la pantalla */}
      <div className="bg-white rounded-3xl shadow-sm shadow-slate-200/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Detalle por venta</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {ventasOrdenadas.length} {ventasOrdenadas.length === 1 ? 'venta' : 'ventas'} en el período
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 py-6 text-center">Cargando...</p>
        ) : ventasOrdenadas.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No hay ventas en este período.</p>
        ) : (
          <div className="max-h-[360px] overflow-y-auto pr-1 divide-y divide-slate-50">
            {ventasOrdenadas.map((v) => (
              <div key={v.venta_id} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShoppingBag size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{v.cliente_nombre}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(v.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    ${Number(v.total).toFixed(2)}
                  </p>
                  <p className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 justify-end">
                    <ArrowUpRight size={12} />
                    ${Number(v.ganancia).toFixed(2)} ganancia
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportesPage;