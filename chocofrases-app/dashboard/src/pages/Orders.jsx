import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../hooks/useApi'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
const BROWN = '#4A1C0A'

const STATUSES = ['', 'nuevo','aprobado','en_preparacion','listo','enviado','entregado','cancelado']
const STATUS_LABELS = {
  '': 'Todos', nuevo:'Nuevo', aprobado:'Aprobado', en_preparacion:'En prep.',
  listo:'Listo', enviado:'Enviado', entregado:'Entregado', cancelado:'Cancelado'
}
const STATUS_COLORS = {
  nuevo:'bg-blue-100 text-blue-700', aprobado:'bg-yellow-100 text-yellow-700',
  en_preparacion:'bg-orange-100 text-orange-700', listo:'bg-purple-100 text-purple-700',
  enviado:'bg-indigo-100 text-indigo-700', entregado:'bg-green-100 text-green-700',
  cancelado:'bg-red-100 text-red-700'
}

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [status, setStatus]   = useState('')
  const [search, setSearch]   = useState('')
  const navigate = useNavigate()

  const load = async () => {
    const params = new URLSearchParams({ limit: 100 })
    if (status) params.set('status', status)
    if (search) params.set('search', search)
    const r = await api.get(`/orders?${params}`)
    setOrders(r.data)
  }

  useEffect(() => { load() }, [status, search])

  useEffect(() => {
    const socket = io(SOCKET_URL)
    socket.on('new_order', load)
    socket.on('order_updated', load)
    return () => socket.disconnect()
  }, [])

  const updateStatus = async (id, newStatus) => {
    await api.patch(`/orders/${id}/status`, { status: newStatus })
    load()
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-bold" style={{ color: BROWN }}>Pedidos</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Buscar cliente o teléfono..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-stone-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-amber-500"
        />
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                status === s ? 'text-white border-transparent' : 'bg-white text-stone-600 border-stone-200'
              }`}
              style={status === s ? { background: BROWN } : {}}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban-style status counts */}
      <div className="grid grid-cols-4 xl:grid-cols-7 gap-2">
        {STATUSES.filter(s => s).map(s => {
          const count = orders.filter(o => o.status === s).length
          return (
            <div key={s} className="bg-white rounded-lg p-3 text-center shadow-sm border border-stone-100 cursor-pointer"
              onClick={() => setStatus(s)}>
              <div className="text-xl font-bold" style={{ color: BROWN }}>{count}</div>
              <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${STATUS_COLORS[s]}`}>
                {STATUS_LABELS[s]}
              </div>
            </div>
          )
        })}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr>
              {['#','Cliente','Productos','Total','Canal','Estado','Fecha','Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3 font-semibold cursor-pointer" style={{ color: BROWN }}
                    onClick={() => navigate(`/orders/${o.id}`)}>
                  #{o.order_number}
                </td>
                <td className="px-4 py-3 text-stone-700 max-w-xs">
                  <div className="font-medium">{o.business_name || o.client_name || o.whatsapp_phone}</div>
                  <div className="text-stone-400 text-xs">{o.whatsapp_phone}</div>
                </td>
                <td className="px-4 py-3 text-stone-500 text-xs max-w-xs truncate">
                  {o.items?.filter(Boolean).map(i => `${i.product_name} x${i.quantity}`).join(', ')}
                </td>
                <td className="px-4 py-3 font-semibold text-stone-800">
                  ${Number(o.total).toLocaleString('es-AR')}
                </td>
                <td className="px-4 py-3 text-stone-500 capitalize">{o.input_type}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    className={`text-xs rounded-full px-2 py-1 border-0 font-medium cursor-pointer ${STATUS_COLORS[o.status]}`}
                  >
                    {STATUSES.filter(s => s).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-stone-400 text-xs">
                  {format(new Date(o.created_at), 'dd/MM HH:mm')}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate(`/orders/${o.id}`)}
                    className="text-xs underline" style={{ color: BROWN }}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-stone-400 text-sm">No hay pedidos</div>
        )}
      </div>
    </div>
  )
}
