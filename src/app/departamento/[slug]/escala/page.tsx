'use client'

export const runtime = 'edge'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Schedule = { id: string; name: string; startDate: string; endDate: string }

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function EscalaPage({ params }: { params: { slug: string } }) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [name, setName] = useState('')
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
      body: JSON.stringify({ name, startDate, endDate, daysOfWeek }),
    })
    const schedule = (await res.json()) as Schedule
    setSchedules((prev) => [...prev, schedule])
    setName('')
    setStartDate('')
    setEndDate('')
    setDaysOfWeek([])
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/departamento/${params.slug}`} className="text-sm text-purple-600 hover:underline">← Departamento</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">Escalas</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Gerar Nova Escala</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Nome da escala"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Data início</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Data fim</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Dias da semana:</p>
            <div className="flex gap-2">
              {DAYS.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
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
            disabled={loading || daysOfWeek.length === 0}
            className="text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#534AB7' }}
          >
            {loading ? 'Gerando...' : 'Gerar Escala'}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        {schedules.map((s) => (
          <Link
            key={s.id}
            href={`/departamento/${params.slug}/escala/${s.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-purple-400 transition-colors flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-800">{s.name}</h3>
              <p className="text-sm text-gray-500">
                {new Date(s.startDate).toLocaleDateString('pt-BR')} – {new Date(s.endDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
        {schedules.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma escala gerada ainda.</p>
        )}
      </div>
    </div>
  )
}
