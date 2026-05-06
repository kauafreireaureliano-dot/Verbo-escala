export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB, newId } from '@/lib/db'

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
  try {
    const db = getDB()
    const { results } = await db.prepare('SELECT * FROM "Department" ORDER BY createdAt DESC').all()
    return NextResponse.json(results)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const db = getDB()
    const { name, leaderName } = await request.json() as { name: string; leaderName: string }
    const id = newId()
    const slug = slugify(name) + '-' + Date.now().toString(36)
    await db.prepare('INSERT INTO "Department" (id, name, leaderName, slug) VALUES (?, ?, ?, ?)')
      .bind(id, name, leaderName, slug).run()
    const dep = await db.prepare('SELECT * FROM "Department" WHERE id = ?').bind(id).first()
    return NextResponse.json(dep)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
