'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Department = { id: string; name: string; leaderName: string; slug: string }

export default function Home() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [name, setName] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((data) => setDepartments(data as Department[]))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, leaderName }),
    })
    const dep = (await res.json()) as Department
    setLoading(false)
    router.push(`/departamento/${dep.slug}`)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Hero compacto */}
      <div className="rounded-2xl text-white px-5 py-6 text-center shadow-md" style={{ background: 'linear-gradient(135deg, #534AB7 0%, #3d35a0 100%)' }}>
        <h1 className="text-xl font-bold mb-1">Escala Verbo</h1>
        <p className="text-purple-200 text-xs italic">"...um só Senhor, uma só fé, um só batismo" — Ef 4:5</p>
      </div>

      {/* Departamentos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-700">Departamentos</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            style={{ backgroundColor: '#534AB7' }}
          >
            <span className="text-base leading-none">{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancelar' : 'Novo'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-5 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">Novo Departamento</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Nome do departamento (ex: Louvor)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder="Nome do líder responsável"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="text-white font-semibold py-2.5 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 text-sm"
                style={{ backgroundColor: '#534AB7' }}
              >
                {loading ? 'Criando...' : 'Criar Departamento'}
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {departments.map((dep) => (
            <a
              key={dep.id}
              href={`/departamento/${dep.slug}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: '#534AB7' }}>
                {dep.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{dep.name}</h3>
                <p className="text-xs text-gray-400">Líder: {dep.leaderName}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
          {departments.length === 0 && !showForm && (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-3">🏛️</div>
              <p className="text-sm">Nenhum departamento ainda.</p>
              <p className="text-xs mt-1">Clique em <strong>"Novo"</strong> para começar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
