import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Minus,
  UserCircle2,
  PackageSearch,
} from 'lucide-react';
import * as ventasApi from '../api/ventas';
import * as productosApi from '../api/productos';
import * as clientesApi from '../api/clientes';
import Modal from '../components/Modal';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [clienteId, setClienteId] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);
  const [montoPagado, setMontoPagado] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ventasData, productosData, clientesData] = await Promise.all([
        ventasApi.getVentas(),
        productosApi.getProductos(),
        clientesApi.getClientes(),
      ]);
      setVentas(ventasData);
      setProductos(productosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = () => {
    setClienteId('');
    setProductoSeleccionado('');
    setCantidad(1);
    setCarrito([]);
    setMontoPagado('');
    setModalOpen(true);
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || cantidad <= 0) return;

    const producto = productos.find((p) => p.id === Number(productoSeleccionado));
    if (!producto) return;

    const yaExiste = carrito.find((item) => item.producto_id === producto.id);
    if (yaExiste) {
      setCarrito(
        carrito.map((item) =>
          item.producto_id === producto.id
            ? { ...item, cantidad: item.cantidad + Number(cantidad) }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_venta: Number(producto.precio_venta),
          cantidad: Number(cantidad),
        },
      ]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
  };

  const quitarDelCarrito = (producto_id) => {
    setCarrito(carrito.filter((item) => item.producto_id !== producto_id));
  };

  const ajustarCantidad = (producto_id, delta) => {
    setCarrito(
      carrito
        .map((item) =>
          item.producto_id === producto_id ? { ...item, cantidad: item.cantidad + delta } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const total = carrito.reduce((acc, item) => acc + item.precio_venta * item.cantidad, 0);
  const pagado = Number(montoPagado) || 0;
  const fiado = Math.max(total - pagado, 0);

  const marcarPagoCompleto = () => setMontoPagado(total.toFixed(2));
  const marcarSinPago = () => setMontoPagado('0');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId) {
      alert('Selecciona un cliente');
      return;
    }
    if (carrito.length === 0) {
      alert('Agrega al menos un producto a la venta');
      return;
    }
    if (pagado > total) {
      alert('El monto pagado no puede ser mayor al total');
      return;
    }

    try {
      setGuardando(true);

      let fecha_vencimiento = null;
      if (fiado > 0) {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() + 1);
        fecha_vencimiento = fecha.toISOString().split('T')[0];
      }

      await ventasApi.createVenta({
        cliente_id: Number(clienteId),
        productos: carrito.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
        monto_pagado: pagado,
        fecha_vencimiento,
      });

      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al crear venta:', error);
      alert(error.response?.data?.error || 'Error al registrar la venta');
    } finally {
      setGuardando(false);
    }
  };

  const totalVentas = ventas.length;
  const totalVendidoGeneral = ventas.reduce((acc, v) => acc + Number(v.total), 0);
  const totalFiadoGeneral = ventas.reduce((acc, v) => acc + Number(v.monto_fiado), 0);

  const clienteSeleccionado = clientes.find((c) => c.id === Number(clienteId));

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ventas</h1>
          <p className="text-sm text-slate-500 mt-1">Registra tus ventas del día a día</p>
        </div>
        <Button onClick={abrirModal}>
          <Plus size={18} />
          Nueva venta
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={ShoppingCart} label="Total de ventas" value={totalVentas} color="emerald" />
        <StatCard
          icon={TrendingUp}
          label="Total vendido"
          value={`$${totalVendidoGeneral.toFixed(2)}`}
          color="sky"
        />
        <StatCard
          icon={Receipt}
          label="Fiado acumulado"
          value={`$${totalFiadoGeneral.toFixed(2)}`}
          color="amber"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Cargando ventas...</div>
        ) : ventas.length === 0 ? (
          <div className="p-14 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <ShoppingCart size={26} className="text-slate-300" />
            </div>
            <p>No hay ventas registradas todavía.</p>
            <Button onClick={abrirModal} variant="secondary">
              <Plus size={16} />
              Registrar la primera
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-left text-slate-400">
                <th className="px-6 py-3.5 font-medium">Cliente</th>
                <th className="px-6 py-3.5 font-medium">Fecha</th>
                <th className="px-6 py-3.5 font-medium">Total</th>
                <th className="px-6 py-3.5 font-medium">Pagado</th>
                <th className="px-6 py-3.5 font-medium">Fiado</th>
                <th className="px-6 py-3.5 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-semibold text-xs shrink-0">
                        {v.cliente_nombre.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{v.cliente_nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {new Date(v.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">
                    ${Number(v.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">${Number(v.monto_pagado).toFixed(2)}</td>
                  <td className="px-6 py-3.5 text-slate-500">${Number(v.monto_fiado).toFixed(2)}</td>
                  <td className="px-6 py-3.5">
                    {Number(v.monto_fiado) > 0 ? (
                      <Badge color="amber">Con fiado</Badge>
                    ) : (
                      <Badge color="emerald">Pagada</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de nueva venta */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva venta"
        footer={
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <span className="text-slate-400">Total </span>
              <span className="font-bold text-slate-800">${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" form="form-venta" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Registrar venta'}
              </Button>
            </div>
          </div>
        }
      >
        <form id="form-venta" onSubmit={handleSubmit} className="space-y-5">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
            <div className="relative">
              <UserCircle2
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                required
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            {clienteSeleccionado?.deuda_total > 0 && (
              <p className="text-xs text-amber-600 mt-1.5">
                Este cliente ya debe ${clienteSeleccionado.deuda_total.toFixed(2)}
              </p>
            )}
          </div>

          {/* Agregar producto */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
              <PackageSearch size={15} className="text-slate-400" />
              Agregar productos
            </label>
            <div className="flex gap-2">
              <select
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              >
                <option value="">Selecciona un producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stock === 0}>
                    {p.nombre} — ${Number(p.precio_venta).toFixed(2)} ({p.stock} disp.)
                  </option>
                ))}
              </select>

              <div className="flex items-center border border-slate-200 rounded-xl bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Math.max(1, Number(c) - 1))}
                  className="px-2 py-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-8 text-center text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCantidad((c) => Number(c) + 1)}
                  className="px-2 py-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <Button type="button" onClick={agregarAlCarrito} className="!px-3.5 shrink-0">
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Lista del carrito — con su propio scroll si crece mucho */}
          {carrito.length > 0 && (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {carrito.map((item) => (
                <div
                  key={item.producto_id}
                  className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 text-sm"
                >
                  <span className="text-slate-700 truncate">{item.nombre}</span>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => ajustarCantidad(item.producto_id, -1)}
                        className="w-5 h-5 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center font-medium text-slate-700">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => ajustarCantidad(item.producto_id, 1)}
                        className="w-5 h-5 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-slate-500 w-14 text-right">
                      ${(item.precio_venta * item.cantidad).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => quitarDelCarrito(item.producto_id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pago — versión minimalista */}
          <div className="pt-1 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Monto pagado</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={marcarSinPago}
                  className="text-xs px-2.5 py-1 rounded-full text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Sin pago
                </button>
                <button
                  type="button"
                  onClick={marcarPagoCompleto}
                  className="text-xs px-2.5 py-1 rounded-full text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  Pago completo
                </button>
              </div>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              max={total}
              placeholder="0.00"
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />

            {fiado > 0 && (
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-amber-600">Queda fiado</span>
                <span className="font-semibold text-amber-600">${fiado.toFixed(2)}</span>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default VentasPage;