export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const entries = await prisma.scheduleEntry.findMany({
    where: { scheduleId: params.id },
    include: { role: true, person: true },
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(entries)
}
