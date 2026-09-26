import { NextFunction, Request, Response } from "express";
import { ApiResponseHelper } from "../utils/api-response";
import { HttpError } from "../utils/httpError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    ApiResponseHelper.error(res, err.message, err.status);
    return;
  }
  const message = err instanceof Error ? err.message : "Unexpected error.";
  ApiResponseHelper.error(res, message, 500);
}
