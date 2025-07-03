import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export interface ReportData {
  headers: string[];
  rows: any[][];
  title: string;
  subtitle?: string;
  generated: Date;
}

export class ReportGenerator {
  private static instance: ReportGenerator;
  
  static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }
  
  // Generate payment history report
  async generatePaymentReport(startDate: Date, endDate: Date, propertyId?: string): Promise<ReportData> {
    const whereClause: any = {
      paymentDate: {
        gte: startDate,
        lte: endDate
      }
    };
    
    if (propertyId) {
      whereClause.lease = {
        unit: {
          propertyId: propertyId
        }
      };
    }
    
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        lease: {
          include: {
            tenant: true,
            unit: {
              include: {
                property: true
              }
            }
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
    
    const headers = [
      'Payment Date',
      'Property',
      'Unit',
      'Tenant',
      'Amount',
      'Status',
      'Notes'
    ];
    
    const rows = (payments as any[]).map((payment) => [
      payment.paymentDate.toLocaleDateString(),
      payment.lease.unit.property.name,
      payment.lease.unit.name,
      payment.lease.tenant.name,
      `$${payment.amount.toFixed(2)}`,
      payment.status,
      payment.collectorNotes || ''
    ]);
    
    return {
      headers,
      rows,
      title: 'Payment History Report',
      subtitle: `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      generated: new Date()
    };
  }
  
  // Generate occupancy report
  async generateOccupancyReport(): Promise<ReportData> {
    const properties = await prisma.property.findMany({
      include: {
        units: {
          include: {
            leases: {
              where: {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
              },
              include: {
                tenant: true
              }
            }
          }
        }
      }
    });

    // type OccupancyProperty = Prisma.PropertyGetPayload<{ 
    //     include: { 
    //         units: { 
    //             include: { 
    //                 leases: { 
    //                     include: { tenant: true } 
    //                 } 
    //             } 
    //         } 
    //     } 
    // }>;

    const headers = [
      'Property',
      'Total Units',
      'Occupied Units',
      'Vacant Units',
      'Occupancy Rate'
    ];

    const rows: any[][] = [];
    (properties as any[]).forEach((property) => {
      let occupiedUnits = 0;
      property.units.forEach((unit: any) => {
        if (unit.leases.length > 0) {
          occupiedUnits++;
        }
      });
      const totalUnits = property.units.length;
      const vacantUnits = totalUnits - occupiedUnits;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      rows.push([
        property.name,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        `${occupancyRate.toFixed(2)}%`
      ]);
    });

    return {
      headers,
      rows,
      title: 'Occupancy Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      generated: new Date()
    };
  }
  
  // Generate expense report
  async generateExpenseReport(startDate: Date, endDate: Date, propertyId?: string): Promise<ReportData> {
    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
    
    if (propertyId) {
      whereClause.propertyId = propertyId;
    }
    
    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        property: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    const headers = [
      'Date',
      'Property',
      'Category',
      'Description',
      'Amount'
    ];
    
    const rows = (expenses as any[]).map((expense) => [
      expense.date.toLocaleDateString(),
      expense.property.name,
      expense.category,
      expense.description || '',
      `$${expense.amount.toFixed(2)}`
    ]);
    
    return {
      headers,
      rows,
      title: 'Expense Report',
      subtitle: `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      generated: new Date()
    };
  }
  
  // Generate financial summary
  async generateFinancialSummary(startDate: Date, endDate: Date, propertyId?: string): Promise<ReportData> {
    // Get total income
    const paymentWhereClause: any = {
      paymentDate: {
        gte: startDate,
        lte: endDate
      }
    };
    
    if (propertyId) {
      paymentWhereClause.lease = {
        unit: {
          propertyId: propertyId
        }
      };
    }
    
    const payments = await prisma.payment.findMany({
      where: paymentWhereClause,
      select: { amount: true, status: true }
    });
    
    const totalIncome = (payments as any[]).reduce((sum: number, payment) => sum + payment.amount, 0);
    
    // Get total expenses
    const expenseWhereClause: any = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };
    
    if (propertyId) {
      expenseWhereClause.propertyId = propertyId;
    }
    
    const expenses = await prisma.expense.findMany({
      where: expenseWhereClause,
      select: { amount: true, category: true }
    });
    
    const totalExpenses = (expenses as any[]).reduce((sum: number, expense) => sum + expense.amount, 0);
    
    // Group expenses by category
    const expensesByCategory = (expenses as any[]).reduce((acc: any, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});
    
    const headers = [
      'Category',
      'Amount'
    ];
    
    const rows = [
      ['Total Income', `$${totalIncome.toFixed(2)}`],
      ['Total Expenses', `$${totalExpenses.toFixed(2)}`],
      ['Net Income', `$${(totalIncome - totalExpenses).toFixed(2)}`],
      ['', ''], // Empty row
      ['Expense Breakdown:', ''],
      ...Object.entries(expensesByCategory).map(([category, amount]) => [
        category,
        `$${(amount as number).toFixed(2)}`
      ])
    ];
    
    return {
      headers,
      rows,
      title: 'Financial Summary',
      subtitle: `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      generated: new Date()
    };
  }
  
  // Generate financial statement
  async generateFinancialStatement(startDate: Date, endDate: Date, propertyId?: string): Promise<ReportData> {
    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (propertyId) {
      whereClause.propertyId = propertyId;
    }

    const payments = await prisma.payment.findMany({ where: whereClause });
    const expenses = await (prisma as any).expense.findMany({ where: whereClause });

    const totalIncome = (payments as any[]).reduce((sum: number, payment) => sum + payment.amount, 0);
    const totalExpenses = (expenses as any[]).reduce((sum: number, expense) => sum + expense.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    const headers = ['Category', 'Amount'];
    const rows = [
      ['Total Income', `$${totalIncome.toFixed(2)}`],
      ['Total Expenses', `$${totalExpenses.toFixed(2)}`],
      ['Net Income', `$${netIncome.toFixed(2)}`]
    ];

    return {
      headers,
      rows,
      title: 'Financial Statement',
      subtitle: `From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      generated: new Date()
    };
  }
  
  // Generate rent roll report
  async generateRentRollReport(propertyId: string): Promise<ReportData> {
    const leases = await prisma.lease.findMany({
      where: {
        unit: {
          propertyId: propertyId,
        },
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        unit: {
          include: {
            property: true,
          },
        },
        tenant: true,
      },
      orderBy: { unit: { name: 'asc' } },
    });

    const headers = [
      'Property',
      'Unit',
      'Tenant',
      'Lease Start Date',
      'Lease End Date',
      'Rent Amount',
      'Deposit'
    ];

    const rows = (leases as any[]).map(lease => [
      lease.unit.property.name,
      lease.unit.name,
      lease.tenant.name,
      lease.startDate.toLocaleDateString(),
      lease.endDate.toLocaleDateString(),
      `$${lease.rentAmount.toFixed(2)}`,
      `$${lease.deposit ? lease.deposit.toFixed(2) : 'N/A'}`
    ]);

    return {
      headers,
      rows,
      title: 'Rent Roll Report',
      subtitle: `As of ${new Date().toLocaleDateString()}`,
      generated: new Date()
    };
  }
  
  // Generate lease expirations report
  async generateLeaseExpirationsReport(withinDays: number): Promise<ReportData> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + withinDays);

    const leases = await prisma.lease.findMany({
      where: {
        endDate: {
          lte: expirationDate
        }
      },
      include: {
        unit: {
          include: {
            property: true
          }
        },
        tenant: true
      },
      orderBy: { endDate: 'asc' }
    });

    const headers = [
      'Property',
      'Unit',
      'Tenant',
      'Lease Start Date',
      'Lease End Date',
      'Contact'
    ];

    const rows = (leases as any[]).map(lease => [
      lease.unit.property.name,
      lease.unit.name,
      lease.tenant.name,
      lease.startDate.toLocaleDateString(),
      lease.endDate.toLocaleDateString(),
      lease.tenant.phone || lease.tenant.email
    ]);

    return {
      headers,
      rows,
      title: 'Lease Expirations Report',
      subtitle: `By ${expirationDate.toLocaleDateString()}`,
      generated: new Date()
    };
  }
  
  // Generate tenant directory report
  async generateTenantDirectoryReport(propertyId?: string): Promise<ReportData> {
    const whereClause: any = {};
    
    if (propertyId) {
      whereClause.propertyId = propertyId;
    }
    
    const tenants = await prisma.tenant.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    const headers = ['Name', 'Email', 'Phone', 'Emergency Contact'];
    const rows = (tenants as any[]).map(tenant => [
      tenant.name,
      tenant.email,
      tenant.phone,
      `${tenant.emergencyContactName} (${tenant.emergencyContactPhone})`
    ]);

    return {
      headers,
      rows,
      title: 'Tenant Directory Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      generated: new Date()
    };
  }
  
  // Generate performance dashboard
  async generatePerformanceDashboard(propertyId?: string): Promise<ReportData> {
    const whereClause: any = {};
    
    if (propertyId) {
      whereClause.propertyId = propertyId;
    }
    
    const payments = await prisma.payment.findMany({
      where: whereClause
    });

    const totalRevenue = (payments as any[]).reduce((sum: number, payment) => sum + payment.amount, 0);
    const occupiedUnits = await prisma.unit.count({ where: { propertyId: propertyId, leases: { some: { startDate: { lte: new Date() }, endDate: { gte: new Date() } } } } });
    const totalUnits = await prisma.unit.count({ where: { propertyId: propertyId } });
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    const onTimePayments = (payments as any[]).filter(p => p.status === 'PAID').length;
    const partialPayments = (payments as any[]).filter(p => p.status === 'PARTIALLY_PAID').length;
    const latePayments = (payments as any[]).filter(p => p.status === 'NOT_PAID').length;
    const totalPayments = payments.length;
    const onTimePaymentRate = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 0;

    const maintenanceRequests = await prisma.inspection.count({
      where: {
        ...(propertyId ? { propertyId } : {}),
        // Remove status: 'PENDING' as it does not exist in the schema
      },
    });

    const headers = [
      'Metric',
      'Value'
    ];

    const rows = [
      ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
      ['Occupied Units', occupiedUnits],
      ['Total Units', totalUnits],
      ['Occupancy Rate', `${occupancyRate.toFixed(2)}%`],
      ['On-time Payment Rate', `${onTimePaymentRate.toFixed(2)}%`],
      ['Pending Maintenance Requests', maintenanceRequests]
    ];

    return {
      headers,
      rows,
      title: 'Performance Dashboard',
      subtitle: `As of ${new Date().toLocaleDateString()}`,
      generated: new Date()
    };
  }
}

// CSV Export functionality
export class CSVExporter {
  static exportToCSV(data: ReportData): string {
    const csvContent = [
      // Title and metadata
      [data.title],
      data.subtitle ? [data.subtitle] : [],
      [`Generated: ${data.generated.toLocaleString()}`],
      [], // Empty row
      // Headers
      data.headers,
      // Data rows
      ...data.rows
    ].filter(row => row.length > 0)
     .map(row => row.map(field => {
       // Escape quotes and wrap in quotes if contains comma
       const escaped = String(field).replace(/"/g, '""');
       return escaped.includes(',') ? `"${escaped}"` : escaped;
     }).join(','))
     .join('\n');
    
    return csvContent;
  }
  
  static createCSVResponse(data: ReportData, filename: string): NextResponse {
    const csvContent = this.exportToCSV(data);
    
    const response = new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`
      }
    });
    
    return response;
  }
}

// Analytics and insights
export class AnalyticsEngine {
  private static instance: AnalyticsEngine;
  
  static getInstance(): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine();
    }
    return AnalyticsEngine.instance;
  }
  
  // Calculate key performance indicators
  async calculateKPIs(startDate: Date, endDate: Date): Promise<any> {
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true
              }
            }
          }
        }
      }
    });
    
    const totalProperties = await prisma.property.count();
    const totalUnits = await prisma.unit.count();
    const totalTenants = await prisma.tenant.count();
    
    // Calculate occupancy rate
    const occupiedUnits = await prisma.unit.count({
      where: {
        leases: {
          some: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          }
        }
      }
    });
    
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    // Calculate payment metrics
    const totalRevenue = (payments as any[]).reduce((sum: number, payment) => sum + payment.amount, 0);
    const avgPaymentAmount = payments.length > 0 ? totalRevenue / payments.length : 0;
    
    const onTimePayments = (payments as any[]).filter(p => p.status === 'PAID').length;
    const partialPayments = (payments as any[]).filter(p => p.status === 'PARTIALLY_PAID').length;
    const latePayments = (payments as any[]).filter(p => p.status === 'NOT_PAID').length;
    
    const paymentSuccessRate = payments.length > 0 ? (onTimePayments / payments.length) * 100 : 0;
    
    return {
      totalProperties,
      totalUnits,
      totalTenants,
      occupancyRate,
      totalRevenue,
      avgPaymentAmount,
      paymentSuccessRate,
      paymentBreakdown: {
        onTime: onTimePayments,
        partial: partialPayments,
        late: latePayments
      }
    };
  }
  
  // Generate insights
  async generateInsights(startDate: Date, endDate: Date): Promise<string[]> {
    const kpis = await this.calculateKPIs(startDate, endDate);
    const insights: string[] = [];
    
    // Occupancy insights
    if (kpis.occupancyRate < 80) {
      insights.push(`Occupancy rate is ${kpis.occupancyRate.toFixed(1)}% - consider marketing efforts to fill vacant units`);
    } else if (kpis.occupancyRate >= 95) {
      insights.push(`Excellent occupancy rate of ${kpis.occupancyRate.toFixed(1)}% - consider expanding your portfolio`);
    }
    
    // Payment insights
    if (kpis.paymentSuccessRate < 70) {
      insights.push(`Payment success rate is ${kpis.paymentSuccessRate.toFixed(1)}% - consider reviewing payment policies`);
    }
    
    if (kpis.paymentBreakdown.partial > kpis.paymentBreakdown.onTime) {
      insights.push('High number of partial payments - consider offering payment plans or investigating tenant financial difficulties');
    }
    
    // Revenue insights
    if (kpis.totalRevenue > 0) {
      insights.push(`Average payment amount is $${kpis.avgPaymentAmount.toFixed(2)}`);
    }
    
    if (insights.length === 0) {
      insights.push('Your property management metrics are looking good!');
    }
    
    return insights;
  }
}
