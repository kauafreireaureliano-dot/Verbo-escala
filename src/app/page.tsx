'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Department = {
  id: string
  name: string
  leaderName: string
  slug: string
}

export default function Home() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [name, setName] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [loading, setLoading] = useState(false)
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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Departamentos</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Novo Departamento</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nome do departamento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nome do líder"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="text-white font-semibold py-2 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#534AB7' }}
          >
            {loading ? 'Criando...' : 'Criar Departamento'}
          </button>
        </form>
      </div>

      <div className="grid gap-3">
        {departments.map((dep) => (
          <a
            key={dep.id}
            href={`/departamento/${dep.slug}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-purple-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{dep.name}</h3>
                <p className="text-sm text-gray-500">Líder: {dep.leaderName}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        ))}
        {departments.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhum departamento cadastrado ainda.</p>
        )}
      </div>
    </div>
  )
}
