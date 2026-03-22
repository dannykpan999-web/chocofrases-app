import { useState, useEffect } from 'react'
import api from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'

const BROWN = '#4A1C0A'
const AMBER = '#C88C50'

const emptyForm = { sku:'', name:'', description:'', price:'', stock:'', unit:'unidad', category:'', image_url:'', active:true }

export default function Products() {
  const [products, setProducts] = useState([])
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [editing, setEditing]   = useState(null)
  const { user } = useAuth()

  const load = async () => {
    const r = await api.get('/products')
    setProducts(r.data)
  }

  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    if (editing) {
      await api.put(`/products/${editing}`, form)
    } else {
      await api.post('/products', form)
    }
    setModal(false); setForm(emptyForm); setEditing(null)
    load()
  }

  const openEdit = (p) => {
    setForm({ sku: p.sku||'', name: p.name, description: p.description||'',
              price: p.price, stock: p.stock, unit: p.unit, category: p.category||'',
              image_url: p.image_url||'', active: p.active })
    setEditing(p.id); setModal(true)
  }

  const deactivate = async (id) => {
    if (!confirm('¿Desactivar producto?')) return
    await api.delete(`/products/${id}`)
    load()
  }

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: BROWN }}>Catálogo de Productos</h1>
        {user?.role === 'dueno' && (
          <button onClick={() => { setForm(emptyForm); setEditing(null); setModal(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: BROWN }}>
            <Plus size={15} /> Nuevo producto
          </button>
        )}
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h2 className="text-sm font-semibold text-stone-600 mb-3">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.filter(p => p.category === cat).map(p => (
              <div key={p.id} className={`bg-white rounded-xl p-4 shadow-sm border ${p.active ? 'border-stone-100' : 'border-red-100 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-stone-800 text-sm">{p.name}</p>
                      {p.stock <= 5 && p.active && (
                        <AlertTriangle size={13} className="text-amber-500" title="Stock bajo" />
                      )}
                    </div>
                    {p.sku && <p className="text-stone-400 text-xs">{p.sku}</p>}
                    <p className="text-lg font-bold mt-1" style={{ color: BROWN }}>
                      ${Number(p.price).toLocaleString('es-AR')}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.stock > 10 ? 'bg-green-100 text-green-700' :
                        p.stock > 0  ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        Stock: {p.stock} {p.unit}
                      </span>
                    </div>
                  </div>
                  {user?.role === 'dueno' && (
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                        <Edit2 size={13} className="text-stone-500" />
                      </button>
                      <button onClick={() => deactivate(p.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-lg mb-5" style={{ color: BROWN }}>
              {editing ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <form onSubmit={save} className="space-y-3">
              {[
                { name:'name', label:'Nombre', required:true },
                { name:'sku', label:'SKU (opcional)' },
                { name:'price', label:'Precio ($)', type:'number', required:true },
                { name:'stock', label:'Stock', type:'number' },
                { name:'unit', label:'Unidad (ej: caja, unidad, kg)' },
                { name:'category', label:'Categoría' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-stone-600 mb-1">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={form[f.name]} onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    required={f.required}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium"
                  style={{ background: BROWN }}>
                  Guardar
                </button>
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 text-stone-600 text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
