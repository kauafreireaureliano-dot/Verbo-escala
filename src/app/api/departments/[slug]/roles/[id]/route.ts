export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(_request: Request, { params }: { params: { slug: string; id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  await prisma.role.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
