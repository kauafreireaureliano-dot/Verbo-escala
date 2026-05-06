'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Schedule = { id: string; name: string; startDate: string; endDate: string }
type Department = {
  id: string
  name: string
  leaderName: string
  slug: string
  roles: { id: string; name: string }[]
  people: { id: string; name: string }[]
  schedules: Schedule[]
}

export default function DepartmentPage({ params }: { params: { slug: string } }) {
  const [dep, setDep] = useState<Department | null>(null)

  useEffect(() => {
    fetch(`/api/departments/${params.slug}`)
      .then((r) => r.json())
      .then((data) => setDep(data as Department))
  }, [params.slug])

  if (!dep) return <p className="text-gray-400">Carregando...</p>

  const lastSchedules = dep.schedules.slice(-3).reverse()

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-purple-600 hover:underline">← Departamentos</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">{dep.name}</h1>
        <p className="text-gray-500 text-sm">Líder: {dep.leaderName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link
          href={`/departamento/${dep.slug}/funcoes`}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-purple-400 transition-colors"
        >
          <div className="text-3xl font-bold" style={{ color: '#534AB7' }}>{dep.roles.length}</div>
          <div className="text-gray-600 font-medium mt-1">Funções</div>
        </Link>
        <Link
          href={`/departamento/${dep.slug}/pessoas`}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-purple-400 transition-colors"
        >
          <div className="text-3xl font-bold" style={{ color: '#534AB7' }}>{dep.people.length}</div>
          <div className="text-gray-600 font-medium mt-1">Pessoas</div>
        </Link>
        <Link
          href={`/departamento/${dep.slug}/escala`}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-purple-400 transition-colors"
        >
          <div className="text-3xl font-bold" style={{ color: '#534AB7' }}>{dep.schedules.length}</div>
          <div className="text-gray-600 font-medium mt-1">Escalas</div>
        </Link>
      </div>

      {lastSchedules.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Últimas Escalas</h2>
          <div className="flex flex-col gap-2">
            {lastSchedules.map((s) => (
              <Link
                key={s.id}
                href={`/departamento/${dep.slug}/escala/${s.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors"
              >
                <span className="font-medium text-gray-800">{s.name}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
