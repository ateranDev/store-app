import { NavLink } from 'react-router-dom';
import { Package, Users, ShoppingCart, Wallet, BarChart3, Store } from 'lucide-react';

const links = [
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/ventas', label: 'Ventas', icon: ShoppingCart },
  { to: '/fiados', label: 'Fiados', icon: Wallet },
  { to: '/reportes', label: 'Reportes', icon: BarChart3 },
];

function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-200 flex flex-col fixed left-0 top-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <Store className="text-emerald-400" size={26} />
        <span className="text-lg font-semibold text-white">Store</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
        Sistema de inventario v1.0
      </div>
    </aside>
  );
}

export default Sidebar;