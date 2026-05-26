import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const API = 'https://6a162a831b90031f81b0bab7.mockapi.io/incidencias'

export default function DashboardPage() {
  const [issues, setIssues] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ titulo: '', descripcion: '', estado: 'Pendiente', prioridad: 'Media' })
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    const res = await fetch(API)
    const data = await res.json()
    setIssues(data)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ titulo: '', descripcion: '', estado: 'Pendiente', prioridad: 'Media' })
    setShowForm(true)
  }

  const openEdit = (issue) => {
    setEditing(issue)
    setForm({ titulo: issue.titulo, descripcion: issue.descripcion, estado: issue.estado, prioridad: issue.prioridad })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await fetch(`${API}/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setShowForm(false)
    fetchIssues()
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    fetchIssues()
  }

  const estadoColor = (e) => {
    if (e === 'Pendiente') return 'bg-yellow-100 text-yellow-800'
    if (e === 'En Progreso') return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  const prioridadColor = (p) => {
    if (p === 'Alta') return 'bg-red-100 text-red-700'
    if (p === 'Media') return 'bg-orange-100 text-orange-700'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg">🐛 Issue Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.name} · {user?.role}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-blue-50"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Incidencias</h2>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            + Nueva
          </button>
        </div>

        {issues.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No hay incidencias registradas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 border border-gray-100">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-gray-800">{issue.titulo}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${prioridadColor(issue.prioridad)}`}>
                    {issue.prioridad}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{issue.descripcion}</p>
                <span className={`self-start text-xs font-medium px-2 py-1 rounded-full ${estadoColor(issue.estado)}`}>
                  {issue.estado}
                </span>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openEdit(issue)}
                    className="flex-1 text-sm border border-blue-500 text-blue-600 rounded-lg py-1 hover:bg-blue-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(issue.id)}
                    className="flex-1 text-sm border border-red-400 text-red-500 rounded-lg py-1 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editing ? 'Editar incidencia' : 'Nueva incidencia'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={3}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Pendiente</option>
                    <option>En Progreso</option>
                    <option>Resuelto</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Baja</option>
                    <option>Media</option>
                    <option>Alta</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
             type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}