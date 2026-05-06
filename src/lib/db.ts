import { getRequestContext } from '@cloudflare/next-on-pages'

export function getDB(): D1Database {
  const { env } = getRequestContext()
  return (env as unknown as { DB: D1Database }).DB
}

export function newId(): string {
  return crypto.randomUUID().replace(/-/g, '')
}
