type Role = { id: string; name: string }
type PersonWithRoles = {
  id: string
  name: string
  maxServicesPerWeek: number
  personRoles: { roleId: string }[]
  unavailabilities: { dayOfWeek: number }[]
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  d.setUTCDate(diff)
  return d.toISOString().split('T')[0]
}

export function generateSchedule(
  dates: Date[],
  roles: Role[],
  people: PersonWithRoles[]
): { date: Date; roleId: string; personId: string }[] {
  const entries: { date: Date; roleId: string; personId: string }[] = []
  const rotationIndex: Record<string, number> = {}
  const weeklyCount: Record<string, Record<string, number>> = {}
  // Tracks which index in `dates` each person last served on
  const lastServedIdx: Record<string, number> = {}

  for (let dateIdx = 0; dateIdx < dates.length; dateIdx++) {
    const date = dates[dateIdx]
    const assignedToday = new Set<string>()

    for (const role of roles) {
      const eligible = people.filter((p) =>
        p.personRoles.some((pr) => pr.roleId === role.id)
      )
      if (eligible.length === 0) continue

      if (rotationIndex[role.id] === undefined) rotationIndex[role.id] = 0

      const weekKey = getWeekKey(date)
      if (!weeklyCount[weekKey]) weeklyCount[weekKey] = {}

      const isUnavailable = (p: PersonWithRoles) =>
        p.unavailabilities.some((u) => u.dayOfWeek === date.getDay())

      const isOverLimit = (p: PersonWithRoles) => {
        if (p.maxServicesPerWeek === 0) return false
        return (weeklyCount[weekKey][p.id] || 0) >= p.maxServicesPerWeek
      }

      // Served on the immediately previous service date
      const servedLastDate = (p: PersonWithRoles) => {
        const last = lastServedIdx[p.id]
        return last !== undefined && dateIdx - last <= 1
      }

      let assigned: PersonWithRoles | null = null
      const startIdx = rotationIndex[role.id] % eligible.length

      // Pass 1: all constraints (no unavailable, no over limit, not today, not last date)
      for (let i = 0; i < eligible.length; i++) {
        const idx = (startIdx + i) % eligible.length
        const person = eligible[idx]
        if (!isUnavailable(person) && !isOverLimit(person) && !assignedToday.has(person.id) && !servedLastDate(person)) {
          assigned = person
          rotationIndex[role.id] = (idx + 1) % eligible.length
          break
        }
      }

      // Pass 2: relax "served last date" — allow consecutive if needed
      if (!assigned) {
        for (let i = 0; i < eligible.length; i++) {
          const idx = (startIdx + i) % eligible.length
          const person = eligible[idx]
          if (!isUnavailable(person) && !isOverLimit(person) && !assignedToday.has(person.id)) {
            assigned = person
            rotationIndex[role.id] = (idx + 1) % eligible.length
            break
          }
        }
      }

      // Pass 3: relax "already assigned today" too
      if (!assigned) {
        for (let i = 0; i < eligible.length; i++) {
          const idx = (startIdx + i) % eligible.length
          const person = eligible[idx]
          if (!isUnavailable(person) && !isOverLimit(person)) {
            assigned = person
            rotationIndex[role.id] = (idx + 1) % eligible.length
            break
          }
        }
      }

      if (assigned) {
        entries.push({ date, roleId: role.id, personId: assigned.id })
        assignedToday.add(assigned.id)
        weeklyCount[weekKey][assigned.id] = (weeklyCount[weekKey][assigned.id] || 0) + 1
        lastServedIdx[assigned.id] = dateIdx
      }
    }
  }

  return entries
}
