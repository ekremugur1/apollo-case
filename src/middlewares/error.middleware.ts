import { NextFunction, Request, Response } from "express";
import { CustomError } from "../helpers/error-type";
import { ErrorMiddleware } from "./middleware";

export class ErrorBoundary implements ErrorMiddleware {
  handleRequest = async (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    if (error instanceof CustomError) {
      return response
        .status(error.statusCode)
        .json({ message: error.message, status: error.statusCode });
    }

    return response.status(500).send({ message: error.message, status: 500 });
  };
}
