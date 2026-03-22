import { useState, useEffect } from 'react'
import api from '../hooks/useApi'
import { Plus, UserCheck, UserX } from 'lucide-react'

const BROWN = '#4A1C0A'
const ROLES = { dueno: 'Dueño', vendedor: 'Vendedor', deposito: 'Depósito' }

export default function Users() {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({ name:'', email:'', password:'', role:'vendedor' })

  const load = async () => { const r = await api.get('/users'); setUsers(r.data) }
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    await api.post('/users', form)
    setModal(false); setForm({ name:'', email:'', password:'', role:'vendedor' }); load()
  }

  const toggleActive = async (id, active) => {
    await api.patch(`/users/${id}/active`, { active: !active })
    load()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: BROWN }}>Usuarios del sistema</h1>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: BROWN }}>
          <Plus size={15} /> Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-xs">
            <tr>
              {['Nombre','Email','Rol','Estado','Acciones'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-stone-50">
                <td className="px-5 py-3 font-medium text-stone-800">{u.name}</td>
                <td className="px-5 py-3 text-stone-500">{u.email}</td>
                <td className="px-5 py-3">
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                    {ROLES[u.role]}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive(u.id, u.active)}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800">
                    {u.active ? <><UserX size={13} /> Desactivar</> : <><UserCheck size={13} /> Activar</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="font-bold text-lg mb-5" style={{ color: BROWN }}>Nuevo usuario</h2>
            <form onSubmit={save} className="space-y-3">
              {[
                { name:'name',     label:'Nombre completo', required:true },
                { name:'email',    label:'Email',           required:true, type:'email' },
                { name:'password', label:'Contraseña',      required:true, type:'password' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-stone-600 mb-1">{f.label}</label>
                  <input type={f.type || 'text'} required={f.required}
                    value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Rol</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium"
                  style={{ background: BROWN }}>Crear</button>
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-100 text-stone-600 text-sm">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
