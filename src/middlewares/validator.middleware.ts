import { plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { Middleware } from "./middleware";

export class Validator implements Middleware {
  constructor(private dtoClass: new (...args: any[]) => Object) {}

  handleRequest = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const classBody = plainToClass(this.dtoClass, request.body);
      await validateOrReject(classBody);
      request.body = classBody;
      next();
    } catch (error) {
      response.status(400).send({ message: "Naughty request", status: 400 });
    }
  };
}
