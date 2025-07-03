import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// System settings management
export interface SystemSettings {
  gracePeriodDays: number;
  lateFeeAmount: number;
  lateFeePercentage: number;
  reminderDaysBefore: number;
  autoGenerateInvoices: boolean;
  defaultCurrency: string;
  dateFormat: string;
  timeZone: string;
  maintenanceMode: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  maxFileUploadSize: number; // in MB
  allowedFileTypes: string[];
}

const defaultSettings: SystemSettings = {
  gracePeriodDays: 5,
  lateFeeAmount: 50,
  lateFeePercentage: 5,
  reminderDaysBefore: 3,
  autoGenerateInvoices: true,
  defaultCurrency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeZone: 'UTC',
  maintenanceMode: false,
  backupFrequency: 'daily',
  maxFileUploadSize: 10,
  allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
};

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: SystemSettings = defaultSettings;
  
  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }
  
  async loadSettings(): Promise<SystemSettings> {
    try {
      // In a real implementation, load from database
      // For now, return defaults
      return this.settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return defaultSettings;
    }
  }
  
  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    this.settings = { ...this.settings, ...updates };
    
    // In a real implementation, save to database
    console.log('Settings updated:', updates);
    
    return this.settings;
  }
  
  getSetting<K extends keyof SystemSettings>(key: K): SystemSettings[K] {
    return this.settings[key];
  }
}

// Notification system
export interface Notification {
  id: string;
  type: 'payment_due' | 'payment_overdue' | 'lease_expiring' | 'maintenance_due' | 'document_expiring';
  title: string;
  message: string;
  recipientId: string;
  recipientType: 'tenant' | 'landlord';
  scheduledDate: Date;
  sentDate?: Date;
  status: 'pending' | 'sent' | 'failed';
  metadata?: Record<string, any>;
}

export class NotificationManager {
  private static instance: NotificationManager;
  public notifications: Notification[] = [];  // Made public for external access
  
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
  
  async schedulePaymentReminder(leaseId: string, amount: number, dueDate: Date): Promise<void> {
    const settings = await SettingsManager.getInstance().loadSettings();
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - settings.reminderDaysBefore);
    
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { tenant: true, unit: { include: { property: true } } }
    });
    
    if (!lease) return;
    
    const notification: Notification = {
      id: `payment_reminder_${leaseId}_${Date.now()}`,
      type: 'payment_due',
      title: 'Payment Reminder',
      message: `Your rent payment of $${amount} is due on ${dueDate.toLocaleDateString()}`,
      recipientId: lease.tenant.id,
      recipientType: 'tenant',
      scheduledDate: reminderDate,
      status: 'pending',
      metadata: {
        leaseId,
        amount,
        dueDate: dueDate.toISOString(),
        propertyName: lease.unit.property.name,
        unitName: lease.unit.name
      }
    };
    
    this.notifications.push(notification);
  }
  
  async scheduleOverdueNotification(leaseId: string, amount: number, dueDate: Date): Promise<void> {
    const settings = await SettingsManager.getInstance().loadSettings();
    const overdueDate = new Date(dueDate);
    overdueDate.setDate(overdueDate.getDate() + settings.gracePeriodDays);
    
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { tenant: true, unit: { include: { property: true } } }
    });
    
    if (!lease) return;
    
    const notification: Notification = {
      id: `payment_overdue_${leaseId}_${Date.now()}`,
      type: 'payment_overdue',
      title: 'Payment Overdue',
      message: `Your rent payment of $${amount} is overdue. Please pay immediately to avoid late fees.`,
      recipientId: lease.tenant.id,
      recipientType: 'tenant',
      scheduledDate: overdueDate,
      status: 'pending',
      metadata: {
        leaseId,
        amount,
        dueDate: dueDate.toISOString(),
        propertyName: lease.unit.property.name,
        unitName: lease.unit.name,
        lateFee: settings.lateFeeAmount
      }
    };
    
    this.notifications.push(notification);
  }
  
  async scheduleLeaseExpiryNotification(leaseId: string, expiryDate: Date): Promise<void> {
    const notificationDate = new Date(expiryDate);
    notificationDate.setDate(notificationDate.getDate() - 30); // 30 days before expiry
    
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { tenant: true, unit: { include: { property: true } } }
    });
    
    if (!lease) return;
    
    const notification: Notification = {
      id: `lease_expiring_${leaseId}_${Date.now()}`,
      type: 'lease_expiring',
      title: 'Lease Expiring Soon',
      message: `Your lease at ${lease.unit.property.name} - ${lease.unit.name} expires on ${expiryDate.toLocaleDateString()}`,
      recipientId: lease.tenant.id,
      recipientType: 'tenant',
      scheduledDate: notificationDate,
      status: 'pending',
      metadata: {
        leaseId,
        expiryDate: expiryDate.toISOString(),
        propertyName: lease.unit.property.name,
        unitName: lease.unit.name
      }
    };
    
    this.notifications.push(notification);
  }
  
  async processPendingNotifications(): Promise<void> {
    const now = new Date();
    const pendingNotifications = this.notifications.filter(
      n => n.status === 'pending' && n.scheduledDate <= now
    );
    
    for (const notification of pendingNotifications) {
      try {
        await this.sendNotification(notification);
        notification.status = 'sent';
        notification.sentDate = new Date();
      } catch (error) {
        console.error('Failed to send notification:', error);
        notification.status = 'failed';
      }
    }
  }
  
  private async sendNotification(notification: Notification): Promise<void> {
    // In a real implementation, this would send email, SMS, or push notification
    console.log('Sending notification:', notification);
    
    // For now, just log the notification
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // or push notification service (Firebase, Pusher, etc.)
  }
  
  getPendingNotifications(): Notification[] {
    return this.notifications.filter(n => n.status === 'pending');
  }
  
  getNotificationHistory(limit: number = 100): Notification[] {
    return this.notifications
      .filter(n => n.status === 'sent')
      .sort((a, b) => (b.sentDate?.getTime() || 0) - (a.sentDate?.getTime() || 0))
      .slice(0, limit);
  }
}

// Document expiry tracking
export class DocumentTracker {
  private static instance: DocumentTracker;
  
  static getInstance(): DocumentTracker {
    if (!DocumentTracker.instance) {
      DocumentTracker.instance = new DocumentTracker();
    }
    return DocumentTracker.instance;
  }
  
  async getExpiringDocuments(daysBefore: number = 30): Promise<any[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysBefore);
    
    return await prisma.document.findMany({
      where: {
        expiresAt: {
          lte: thresholdDate,
          gte: new Date()
        }
      },
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
      }
    });
  }
  
  async getExpiredDocuments(): Promise<any[]> {
    return await prisma.document.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      },
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
      }
    });
  }
  
  async scheduleDocumentExpiryNotifications(): Promise<void> {
    const expiringDocuments = await this.getExpiringDocuments();
    const notificationManager = NotificationManager.getInstance();
    
    for (const doc of expiringDocuments) {
      if (doc.expiresAt) {
        const notification: Notification = {
          id: `document_expiring_${doc.id}_${Date.now()}`,
          type: 'document_expiring',
          title: 'Document Expiring Soon',
          message: `Document "${doc.name}" expires on ${doc.expiresAt.toLocaleDateString()}`,
          recipientId: doc.lease.tenant.id,
          recipientType: 'tenant',
          scheduledDate: new Date(doc.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
          status: 'pending',
          metadata: {
            documentId: doc.id,
            documentName: doc.name,
            expiryDate: doc.expiresAt.toISOString(),
            propertyName: doc.lease.unit.property.name,
            unitName: doc.lease.unit.name
          }
        };
        
        notificationManager.notifications.push(notification);
      }
    }
  }
}

// Background job scheduler
export class JobScheduler {
  private static instance: JobScheduler;
  private jobs: Map<string, { fn: () => Promise<void>; interval: number; lastRun: Date }> = new Map();
  
  static getInstance(): JobScheduler {
    if (!JobScheduler.instance) {
      JobScheduler.instance = new JobScheduler();
    }
    return JobScheduler.instance;
  }
  
  scheduleJob(name: string, fn: () => Promise<void>, intervalMinutes: number): void {
    this.jobs.set(name, {
      fn,
      interval: intervalMinutes * 60 * 1000,
      lastRun: new Date(0)
    });
  }
  
  async runScheduledJobs(): Promise<void> {
    const now = new Date();
    
    this.jobs.forEach(async (job, name) => {
      if (now.getTime() - job.lastRun.getTime() >= job.interval) {
        try {
          console.log(`Running scheduled job: ${name}`);
          await job.fn();
          job.lastRun = now;
        } catch (error) {
          console.error(`Job ${name} failed:`, error);
        }
      }
    });
  }
  
  async startScheduler(): Promise<void> {
    // Set up default jobs
    this.scheduleJob('process_notifications', async () => {
      await NotificationManager.getInstance().processPendingNotifications();
    }, 5); // Every 5 minutes
    
    this.scheduleJob('check_document_expiry', async () => {
      await DocumentTracker.getInstance().scheduleDocumentExpiryNotifications();
    }, 60); // Every hour
    
    // Run scheduler every minute
    setInterval(async () => {
      await this.runScheduledJobs();
    }, 60000);
    
    console.log('Job scheduler started');
  }
}

// Initialize background services
export async function initializeBackgroundServices(): Promise<void> {
  const scheduler = JobScheduler.getInstance();
  await scheduler.startScheduler();
  
  console.log('Background services initialized');
}
