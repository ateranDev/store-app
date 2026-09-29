import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, UserCheck, Wallet, Phone, Search } from 'lucide-react';
import * as clientesApi from '../api/clientes';
import Modal from '../components/Modal';
import Button from '../components/Button';
import StatCard from '../components/StatCard';

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesApi.getClientes();

      // Por cada cliente, pedimos su deuda total en paralelo
      const clientesConDeuda = await Promise.all(
        data.map(async (cliente) => {
          const { deuda_total } = await clientesApi.getDeudaTotalCliente(cliente.id);
          return { ...cliente, deuda_total };
        })
      );

      setClientes(clientesConDeuda);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', telefono: '', direccion: '' });
    setModalOpen(true);
  };

  const abrirEditar = (cliente) => {
    setEditando(cliente);
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await clientesApi.updateCliente(editando.id, form);
      } else {
        await clientesApi.createCliente(form);
      }

      setModalOpen(false);
      cargarClientes();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert(error.response?.data?.error || 'Error al guardar el cliente');
    }
  };

  const handleEliminar = async (cliente) => {
    if (!confirm(`¿Eliminar a "${cliente.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await clientesApi.deleteCliente(cliente.id);
      cargarClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      alert(error.response?.data?.error || 'Error al eliminar el cliente');
    }
  };

  // --- Datos derivados para las tarjetas de estadísticas (siempre sobre TODOS los clientes) ---
  const totalClientes = clientes.length;
  const clientesConDeudaCount = clientes.filter((c) => c.deuda_total > 0).length;
  const deudaTotalGeneral = clientes.reduce((acc, c) => acc + c.deuda_total, 0);

  // --- Filtrado por búsqueda (nombre, teléfono o dirección) ---
  const clientesFiltrados = clientes.filter((c) => {
    const texto = busqueda.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(texto) ||
      (c.telefono || '').toLowerCase().includes(texto) ||
      (c.direccion || '').toLowerCase().includes(texto)
    );
  });

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Administra tu cartera de clientes</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus size={18} />
          Nuevo cliente
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Users} label="Total clientes" value={totalClientes} color="emerald" />
        <StatCard icon={UserCheck} label="Con deuda activa" value={clientesConDeudaCount} color="amber" />
        <StatCard
          icon={Wallet}
          label="Deuda total por cobrar"
          value={`$${deudaTotalGeneral.toFixed(2)}`}
          color="red"
        />
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o dirección..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Cargando clientes...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="p-14 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Users size={26} className="text-slate-300" />
            </div>
            {busqueda ? (
              <p>No se encontraron clientes que coincidan con "{busqueda}".</p>
            ) : (
              <>
                <p>No hay clientes registrados todavía.</p>
                <Button onClick={abrirCrear} variant="secondary">
                  <Plus size={16} />
                  Crear el primero
                </Button>
              </>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-left text-slate-400">
                <th className="px-6 py-3.5 font-medium">Cliente</th>
                <th className="px-6 py-3.5 font-medium">Teléfono</th>
                <th className="px-6 py-3.5 font-medium">Dirección</th>
                <th className="px-6 py-3.5 font-medium">Deuda actual</th>
                <th className="px-6 py-3.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-semibold text-xs shrink-0">
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-medium text-slate-800">{c.nombre}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {c.telefono ? (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-300" />
                        {c.telefono}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {c.direccion || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-3.5">
                    {c.deuda_total > 0 ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                        ${c.deuda_total.toFixed(2)}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                        Al día
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" onClick={() => abrirEditar(c)} className="!px-2.5 !py-1.5">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="danger" onClick={() => handleEliminar(c)} className="!px-2.5 !py-1.5">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar cliente' : 'Nuevo cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editando ? 'Guardar cambios' : 'Crear cliente'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClientesPage;