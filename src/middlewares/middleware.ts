import { NextFunction, Request, Response } from "express";

export interface Middleware {
  handleRequest: (
    request: Request,
    response: Response,
    next: NextFunction
  ) => void;
}

export interface ErrorMiddleware {
  handleRequest: (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
  ) => void;
}
