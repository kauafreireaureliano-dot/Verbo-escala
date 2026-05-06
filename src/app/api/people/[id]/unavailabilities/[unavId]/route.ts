export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(_request: Request, { params }: { params: { id: string; unavId: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  await prisma.personUnavailability.delete({ where: { id: params.unavId } })
  return NextResponse.json({ ok: true })
}
