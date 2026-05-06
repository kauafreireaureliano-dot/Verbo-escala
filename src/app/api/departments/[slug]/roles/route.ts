export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const dep = await prisma.department.findUnique({ where: { slug: params.slug } })
  if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const roles = await prisma.role.findMany({ where: { departmentId: dep.id } })
  return NextResponse.json(roles)
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const dep = await prisma.department.findUnique({ where: { slug: params.slug } })
  if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { name } = await request.json() as { name: string }
  const role = await prisma.role.create({ data: { name, departmentId: dep.id } })
  return NextResponse.json(role)
}
