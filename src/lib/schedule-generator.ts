type Role = { id: string; name: string }
type PersonWithRoles = {
  id: string
  name: string
  maxServicesPerWeek: number
  personRoles: { roleId: string }[]
  unavailabilities: { date: Date }[]
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

  for (const date of dates) {
    const dateStr = date.toISOString().split('T')[0]
    const assignedToday = new Set<string>()

    for (const role of roles) {
      const eligible = people.filter((p) =>
        p.personRoles.some((pr) => pr.roleId === role.id)
      )

      if (eligible.length === 0) continue

      if (!rotationIndex[role.id]) rotationIndex[role.id] = 0

      const weekKey = getWeekKey(date)
      if (!weeklyCount[weekKey]) weeklyCount[weekKey] = {}

      const isUnavailable = (p: PersonWithRoles) =>
        p.unavailabilities.some(
          (u) => u.date.toISOString().split('T')[0] === dateStr
        )

      const isOverLimit = (p: PersonWithRoles) => {
        if (p.maxServicesPerWeek === 0) return false
        const count = weeklyCount[weekKey][p.id] || 0
        return count >= p.maxServicesPerWeek
      }

      let assigned: PersonWithRoles | null = null
      const startIdx = rotationIndex[role.id] % eligible.length

      // First pass: respect all constraints
      for (let i = 0; i < eligible.length; i++) {
        const idx = (startIdx + i) % eligible.length
        const person = eligible[idx]
        if (!isUnavailable(person) && !isOverLimit(person) && !assignedToday.has(person.id)) {
          assigned = person
          rotationIndex[role.id] = (idx + 1) % eligible.length
          break
        }
      }

      // Second pass: relax "already assigned today" constraint
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
      }
    }
  }

  return entries
}
