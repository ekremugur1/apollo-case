import { container } from "tsyringe";
import { getStrategyToken } from "../helpers/token-utils";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AuthStrategy } from "../strategies/auth/auth-strategy";

export const Auth = (authStrategy: new (...args: any[]) => AuthStrategy) => {
  if (!container.isRegistered(getStrategyToken(authStrategy))) {
    container.register(getStrategyToken(authStrategy), {
      useValue: new authStrategy(),
    });
  }

  return (target: any, propertyKey: string, decriptor: PropertyDescriptor) => {
    const middlewares =
      Reflect.getMetadata("middlewares", target, propertyKey) || [];

    Reflect.defineMetadata(
      "middlewares",
      [...middlewares, new AuthMiddleware(authStrategy).handleRequest],
      target,
      propertyKey
    );
  };
};
