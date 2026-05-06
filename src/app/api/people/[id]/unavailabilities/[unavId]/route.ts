export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function DELETE(_request: Request, { params }: { params: { unavId: string } }) {
  try {
    const db = getDB()
    await db.prepare('DELETE FROM "PersonUnavailability" WHERE id = ?').bind(params.unavId).run()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
