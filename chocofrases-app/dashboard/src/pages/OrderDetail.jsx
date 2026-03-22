import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../hooks/useApi'

const BROWN = '#4A1C0A'
const STATUS_LABELS = {
  nuevo:'Nuevo', aprobado:'Aprobado', en_preparacion:'En preparación',
  listo:'Listo', enviado:'Enviado', entregado:'Entregado', cancelado:'Cancelado'
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data))
  }, [id])

  const updateStatus = async (status) => {
    await api.patch(`/orders/${id}/status`, { status })
    const r = await api.get(`/orders/${id}`)
    setOrder(r.data)
  }

  if (!order) return <div className="p-6 text-stone-400">Cargando...</div>

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-stone-600">←</button>
        <h1 className="text-xl font-bold" style={{ color: BROWN }}>Pedido #{order.order_number}</h1>
        <span className="text-xs text-stone-500 ml-auto">
          {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Client info */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Cliente</h2>
          <p className="font-medium text-stone-800">{order.business_name || order.client_name || 'Sin nombre'}</p>
          <p className="text-stone-500 text-sm">{order.whatsapp_phone}</p>
          {order.address && <p className="text-stone-400 text-xs mt-1">{order.address}</p>}
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700 mb-3">Estado del pedido</h2>
          <select
            value={order.status}
            onChange={e => updateStatus(e.target.value)}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none"
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <p className="text-xs text-stone-400 mt-2">Canal: {order.input_type}</p>
          {order.remito_number && (
            <p className="text-xs mt-1">
              Remito N° {order.remito_number} —{' '}
              {order.remito_url && (
                <a href={order.remito_url} target="_blank" rel="noopener noreferrer"
                   className="underline" style={{ color: BROWN }}>
                  Ver PDF
                </a>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-sm font-semibold text-stone-700">Productos</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr>
              {['Producto','Cantidad','Precio unit.','Subtotal'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {(order.items || []).filter(Boolean).map((item, i) => (
              <tr key={i}>
                <td className="px-5 py-3 text-stone-700">{item.product_name}</td>
                <td className="px-5 py-3 text-stone-500">{item.quantity}</td>
                <td className="px-5 py-3 text-stone-500">${Number(item.unit_price).toLocaleString('es-AR')}</td>
                <td className="px-5 py-3 font-medium text-stone-800">${Number(item.subtotal).toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-100">
              <td colSpan={3} className="px-5 py-3 text-right font-semibold text-stone-700">TOTAL</td>
              <td className="px-5 py-3 font-bold text-lg" style={{ color: BROWN }}>
                ${Number(order.total).toLocaleString('es-AR')}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* AI transcript */}
      {order.ai_transcript && (
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
          <h2 className="text-sm font-semibold text-amber-800 mb-2">Resumen del pedido (IA)</h2>
          <p className="text-sm text-amber-700">{order.ai_transcript}</p>
        </div>
      )}
    </div>
  )
}
