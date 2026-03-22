import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../hooks/useApi'

const BROWN = '#4A1C0A'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch]   = useState('')
  const navigate = useNavigate()

  const load = async () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    const r = await api.get(`/clients${params}`)
    setClients(r.data)
  }

  useEffect(() => { load() }, [search])

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: BROWN }}>Clientes</h1>
        <span className="text-sm text-stone-500">{clients.length} clientes registrados</span>
      </div>

      <input
        placeholder="Buscar por nombre, negocio o teléfono..."
        value={search} onChange={e => setSearch(e.target.value)}
        className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm w-full max-w-md focus:outline-none focus:border-amber-400"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map(c => (
          <div key={c.id}
            className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/clients/${c.id}`)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-stone-800">{c.business_name || c.name || 'Sin nombre'}</p>
                {c.business_name && c.name && (
                  <p className="text-stone-500 text-xs">{c.name}</p>
                )}
                <p className="text-stone-400 text-sm mt-0.5">{c.whatsapp_phone}</p>
                {c.zone && <p className="text-xs text-amber-600 mt-1">📍 {c.zone}</p>}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: BROWN }}>{c.total_orders}</p>
                <p className="text-xs text-stone-400">pedidos</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-stone-50">
              <p className="text-sm font-semibold text-stone-700">
                Total: ${Number(c.total_spent).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-16 text-stone-400">No hay clientes aún</div>
      )}
    </div>
  )
}
