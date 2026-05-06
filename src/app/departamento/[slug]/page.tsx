'use client'

export const runtime = 'edge'

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

const NAV = [
  { label: 'Funções', icon: '🎯', key: 'funcoes' as const },
  { label: 'Pessoas', icon: '👥', key: 'pessoas' as const },
  { label: 'Escalas', icon: '📅', key: 'escala' as const },
]

export default function DepartmentPage({ params }: { params: { slug: string } }) {
  const [dep, setDep] = useState<Department | null>(null)

  useEffect(() => {
    fetch(`/api/departments/${params.slug}`)
      .then((r) => r.json())
      .then((data) => setDep(data as Department))
  }, [params.slug])

  if (!dep) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-400 text-center">
        <div className="text-3xl mb-2">⏳</div>
        <p className="text-sm">Carregando...</p>
      </div>
    </div>
  )

  const counts = { funcoes: dep.roles.length, pessoas: dep.people.length, escala: dep.schedules.length }
  const lastSchedules = dep.schedules.slice(-3).reverse()

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb + Header */}
      <div>
        <Link href="/" className="text-xs text-purple-600 hover:underline font-medium">← Departamentos</Link>
        <div className="mt-2 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md" style={{ background: 'linear-gradient(135deg, #534AB7, #3d35a0)' }}>
            {dep.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">{dep.name}</h1>
            <p className="text-sm text-gray-400">Líder: {dep.leaderName}</p>
          </div>
        </div>
      </div>

      {/* Cards de navegação */}
      <div className="grid grid-cols-3 gap-3">
        {NAV.map(({ label, icon, key }) => (
          <Link
            key={key}
            href={`/departamento/${dep.slug}/${key}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold" style={{ color: '#534AB7' }}>{counts[key]}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      {/* Fluxo rápido se zerado */}
      {dep.roles.length === 0 && dep.people.length === 0 && dep.schedules.length === 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-purple-800 mb-2">Por onde começar?</p>
          <ol className="text-xs text-purple-700 flex flex-col gap-1.5 list-none">
            <li className="flex items-start gap-2"><span className="font-bold shrink-0">1.</span> Acesse <strong>Funções</strong> e cadastre os cargos do departamento</li>
            <li className="flex items-start gap-2"><span className="font-bold shrink-0">2.</span> Acesse <strong>Pessoas</strong> e adicione os membros com suas funções</li>
            <li className="flex items-start gap-2"><span className="font-bold shrink-0">3.</span> Acesse <strong>Escalas</strong> e gere sua primeira escala</li>
          </ol>
        </div>
      )}

      {/* Últimas escalas */}
      {lastSchedules.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm">Últimas Escalas</h2>
            <Link href={`/departamento/${dep.slug}/escala`} className="text-xs text-purple-600 hover:underline">ver todas →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lastSchedules.map((s) => (
              <Link
                key={s.id}
                href={`/departamento/${dep.slug}/escala/${s.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📋</span>
                  <span className="font-medium text-gray-800 text-sm">{s.name}</span>
                </div>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
