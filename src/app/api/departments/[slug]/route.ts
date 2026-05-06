export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const department = await prisma.department.findUnique({
    where: { slug: params.slug },
    include: { roles: true, people: true, schedules: { orderBy: { createdAt: 'asc' } } },
  })
  if (!department) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(department)
}
