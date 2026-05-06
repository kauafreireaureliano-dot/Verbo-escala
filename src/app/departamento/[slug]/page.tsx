'use client'

export const runtime = 'edge'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Schedule = { id: string; name: string; startDate: string; endDate: string }
type Department = {
  id: string
  name: string
  leaderName: string
  slug: string
  notes: string
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
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const router = useRouter()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/departments/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        const d = data as Department
        setDep(d)
        setNotes(d.notes ?? '')
      })
  }, [params.slug])

  function handleNotesChange(value: string) {
    setNotes(value)
    setNotesSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSavingNotes(true)
      await fetch(`/api/departments/${params.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value }),
      })
      setSavingNotes(false)
      setNotesSaved(true)
    }, 800)
  }

  async function handleDelete() {
    if (!dep) return
    if (!confirm(`Excluir o departamento "${dep.name}" permanentemente? Todas as pessoas, funções e escalas serão apagadas.`)) return
    await fetch(`/api/departments/${dep.slug}`, { method: 'DELETE' })
    router.push('/')
  }

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

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/" className="text-xs text-purple-600 hover:underline font-medium">← Departamentos</Link>
          <div className="mt-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #534AB7, #3d35a0)' }}>
              {dep.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">{dep.name}</h1>
              <p className="text-sm text-gray-400">Líder: {dep.leaderName}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="mt-6 flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
          title="Excluir departamento"
        >
          🗑️ Excluir
        </button>
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

      {/* Observações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-700 text-sm">📝 Observações</h2>
          <span className="text-xs text-gray-400">
            {savingNotes ? 'Salvando...' : notesSaved ? '✓ Salvo' : ''}
          </span>
        </div>
        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none leading-relaxed"
          rows={4}
          placeholder="Anotações gerais do departamento, informações importantes, recados para a equipe..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
        />
      </div>

      {/* Onboarding quando zerado */}
      {dep.roles.length === 0 && dep.people.length === 0 && dep.schedules.length === 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-purple-800 mb-2">Por onde começar?</p>
          <ol className="text-xs text-purple-700 flex flex-col gap-1.5">
            <li className="flex items-start gap-2"><span className="font-bold shrink-0">1.</span> Acesse <strong>Funções</strong> e cadastre os cargos</li>
            <li className="flex items-start gap-2"><span className="font-bold shrink-0">2.</span> Acesse <strong>Pessoas</strong> e adicione os membros</li>
            <li className="flex items-start gap-2"><span className="font-bold shrink-0">3.</span> Acesse <strong>Escalas</strong> e gere a primeira escala</li>
          </ol>
        </div>
      )}
    </div>
  )
}
