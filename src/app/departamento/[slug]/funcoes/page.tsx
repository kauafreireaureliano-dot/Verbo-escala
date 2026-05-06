'use client'

export const runtime = 'edge'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Role = { id: string; name: string }

export default function FuncoesPage({ params }: { params: { slug: string } }) {
  const [roles, setRoles] = useState<Role[]>([])
  const [name, setName] = useState('')

  useEffect(() => {
    fetch(`/api/departments/${params.slug}/roles`)
      .then((r) => r.json())
      .then((data) => setRoles(data as Role[]))
  }, [params.slug])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/departments/${params.slug}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const role = (await res.json()) as Role
    setRoles((prev) => [...prev, role])
    setName('')
  }

  async function handleDelete(id: string) {
    await fetch(`/api/departments/${params.slug}/roles/${id}`, { method: 'DELETE' })
    setRoles((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/departamento/${params.slug}`} className="text-sm text-purple-600 hover:underline">← Departamento</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Funções</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nome da função"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#534AB7' }}
          >
            Adicionar
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <span className="font-medium text-gray-800">{role.name}</span>
            <button
              onClick={() => handleDelete(role.id)}
              className="text-red-400 hover:text-red-600 transition-colors text-sm"
            >
              Excluir
            </button>
          </div>
        ))}
        {roles.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma função cadastrada ainda.</p>
        )}
      </div>
    </div>
  )
}
