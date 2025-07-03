import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Expense } from '@prisma/client';
import { expenseSchema, validateRequest, sanitizeObject } from '@/lib/validation';
import { handleError, UnauthorizedError, BadRequestError } from '@/lib/errors';
import { rate_limit } from '@/lib/rate-limit';
import { logAudit, AuditAction } from '@/lib/audit';

// POST /api/expenses - Create a new expense
export async function POST(req: NextRequest) {
  try {
    await rate_limit(req);

    const session = await getServerSession();
    if (!session || !session.user?.id) {
      throw new UnauthorizedError();
    }
    const userId = session.user.id;

    const body = await req.json();
    const sanitizedBody = sanitizeObject(body);
    const validation = validateRequest(expenseSchema, sanitizedBody);

    if (!validation.success) {
      throw new BadRequestError(validation.error);
    }

    const { propertyId, category, amount, description, date } = validation.data;

    const expense = await prisma.expense.create({
      data: {
        propertyId,
        category,
        amount: parseFloat(amount as any),
        description,
        date: new Date(date),
      },
    });

    await logAudit(AuditAction.CREATE, userId, { expenseId: expense.id, ...validation.data });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/expenses - Get all expenses
export async function GET(req: NextRequest) {
  try {
    await rate_limit(req);

    const session = await getServerSession();
    if (!session) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');

    const expenses = await prisma.expense.findMany({
      where: {
        propertyId: propertyId ? String(propertyId) : undefined,
      },
      include: {
        property: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}
