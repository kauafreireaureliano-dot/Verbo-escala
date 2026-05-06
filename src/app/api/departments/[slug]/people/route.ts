export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    const { env } = getRequestContext()
    const prisma = getDb(env.DB)
    const dep = await prisma.department.findUnique({ where: { slug: params.slug } })
    if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const people = await prisma.person.findMany({
      where: { departmentId: dep.id },
      include: { personRoles: { include: { role: true } }, unavailabilities: true },
    })
    return NextResponse.json(people)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { env } = getRequestContext()
    const prisma = getDb(env.DB)
    const dep = await prisma.department.findUnique({ where: { slug: params.slug } })
    if (!dep) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { name, maxServicesPerWeek, roleIds } = await request.json() as { name: string; maxServicesPerWeek: number; roleIds: string[] }
    const limitedRoleIds = (roleIds as string[]).slice(0, 2)
    const person = await prisma.person.create({
      data: {
        name,
        maxServicesPerWeek: maxServicesPerWeek ?? 1,
        departmentId: dep.id,
        personRoles: { create: limitedRoleIds.map((rid: string) => ({ roleId: rid })) },
      },
      include: { personRoles: { include: { role: true } } },
    })
    return NextResponse.json(person)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
