import cron from 'node-cron';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/services/notificationService';

// Schedule cron job to run every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily notification checks...');
  await checkLeaseExpirations();
  await checkOverduePayments();
  await checkDocumentExpirations();
});

async function checkLeaseExpirations() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingLeases = await prisma.lease.findMany({
    where: {
      endDate: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
    include: {
      tenant: true,
      unit: {
        include: {
          property: true,
        },
      },
    },
  });

  for (const lease of upcomingLeases) {
    const subject = `Lease Expiration Reminder`;
    const text = `Dear ${lease.tenant.name}, your lease for unit ${lease.unit.name} at ${lease.unit.property.name} is expiring on ${lease.endDate.toLocaleDateString()}.`;
    const html = `<p>Dear ${lease.tenant.name},</p><p>Your lease for unit ${lease.unit.name} at ${lease.unit.property.name} is expiring on <strong>${lease.endDate.toLocaleDateString()}</strong>.</p>`;
    await sendEmail(lease.tenant.email, subject, text, html);
  }
}

async function checkOverduePayments() {
  const today = new Date();

  const overduePayments = await prisma.payment.findMany({
    where: {
      status: 'NOT_PAID',
      lease: {
        endDate: {
          gte: today,
        },
      },
    },
    include: {
      lease: {
        include: {
          tenant: true,
          unit: {
            include: {
              property: true,
            },
          },
        },
      },
    },
  });

  for (const payment of overduePayments) {
    const subject = `Overdue Payment Reminder`;
    const text = `Dear ${payment.lease.tenant.name}, your payment of $${payment.amount} for unit ${payment.lease.unit.name} at ${payment.lease.unit.property.name} is overdue.`;
    const html = `<p>Dear ${payment.lease.tenant.name},</p><p>Your payment of <strong>$${payment.amount}</strong> for unit ${payment.lease.unit.name} at ${payment.lease.unit.property.name} is overdue.</p>`;
    await sendEmail(payment.lease.tenant.email, subject, text, html);
  }
}

async function checkDocumentExpirations() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingDocuments = await prisma.document.findMany({
    where: {
      expiresAt: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
    include: {
      lease: {
        include: {
          tenant: true,
        },
      },
    },
  });

  for (const doc of upcomingDocuments) {
    if (doc.expiresAt) {
      const subject = `Document Expiration Reminder`;
      const text = `Dear ${doc.lease.tenant.name}, your document \"${doc.name}\" is expiring on ${doc.expiresAt.toLocaleDateString()}.`;
      const html = `<p>Dear ${doc.lease.tenant.name},</p><p>Your document \"<strong>${doc.name}</strong>\" is expiring on <strong>${doc.expiresAt.toLocaleDateString()}</strong>.</p>`;
      await sendEmail(doc.lease.tenant.email, subject, text, html);
    }
  }
}
