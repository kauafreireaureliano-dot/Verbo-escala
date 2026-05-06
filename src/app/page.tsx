'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Department = { id: string; name: string; leaderName: string; slug: string }

const STEPS = [
  {
    n: '1',
    title: 'Crie um Departamento',
    desc: 'Ex: Louvor, Recepção, Mídia. Cada departamento tem sua própria URL e escalas independentes.',
  },
  {
    n: '2',
    title: 'Cadastre as Funções',
    desc: 'Ex: Guitarra, Baixo, Bateria, Projeção. São os cargos que serão escalados.',
  },
  {
    n: '3',
    title: 'Adicione as Pessoas',
    desc: 'Associe até 2 funções por pessoa e defina quantas vezes por semana ela pode servir.',
  },
  {
    n: '4',
    title: 'Gere a Escala',
    desc: 'Escolha o período e os dias de culto. O sistema distribui automaticamente de forma justa.',
  },
]

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
    <div className="flex flex-col gap-8">

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden shadow-md text-white text-center py-10 px-6" style={{ background: 'linear-gradient(135deg, #534AB7 0%, #3d35a0 100%)' }}>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <span className="text-2xl">📅</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">Escala Verbo</h1>
        <p className="text-purple-200 text-sm mb-6">Escalas automáticas e justas para sua equipe</p>
        <blockquote className="bg-white/10 rounded-xl px-5 py-4 text-sm leading-relaxed italic max-w-md mx-auto">
          <p className="mb-1">"...um só Senhor, uma só fé, um só batismo; um só Deus e Pai de todos, o qual é sobre todos, e por todos, e em todos."</p>
          <footer className="text-purple-200 not-italic font-medium text-xs mt-2">Efésios 4:5–6</footer>
        </blockquote>
      </div>

      {/* Como usar */}
      <div>
        <h2 className="text-base font-bold text-gray-700 mb-3">Como usar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm text-white" style={{ backgroundColor: '#534AB7' }}>
                {s.n}
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{s.title}</div>
                <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex gap-2.5">
          <span className="text-lg shrink-0">💡</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Dica:</strong> Depois de gerar a escala, você pode trocar qualquer pessoa manualmente, remover entradas e até regenerar com um clique caso as disponibilidades mudem.
          </p>
        </div>
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
                <p className="text-sm text-gray-400">Líder: {dep.leaderName}</p>
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
