'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Role = { id: string; name: string }
type Person = {
  id: string
  name: string
  maxServicesPerWeek: number
  personRoles: { role: { id: string; name: string } }[]
}

const FREQ_OPTIONS = [
  { label: '1x/semana', value: 1 },
  { label: '2x/semana', value: 2 },
  { label: '3x/semana', value: 3 },
  { label: 'Ilimitado', value: 0 },
]

export default function PessoasPage({ params }: { params: { slug: string } }) {
  const [people, setPeople] = useState<Person[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [name, setName] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [maxServices, setMaxServices] = useState(1)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/departments/${params.slug}/people`).then((r) => r.json()),
      fetch(`/api/departments/${params.slug}/roles`).then((r) => r.json()),
    ]).then(([p, r]) => {
      setPeople(p as Person[])
      setRoles(r as Role[])
    })
  }, [params.slug])

  function toggleRole(id: string) {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : prev.length < 2 ? [...prev, id] : prev
    )
  }

  function startEdit(person: Person) {
    setEditId(person.id)
    setName(person.name)
    setSelectedRoles(person.personRoles.map((pr) => pr.role.id))
    setMaxServices(person.maxServicesPerWeek)
  }

  function cancelEdit() {
    setEditId(null)
    setName('')
    setSelectedRoles([])
    setMaxServices(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { name, maxServicesPerWeek: maxServices, roleIds: selectedRoles }

    if (editId) {
      await fetch(`/api/departments/${params.slug}/people/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      await fetch(`/api/departments/${params.slug}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    const updated = (await fetch(`/api/departments/${params.slug}/people`).then((r) => r.json())) as Person[]
    setPeople(updated)
    cancelEdit()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/departments/${params.slug}/people/${id}`, { method: 'DELETE' })
    setPeople((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/departamento/${params.slug}`} className="text-sm text-purple-600 hover:underline">← Departamento</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Pessoas</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">{editId ? 'Editar Pessoa' : 'Nova Pessoa'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nome da pessoa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <p className="text-sm text-gray-600 mb-2">Funções (máx. 2):</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    selectedRoles.includes(role.id)
                      ? 'text-white border-transparent'
                      : 'text-gray-600 border-gray-300 hover:border-purple-400'
                  }`}
                  style={selectedRoles.includes(role.id) ? { backgroundColor: '#534AB7' } : {}}
                >
                  {role.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Frequência máxima:</p>
            <div className="flex flex-wrap gap-2">
              {FREQ_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMaxServices(opt.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    maxServices === opt.value
                      ? 'text-white border-transparent'
                      : 'text-gray-600 border-gray-300 hover:border-purple-400'
                  }`}
                  style={maxServices === opt.value ? { backgroundColor: '#534AB7' } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#534AB7' }}
            >
              {editId ? 'Salvar' : 'Adicionar'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        {people.map((person) => (
          <div key={person.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{person.name}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {person.personRoles.map((pr) => (
                    <span
                      key={pr.role.id}
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: '#534AB7' }}
                    >
                      {pr.role.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 text-sm">
                <button onClick={() => startEdit(person)} className="text-purple-600 hover:underline">Editar</button>
                <button onClick={() => handleDelete(person.id)} className="text-red-400 hover:text-red-600">Excluir</button>
              </div>
            </div>
          </div>
        ))}
        {people.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma pessoa cadastrada ainda.</p>
        )}
      </div>
    </div>
  )
}
