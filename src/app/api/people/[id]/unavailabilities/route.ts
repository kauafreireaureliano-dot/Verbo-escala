export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const unavailabilities = await prisma.personUnavailability.findMany({
    where: { personId: params.id },
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(unavailabilities)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const { date } = await request.json() as { date: string }
  const unavailability = await prisma.personUnavailability.upsert({
    where: { personId_date: { personId: params.id, date: new Date(date) } },
    update: {},
    create: { personId: params.id, date: new Date(date) },
  })
  return NextResponse.json(unavailability)
}
