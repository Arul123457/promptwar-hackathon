/**
 * Centralized Error Handler Middleware
 */

export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.isPublic ? err.message : (err.message || 'Internal server error processing request.');

  res.status(statusCode).json({
    error: message,
    success: false
  });
}

export class AppError extends Error {
  constructor(message, statusCode = 400, isPublic = true) {
    super(message);
    this.statusCode = statusCode;
    this.isPublic = isPublic;
  }
}

export const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
