import { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CalendarClock, DollarSign, History, CheckCircle2 } from 'lucide-react';
import * as deudasApi from '../api/deudas';
import Modal from '../components/Modal';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

function FiadosPage() {
  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Modal de abono ---
  const [modalOpen, setModalOpen] = useState(false);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [abonos, setAbonos] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDeudas();
  }, []);

  const cargarDeudas = async () => {
    try {
      setLoading(true);
      const data = await deudasApi.getDeudasPendientes();
      setDeudas(data);
    } catch (error) {
      console.error('Error al cargar deudas:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirAbono = async (deuda) => {
    setDeudaSeleccionada(deuda);
    setMontoAbono('');
    setModalOpen(true);

    try {
      const historial = await deudasApi.getAbonosPorDeuda(deuda.id);
      setAbonos(historial);
    } catch (error) {
      console.error('Error al cargar abonos:', error);
      setAbonos([]);
    }
  };

  const handleAbonar = async (e) => {
    e.preventDefault();

    const monto = Number(montoAbono);
    if (!monto || monto <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    if (monto > deudaSeleccionada.monto_pendiente) {
      alert('El abono no puede ser mayor al saldo pendiente');
      return;
    }

    try {
      setGuardando(true);
      await deudasApi.crearAbono(deudaSeleccionada.id, monto);
      setModalOpen(false);
      cargarDeudas();
    } catch (error) {
      console.error('Error al registrar abono:', error);
      alert(error.response?.data?.error || 'Error al registrar el abono');
    } finally {
      setGuardando(false);
    }
  };

  const marcarAbonoTotal = () => setMontoAbono(deudaSeleccionada.monto_pendiente);

  // --- Datos derivados ---
  const totalPendiente = deudas.reduce((acc, d) => acc + Number(d.monto_pendiente), 0);
  const clientesConDeuda = new Set(deudas.map((d) => d.cliente_id)).size;

  const hoy = new Date();
  const vencidas = deudas.filter(
    (d) => d.fecha_vencimiento && new Date(d.fecha_vencimiento) < hoy
  ).length;

  const estaVencida = (fecha_vencimiento) =>
    fecha_vencimiento && new Date(fecha_vencimiento) < hoy;

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Fiados</h1>
        <p className="text-sm text-slate-500 mt-1">Controla las deudas pendientes de tus clientes</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Wallet}
          label="Total por cobrar"
          value={`$${totalPendiente.toFixed(2)}`}
          color="red"
        />
        <StatCard icon={DollarSign} label="Clientes con deuda" value={clientesConDeuda} color="amber" />
        <StatCard icon={AlertCircle} label="Deudas vencidas" value={vencidas} color="sky" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Cargando deudas...</div>
        ) : deudas.length === 0 ? (
          <div className="p-14 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <CheckCircle2 size={26} className="text-emerald-300" />
            </div>
            <p>No hay deudas pendientes. ¡Todo al día! 🎉</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-left text-slate-400">
                <th className="px-6 py-3.5 font-medium">Cliente</th>
                <th className="px-6 py-3.5 font-medium">Fecha venta</th>
                <th className="px-6 py-3.5 font-medium">Vencimiento</th>
                <th className="px-6 py-3.5 font-medium">Monto original</th>
                <th className="px-6 py-3.5 font-medium">Pendiente</th>
                <th className="px-6 py-3.5 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {deudas.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-semibold text-xs shrink-0">
                        {d.cliente_nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{d.cliente_nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {new Date(d.fecha_venta).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-3.5">
                    {d.fecha_vencimiento ? (
                      <span
                        className={`flex items-center gap-1.5 ${
                          estaVencida(d.fecha_vencimiento) ? 'text-red-500' : 'text-slate-500'
                        }`}
                      >
                        <CalendarClock size={13} />
                        {new Date(d.fecha_vencimiento).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {estaVencida(d.fecha_vencimiento) && (
                          <Badge color="red">Vencida</Badge>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    ${Number(d.monto_original).toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                      ${Number(d.monto_pendiente).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Button variant="secondary" onClick={() => abrirAbono(d)}>
                      Registrar abono
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de abono */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Abonar — ${deudaSeleccionada?.cliente_nombre || ''}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-abono" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Registrar abono'}
            </Button>
          </div>
        }
      >
        {deudaSeleccionada && (
          <div className="space-y-5">
            {/* Resumen de la deuda */}
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
              <span className="text-sm text-slate-500">Saldo pendiente</span>
              <span className="text-lg font-bold text-slate-800">
                ${Number(deudaSeleccionada.monto_pendiente).toFixed(2)}
              </span>
            </div>

            <form id="form-abono" onSubmit={handleAbonar} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Monto a abonar</label>
                <button
                  type="button"
                  onClick={marcarAbonoTotal}
                  className="text-xs px-2.5 py-1 rounded-full text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  Saldar completo
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max={deudaSeleccionada.monto_pendiente}
                placeholder="0.00"
                value={montoAbono}
                onChange={(e) => setMontoAbono(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </form>

            {/* Historial de abonos */}
            {abonos.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                  <History size={13} />
                  Historial de abonos
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {abonos.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <span className="text-slate-500">
                        {new Date(a.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="font-medium text-emerald-600">
                        +${Number(a.monto).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default FiadosPage;