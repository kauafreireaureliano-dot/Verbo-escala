'use client'

export const runtime = 'edge'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Schedule = { id: string; name: string; startDate: string; endDate: string }

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function EscalaPage({ params }: { params: { slug: string } }) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/departments/${params.slug}/schedules`)
      .then((r) => r.json())
      .then((data) => setSchedules(data as Schedule[]))
  }, [params.slug])

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/departments/${params.slug}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, daysOfWeek }),
    })
    const schedule = (await res.json()) as Schedule
    setSchedules((prev) => [schedule, ...prev])
    setStartDate('')
    setEndDate('')
    setDaysOfWeek([])
    setLoading(false)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Excluir esta escala?')) return
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/departamento/${params.slug}`} className="text-sm text-purple-600 hover:underline">← Departamento</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Escalas</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Gerar Nova Escala</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Data de início</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Data de fim</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-2">Dias com culto/serviço</label>
            <div className="flex gap-1.5">
              {DAYS.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    daysOfWeek.includes(idx)
                      ? 'text-white border-transparent'
                      : 'text-gray-600 border-gray-300 hover:border-purple-400'
                  }`}
                  style={daysOfWeek.includes(idx) ? { backgroundColor: '#534AB7' } : {}}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || daysOfWeek.length === 0 || !startDate || !endDate}
            className="text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#534AB7' }}
          >
            {loading ? 'Gerando...' : 'Gerar Escala'}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        {schedules.map((s) => (
          <div key={s.id} className="relative group">
            <Link
              href={`/departamento/${params.slug}/escala/${s.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-purple-400 transition-colors flex items-center justify-between"
            >
              <div className="min-w-0 pr-10">
                <h3 className="font-semibold text-gray-800 truncate">{s.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(s.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} –{' '}
                  {new Date(s.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              onClick={(e) => handleDelete(s.id, e)}
              className="absolute top-1/2 -translate-y-1/2 right-10 p-2 text-gray-300 hover:text-red-500 transition-colors"
              title="Excluir escala"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {schedules.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma escala gerada ainda.</p>
        )}
      </div>
    </div>
  )
}
