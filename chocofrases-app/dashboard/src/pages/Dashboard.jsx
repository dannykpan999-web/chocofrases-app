import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '../hooks/useApi'
import { ShoppingBag, Users, TrendingUp, Package } from 'lucide-react'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
const BROWN = '#4A1C0A'
const AMBER = '#C88C50'

const STATUS_LABELS = {
  nuevo: 'Nuevo', aprobado: 'Aprobado', en_preparacion: 'En preparación',
  listo: 'Listo', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado'
}
const STATUS_COLORS = {
  nuevo: 'bg-blue-100 text-blue-800', aprobado: 'bg-yellow-100 text-yellow-800',
  en_preparacion: 'bg-orange-100 text-orange-800', listo: 'bg-purple-100 text-purple-800',
  enviado: 'bg-indigo-100 text-indigo-800', entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800'
}

export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [recentOrders, setRecent] = useState([])
  const [period, setPeriod]     = useState('today')

  const loadStats = async () => {
    const [s, o] = await Promise.all([
      api.get(`/orders/stats?period=${period}`),
      api.get('/orders?limit=10'),
    ])
    setStats(s.data)
    setRecent(o.data)
  }

  useEffect(() => { loadStats() }, [period])

  // Real-time updates via Socket.io
  useEffect(() => {
    const socket = io(SOCKET_URL)
    socket.on('new_order', () => loadStats())
    socket.on('order_updated', () => loadStats())
    return () => socket.disconnect()
  }, [])

  const formatARS = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`

  const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-stone-500 text-sm">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: BROWN }}>{value}</p>
          {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-lg" style={{ background: '#FFF8F0' }}>
          <Icon size={20} style={{ color: AMBER }} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: BROWN }}>Dashboard</h1>
        <div className="flex gap-2">
          {['today','week','month'].map(p => (
            <button key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p ? 'text-white' : 'bg-white text-stone-600 border border-stone-200'
              }`}
              style={period === p ? { background: BROWN } : {}}
            >
              {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag} label="Pedidos" value={stats.totals?.total || 0} />
          <StatCard icon={TrendingUp}  label="Ventas"  value={formatARS(stats.totals?.revenue)} />
          <StatCard icon={Package}     label="Entregados"
            value={stats.byStatus?.find(s => s.status === 'entregado')?.count || 0} />
          <StatCard icon={Users}       label="En curso"
            value={stats.byStatus?.filter(s => ['aprobado','en_preparacion','listo'].includes(s.status))
              .reduce((a, s) => a + parseInt(s.count), 0) || 0} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales chart */}
        {stats?.dailySales?.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">Ventas diarias (30 días)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={d => format(new Date(d), 'd/M')} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatARS(v)} labelFormatter={d => format(new Date(d), 'dd/MM', { locale: es })} />
                <Line type="monotone" dataKey="revenue" stroke={BROWN} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top products */}
        {stats?.topProducts?.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
            <h2 className="text-sm font-semibold text-stone-700 mb-4">Productos más vendidos</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.topProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="product_name" type="category" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="total_qty" fill={AMBER} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-700">Pedidos recientes</h2>
          <a href="/orders" className="text-xs font-medium" style={{ color: BROWN }}>Ver todos →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-xs">
              <tr>
                {['#', 'Cliente', 'Total', 'Estado', 'Canal', 'Fecha'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium" style={{ color: BROWN }}>#{o.order_number}</td>
                  <td className="px-4 py-3 text-stone-700">{o.business_name || o.client_name || o.whatsapp_phone}</td>
                  <td className="px-4 py-3 font-semibold text-stone-800">${Number(o.total).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500 capitalize">{o.input_type}</td>
                  <td className="px-4 py-3 text-stone-400 text-xs">
                    {format(new Date(o.created_at), 'dd/MM HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
