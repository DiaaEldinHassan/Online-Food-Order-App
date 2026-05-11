
export abstract class AppNormalError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppNormalError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppNormalError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppNormalError {
  constructor(message: string = "Permission denied") {
    super(message, 403);
  }
}

export class NotFoundError extends AppNormalError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppNormalError {
  constructor(message: string = "Conflict occurred") {
    super(message, 409);
  }
}

export class ValidationError extends AppNormalError {
  public details: any;
  constructor(message: string, details: any) {
    super(message, 422);
    this.details = details;
  }
}
