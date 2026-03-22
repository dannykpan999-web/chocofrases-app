import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ShoppingBag, Users, Package,
  Megaphone, UserCog, LogOut, ChocolateBar
} from 'lucide-react'

const nav = [
  { to: '/',          label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { to: '/orders',    label: 'Pedidos',     icon: ShoppingBag },
  { to: '/clients',   label: 'Clientes',    icon: Users },
  { to: '/products',  label: 'Productos',   icon: Package },
  { to: '/broadcast', label: 'Broadcast',   icon: Megaphone, role: 'dueno' },
  { to: '/users',     label: 'Usuarios',    icon: UserCog,   role: 'dueno' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col" style={{ background: '#4A1C0A' }}>
        <div className="p-5 border-b border-amber-900">
          <h1 className="text-white font-bold text-lg leading-tight">🍫 Chocofrases</h1>
          <p className="text-amber-300 text-xs mt-0.5">Panel de Control</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {nav.filter(n => !n.role || n.role === user?.role).map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-900 text-amber-300 font-semibold'
                    : 'text-amber-100 hover:bg-amber-900/50'
                }`
              }
            >
              <n.icon size={17} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-amber-900">
          <p className="text-amber-200 text-xs font-medium truncate">{user?.name}</p>
          <p className="text-amber-400 text-xs capitalize">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-amber-300 hover:text-white text-xs transition-colors"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-stone-50">
        <Outlet />
      </main>
    </div>
  )
}
