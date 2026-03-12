import { Elysia } from "elysia";
import { logger } from "#/lib/logger";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  ({ error, set }) => {
    if (error instanceof ApiError) {
      set.status = error.statusCode;
      return {
        error: {
          message: error.message,
          code: error.code ?? "ERROR",
          statusCode: error.statusCode,
        },
      };
    }

    // Elysia validation errors
    if (error.code === "VALIDATION") {
      set.status = 422;
      return {
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          statusCode: 422,
          details: error.all,
        },
      };
    }

    // NOT_FOUND
    if (error.code === "NOT_FOUND") {
      set.status = 404;
      return {
        error: {
          message: "Not found",
          code: "NOT_FOUND",
          statusCode: 404,
        },
      };
    }

    logger.error("Unhandled error:", error);
    set.status = 500;
    return {
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        statusCode: 500,
      },
    };
  },
);
