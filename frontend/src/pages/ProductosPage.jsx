import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package, Boxes, AlertTriangle, DollarSign } from 'lucide-react';
import * as productosApi from '../api/productos';
import Modal from '../components/Modal';
import Button from '../components/Button';
import StatCard from '../components/StatCard';

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio_costo: '',
    precio_venta: '',
    stock: '',
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productosApi.getProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', descripcion: '', precio_costo: '', precio_venta: '', stock: '' });
    setModalOpen(true);
  };

  const abrirEditar = (producto) => {
    setEditando(producto);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_costo: producto.precio_costo,
      precio_venta: producto.precio_venta,
      stock: producto.stock,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        precio_costo: Number(form.precio_costo),
        precio_venta: Number(form.precio_venta),
        stock: Number(form.stock),
      };

      if (editando) {
        await productosApi.updateProducto(editando.id, payload);
      } else {
        await productosApi.createProducto(payload);
      }

      setModalOpen(false);
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert(error.response?.data?.error || 'Error al guardar el producto');
    }
  };

  const handleEliminar = async (producto) => {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
      await productosApi.deleteProducto(producto.id);
      cargarProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert(error.response?.data?.error || 'Error al eliminar el producto');
    }
  };

  // --- Datos derivados para las tarjetas de estadísticas ---
  const totalProductos = productos.length;
  const stockBajo = productos.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const sinStock = productos.filter((p) => p.stock === 0).length;
  const valorInventario = productos.reduce(
    (acc, p) => acc + Number(p.precio_venta) * p.stock,
    0
  );

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona tu inventario</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus size={18} />
          Nuevo producto
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Boxes} label="Total productos" value={totalProductos} color="emerald" />
        <StatCard icon={AlertTriangle} label="Stock bajo" value={stockBajo} color="amber" />
        <StatCard icon={Package} label="Sin stock" value={sinStock} color="red" />
        <StatCard
          icon={DollarSign}
          label="Valor en inventario"
          value={`$${valorInventario.toFixed(2)}`}
          color="sky"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Cargando productos...</div>
        ) : productos.length === 0 ? (
          <div className="p-14 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Package size={26} className="text-slate-300" />
            </div>
            <p>No hay productos registrados todavía.</p>
            <Button onClick={abrirCrear} variant="secondary">
              <Plus size={16} />
              Crear el primero
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-left text-slate-400">
                <th className="px-6 py-3.5 font-medium">Producto</th>
                <th className="px-6 py-3.5 font-medium">Precio costo</th>
                <th className="px-6 py-3.5 font-medium">Precio venta</th>
                <th className="px-6 py-3.5 font-medium">Stock</th>
                <th className="px-6 py-3.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-xs shrink-0">
                        {p.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{p.nombre}</div>
                        {p.descripcion && (
                          <div className="text-xs text-slate-400">{p.descripcion}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    ${Number(p.precio_costo).toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-slate-700">
                    ${Number(p.precio_venta).toFixed(2)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.stock > 10
                          ? 'bg-emerald-50 text-emerald-600'
                          : p.stock > 0
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {p.stock} unidades
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" onClick={() => abrirEditar(p)} className="!px-2.5 !py-1.5">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="danger" onClick={() => handleEliminar(p)} className="!px-2.5 !py-1.5">
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
        title={editando ? 'Editar producto' : 'Nuevo producto'}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio costo</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.precio_costo}
                onChange={(e) => setForm({ ...form, precio_costo: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio venta</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.precio_venta}
                onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
            <input
              type="number"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{editando ? 'Guardar cambios' : 'Crear producto'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ProductosPage;