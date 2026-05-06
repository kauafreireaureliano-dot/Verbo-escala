import { PrismaClient } from '@prisma/client/edge'
import { PrismaD1 } from '@prisma/adapter-d1'

export function getDb(d1: D1Database) {
  return new PrismaClient({ adapter: new PrismaD1(d1) })
}
