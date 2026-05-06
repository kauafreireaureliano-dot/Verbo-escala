export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const unavailabilities = await prisma.personUnavailability.findMany({
    where: { personId: params.id },
    orderBy: { dayOfWeek: 'asc' },
  })
  return NextResponse.json(unavailabilities)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const { dayOfWeek } = await request.json() as { dayOfWeek: number }
  const unavailability = await prisma.personUnavailability.upsert({
    where: { personId_dayOfWeek: { personId: params.id, dayOfWeek } },
    update: {},
    create: { personId: params.id, dayOfWeek },
  })
  return NextResponse.json(unavailability)
}
