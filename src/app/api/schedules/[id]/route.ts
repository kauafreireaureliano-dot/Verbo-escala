export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const schedule = await prisma.schedule.findUnique({
    where: { id: params.id },
    include: {
      department: true,
      entries: {
        include: { role: true, person: true },
        orderBy: { date: 'asc' },
      },
    },
  })
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(schedule)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  await prisma.schedule.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
