import { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";
import { UnauthorizedException } from "../helpers/error-type";
import { getStrategyToken } from "../helpers/token-utils";
import { AuthStrategy } from "../strategies/auth/auth-strategy";
import { Middleware } from "./middleware";

export class AuthMiddleware implements Middleware {
  strategy: AuthStrategy;

  constructor(authStrategy: new () => AuthStrategy) {
    this.strategy = container.resolve(getStrategyToken(authStrategy));
  }

  handleRequest = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const result = await this.strategy.validate(request, response);

    if (result) {
      return next();
    }

    next(new UnauthorizedException());
  };
}
