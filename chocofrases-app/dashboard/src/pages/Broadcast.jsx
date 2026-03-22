import { useState } from 'react'
import api from '../hooks/useApi'
import { Megaphone, CheckCircle } from 'lucide-react'

const BROWN = '#4A1C0A'

export default function Broadcast() {
  const [title, setTitle]     = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const send = async (e) => {
    e.preventDefault()
    if (!confirm(`¿Enviar este mensaje a todos los clientes activos?`)) return
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await api.post('/orders/broadcast', { title, message })
      setResult(r.data)
      setTitle(''); setMessage('')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone size={22} style={{ color: BROWN }} />
        <h1 className="text-xl font-bold" style={{ color: BROWN }}>Broadcast de Promociones</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Importante:</strong> Este mensaje se enviará a todos los clientes que hayan realizado al menos un pedido.
        Usá este canal con moderación para no molestar a los clientes.
      </div>

      <form onSubmit={send} className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Título interno (no se envía)</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Promo de Pascuas"
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Mensaje para los clientes *</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            required rows={6}
            placeholder="Ej: 🍫 ¡Hola! Esta semana tenemos promoción en Cajas Especiales. Aprovechá antes de que se agoten. Escribinos para hacer tu pedido."
            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
          />
          <p className="text-xs text-stone-400 mt-1">{message.length} caracteres</p>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        {result && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle size={18} className="text-green-600" />
            <div>
              <p className="text-green-800 font-medium text-sm">¡Broadcast enviado!</p>
              <p className="text-green-600 text-xs">Enviado: {result.sent} — Fallidos: {result.failed}</p>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || !message}
          className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-50"
          style={{ background: BROWN }}>
          {loading ? 'Enviando...' : 'Enviar a todos los clientes'}
        </button>
      </form>
    </div>
  )
}
