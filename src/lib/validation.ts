import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone format').optional();
export const amountSchema = z.number().positive('Amount must be positive');
export const dateSchema = z.string().datetime('Invalid date format');
export const idSchema = z.string().min(1, 'ID is required');

// Entity validation schemas
export const propertySchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters')
    .max(100, 'Property name cannot exceed 100 characters')
    .trim(),
  address: z.string().min(5, 'Address must be at least 5 characters')
    .max(200, 'Address cannot exceed 200 characters')
    .trim(),
});

export const tenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: emailSchema,
  phone: phoneSchema,
});

export const leaseSchema = z.object({
  unitId: idSchema,
  tenantId: idSchema,
  startDate: dateSchema,
  endDate: dateSchema,
  rentAmount: amountSchema,
});

export const paymentSchema = z.object({
  leaseId: idSchema,
  amount: amountSchema,
  paymentDate: dateSchema,
  status: z.enum(['FULL', 'PARTIAL', 'NOT_PAID', 'OVERPAID']),
  collectorNotes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const utilityReadingSchema = z.object({
  providerId: idSchema,
  reading: z.number().min(0, 'Reading cannot be negative'),
  readingDate: dateSchema,
  photoUrl: z.string().url('Invalid photo URL').optional(),
});

export const expenseSchema = z.object({
  propertyId: idSchema,
  category: z.string().min(2, 'Category must be at least 2 characters')
    .max(50, 'Category cannot exceed 50 characters')
    .trim(),
  amount: amountSchema,
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  date: dateSchema,
});

export const inspectionSchema = z.object({
  propertyId: idSchema,
  checklistId: idSchema,
  inspectionDate: dateSchema,
  results: z.record(z.any()), // JSON object
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
});

// Sanitization helpers
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '');
}

export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Validation wrapper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessages };
    }
    return { success: false, error: 'Invalid input data' };
  }
}
