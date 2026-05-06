export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'
import { getDb } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET() {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const departments = await prisma.department.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(departments)
}

export async function POST(request: Request) {
  const { env } = getRequestContext()
  const prisma = getDb(env.DB)
  const { name, leaderName } = await request.json() as { name: string; leaderName: string }
  const slug = slugify(name) + '-' + Date.now().toString(36)
  const department = await prisma.department.create({ data: { name, leaderName, slug } })
  return NextResponse.json(department)
}
