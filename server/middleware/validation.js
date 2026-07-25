import { z } from 'zod';
import { AppError } from './errorHandler.js';

export const schemas = {
  register: z.object({
    email: z.string().email('Invalid email address format.'),
    password: z.string().min(6, 'Password must be at least 6 characters.')
  }),

  login: z.object({
    email: z.string().email('Invalid email address format.'),
    password: z.string().min(1, 'Password is required.')
  }),

  onboarding: z.object({
    userId: z.string().min(1, 'userId is required.'),
    email: z.string().optional(),
    triggers: z.string().optional(),
    copingStrategies: z.string().optional(),
    personaTone: z.string().optional(),
    emergencyContact: z.string().optional()
  }),

  crisis: z.object({
    userId: z.string().min(1, 'userId is required for crisis logging.'),
    text: z.string().optional(),
    type: z.string().optional()
  }),

  pulse: z.object({
    userId: z.string().min(1, 'userId is required for pulse check.'),
    score: z.number().int().min(1).max(5, 'Score must be an integer between 1 and 5.'),
    voiceNote: z.string().optional()
  }),

  invite: z.object({
    userId: z.string().min(1, 'userId is required to generate invite.')
  }),

  caregiverTip: z.object({
    userId: z.string().min(1, 'userId is required for caregiver tips.'),
    query: z.string().optional()
  }),

  learnQuery: z.object({
    query: z.string().optional()
  })
};

/**
 * Middleware factory for validating request body against a Zod schema
 * @param {z.ZodSchema} schema 
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      const errorMessage = issue ? `${issue.path.join('.') || 'body'}: ${issue.message}` : 'Invalid request payload';
      return next(new AppError(errorMessage, 400, true));
    }
    req.validatedBody = result.data;
    next();
  };
}
