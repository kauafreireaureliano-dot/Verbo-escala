export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { id: string; entryId: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const { personId } = await request.json()
  const entry = await prisma.scheduleEntry.update({
    where: { id: params.entryId },
    data: { personId, isManual: true },
    include: { role: true, person: true },
  })
  return NextResponse.json(entry)
}

export async function DELETE(_request: Request, { params }: { params: { id: string; entryId: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  await prisma.scheduleEntry.delete({ where: { id: params.entryId } })
  return NextResponse.json({ ok: true })
}
