'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Entry = {
  id: string
  date: string
  isManual: boolean
  role: { id: string; name: string }
  person: { id: string; name: string }
}

type Schedule = {
  id: string
  name: string
  departmentId: string
  department: { slug: string; name: string }
  entries: Entry[]
}

type Person = { id: string; name: string; personRoles: { roleId: string }[] }
type Unavailability = { id: string; date: string }

function groupByWeekAndDay(entries: Entry[]) {
  const weeks: Record<string, Record<string, Entry[]>> = {}
  for (const entry of entries) {
    const date = new Date(entry.date)
    const day = date.getUTCDay()
    const monday = new Date(date)
    const diff = day === 0 ? -6 : 1 - day
    monday.setUTCDate(date.getUTCDate() + diff)
    const weekKey = monday.toISOString().split('T')[0]
    const dayKey = entry.date.split('T')[0]
    if (!weeks[weekKey]) weeks[weekKey] = {}
    if (!weeks[weekKey][dayKey]) weeks[weekKey][dayKey] = []
    weeks[weekKey][dayKey].push(entry)
  }
  return weeks
}

export default function ScheduleViewPage({ params }: { params: { slug: string; id: string } }) {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [swapEntry, setSwapEntry] = useState<Entry | null>(null)
  const [swapPersonId, setSwapPersonId] = useState('')
  const [unavailEntry, setUnavailEntry] = useState<Entry | null>(null)
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([])
  const [newUnavailDate, setNewUnavailDate] = useState('')

  async function load() {
    const [s, p] = await Promise.all([
      fetch(`/api/schedules/${params.id}`).then((r) => r.json()),
      fetch(`/api/departments/${params.slug}/people`).then((r) => r.json()),
    ])
    setSchedule(s)
    setPeople(p)
  }

  useEffect(() => { load() }, [params.id, params.slug])

  async function handleSwap() {
    if (!swapEntry || !swapPersonId) return
    await fetch(`/api/schedules/${params.id}/entries/${swapEntry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId: swapPersonId }),
    })
    setSwapEntry(null)
    setSwapPersonId('')
    load()
  }

  async function handleRemoveEntry(entryId: string) {
    await fetch(`/api/schedules/${params.id}/entries/${entryId}`, { method: 'DELETE' })
    load()
  }

  async function openUnavail(entry: Entry) {
    setUnavailEntry(entry)
    const data = await fetch(`/api/people/${entry.person.id}/unavailabilities`).then((r) => r.json())
    setUnavailabilities(data)
  }

  async function addUnavail() {
    if (!unavailEntry || !newUnavailDate) return
    await fetch(`/api/people/${unavailEntry.person.id}/unavailabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newUnavailDate }),
    })
    const data = await fetch(`/api/people/${unavailEntry.person.id}/unavailabilities`).then((r) => r.json())
    setUnavailabilities(data)
    setNewUnavailDate('')
  }

  async function removeUnavail(unavId: string) {
    if (!unavailEntry) return
    await fetch(`/api/people/${unavailEntry.person.id}/unavailabilities/${unavId}`, { method: 'DELETE' })
    const data = await fetch(`/api/people/${unavailEntry.person.id}/unavailabilities`).then((r) => r.json())
    setUnavailabilities(data)
  }

  function copyWhatsApp() {
    if (!schedule) return
    let text = `*${schedule.name}*\n\n`
    const weeks = groupByWeekAndDay(schedule.entries)
    for (const weekKey of Object.keys(weeks).sort()) {
      const weekStart = new Date(weekKey + 'T00:00:00Z')
      text += `*Semana de ${weekStart.toLocaleDateString('pt-BR')}*\n`
      for (const dayKey of Object.keys(weeks[weekKey]).sort()) {
        const date = new Date(dayKey + 'T00:00:00Z')
        text += `  ${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}:\n`
        for (const entry of weeks[weekKey][dayKey]) {
          text += `    • ${entry.role.name}: ${entry.person.name}\n`
        }
      }
      text += '\n'
    }
    navigator.clipboard.writeText(text)
    alert('Escala copiada para o clipboard!')
  }

  if (!schedule) return <p className="text-gray-400">Carregando...</p>

  const weeks = groupByWeekAndDay(schedule.entries)

  return (
    <div>
      <div className="mb-4">
        <Link href={`/departamento/${schedule.department.slug}/escala`} className="text-sm text-purple-600 hover:underline">← Escalas</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">{schedule.name}</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={copyWhatsApp}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
        >
          📋 WhatsApp
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
        >
          🖨️ Imprimir
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {Object.keys(weeks).sort().map((weekKey) => {
          const weekStart = new Date(weekKey + 'T00:00:00Z')
          return (
            <div key={weekKey} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 font-semibold text-white text-sm" style={{ backgroundColor: '#534AB7' }}>
                Semana de {weekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
              </div>
              <div className="divide-y divide-gray-100">
                {Object.keys(weeks[weekKey]).sort().map((dayKey) => {
                  const date = new Date(dayKey + 'T00:00:00Z')
                  return (
                    <div key={dayKey} className="px-4 py-3">
                      <h3 className="font-medium text-gray-700 text-sm mb-2 capitalize">
                        {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })}
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        {weeks[weekKey][dayKey].map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                {entry.role.name}
                              </span>
                              <span className="text-sm text-gray-800">{entry.person.name}</span>
                              {entry.isManual && (
                                <span className="text-xs text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">editado</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setSwapEntry(entry); setSwapPersonId('') }}
                                className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200"
                              >
                                Trocar
                              </button>
                              <button
                                onClick={() => openUnavail(entry)}
                                className="text-base px-1.5 py-0.5 rounded hover:bg-red-100 text-red-500"
                                title="Indisponibilidades"
                              >
                                🚫
                              </button>
                              <button
                                onClick={() => handleRemoveEntry(entry.id)}
                                className="text-base px-1.5 py-0.5 rounded hover:bg-gray-200 text-gray-500"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Swap Modal */}
      {swapEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Trocar {swapEntry.role.name}</h3>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={swapPersonId}
              onChange={(e) => setSwapPersonId(e.target.value)}
            >
              <option value="">Selecionar pessoa...</option>
              {people
                .filter((p) => p.personRoles.some((pr) => pr.roleId === swapEntry.role.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleSwap}
                disabled={!swapPersonId}
                className="flex-1 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                style={{ backgroundColor: '#534AB7' }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setSwapEntry(null)}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unavailability Modal */}
      {unavailEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-1">Indisponibilidades</h3>
            <p className="text-sm text-gray-500 mb-4">{unavailEntry.person.name}</p>
            <div className="flex gap-2 mb-4">
              <input
                type="date"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                value={newUnavailDate}
                onChange={(e) => setNewUnavailDate(e.target.value)}
              />
              <button
                onClick={addUnavail}
                className="text-white px-3 py-2 rounded-lg font-medium text-sm"
                style={{ backgroundColor: '#534AB7' }}
              >
                Adicionar
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto mb-4">
              {unavailabilities.map((u) => (
                <div key={u.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                  <span className="text-sm text-gray-700">
                    {new Date(u.date + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>
                  <button
                    onClick={() => removeUnavail(u.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {unavailabilities.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-2">Nenhuma data cadastrada</p>
              )}
            </div>
            <button
              onClick={() => setUnavailEntry(null)}
              className="w-full border border-gray-300 py-2 rounded-lg text-gray-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
