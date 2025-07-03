import prisma from '@/lib/prisma';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  expenseBreakdown: { [category: string]: number };
  incomeByProperty: { [property: string]: number };
  expensesByProperty: { [property: string]: number };
}

export class ReportingService {
  static async generateFinancialSummary(
    startDate: Date,
    endDate: Date,
    propertyId?: string
  ): Promise<FinancialSummary> {
    const expenseWhere: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
    if (propertyId) {
      expenseWhere.propertyId = propertyId;
    }

    const paymentWhere: any = {
      paymentDate: {
        gte: startDate,
        lte: endDate,
      },
    };
    if (propertyId) {
      paymentWhere.lease = {
        unit: {
          propertyId: propertyId,
        },
      };
    }

    const expenses = await prisma.expense.findMany({
      where: expenseWhere,
      include: {
        property: true,
      },
    });

    const payments = await prisma.payment.findMany({
      where: paymentWhere,
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
    });

    const totalIncome = (payments as any[]).reduce((acc: number, p) => acc + p.amount, 0);
    const totalExpenses = (expenses as any[]).reduce((acc: number, e) => acc + e.amount, 0);

    const expenseBreakdown = (expenses as any[]).reduce((acc: { [category: string]: number }, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as { [category: string]: number });

    const incomeByProperty = (payments as any[]).reduce((acc: { [property: string]: number }, p) => {
      const propName = p.lease.unit.property.name;
      acc[propName] = (acc[propName] || 0) + p.amount;
      return acc;
    }, {} as { [property: string]: number });

    const expensesByProperty = (expenses as any[]).reduce((acc: { [property: string]: number }, e) => {
      const propName = e.property.name;
      acc[propName] = (acc[propName] || 0) + e.amount;
      return acc;
    }, {} as { [property: string]: number });

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      expenseBreakdown,
      incomeByProperty,
      expensesByProperty,
    };
  }
}
