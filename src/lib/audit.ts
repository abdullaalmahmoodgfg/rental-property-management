import prisma from './prisma';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  ACCESS_REPORT = 'ACCESS_REPORT',
}

export async function logAudit(action: AuditAction, userId: string, details: Record<string, any>) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to log audit trail:', error);
  }
}
