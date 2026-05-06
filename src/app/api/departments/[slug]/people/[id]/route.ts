export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: { slug: string; id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const { name, maxServicesPerWeek, roleIds } = await request.json()
  const limitedRoleIds = (roleIds as string[]).slice(0, 2)
  await prisma.personRole.deleteMany({ where: { personId: params.id } })
  const person = await prisma.person.update({
    where: { id: params.id },
    data: {
      name,
      maxServicesPerWeek,
      personRoles: { create: limitedRoleIds.map((rid: string) => ({ roleId: rid })) },
    },
    include: { personRoles: { include: { role: true } } },
  })
  return NextResponse.json(person)
}

export async function DELETE(_request: Request, { params }: { params: { slug: string; id: string } }) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  await prisma.person.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
