import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { HttpError } from "../utils/httpError";

export type AuthPayload = {
  sub: string;
  email: string;
};

export type AuthedRequest = Request & { admin?: AuthPayload };

export function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    next(new HttpError(401, "Missing authorization token."));
    return;
  }
  try {
    req.admin = jwt.verify(token, config.jwtSecret) as AuthPayload;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token."));
  }
}
