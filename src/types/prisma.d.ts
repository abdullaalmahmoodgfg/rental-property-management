import { Expense as PrismaExpense, Prisma } from '@prisma/client'

declare module '@prisma/client' {
  export interface Expense extends PrismaExpense {}
}
