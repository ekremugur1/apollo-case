import { Request, Response, Router } from "express";
import { container, injectable } from "tsyringe";
import { AuthService } from "../auth/auth.service";
import { RouteOptions, addRoute } from "../helpers/add-route";
import { attachParameter } from "../helpers/attach-parameter";
import { CustomError } from "../helpers/error-type";
import { KeyIndexPair } from "../types/param-item.type";

export const Controller = (basePath: string = "") => {
  return (target: any) => {
    injectable()(target);

    const methodNames = Object.getOwnPropertyNames(target.prototype);

    methodNames.forEach((methodName) => {
      const method = target.prototype[methodName];

      if (typeof method !== "function" || methodName === "constructor") {
        return;
      }

      const route: Omit<RouteOptions, "handler"> = Reflect.getMetadata(
        "route",
        target.prototype,
        methodName
      );

      if (route === undefined) {
        return;
      }

      if (target.prototype.router === undefined) {
        target.prototype.router = Router();
      }

      const path =
        (basePath === "" ? "" : `/${basePath}`) +
        (route.path === "" ? "" : `/${route.path}`);

      const middlewares =
        Reflect.getMetadata("middlewares", target.prototype, methodName) || [];

      const params: KeyIndexPair[] = Reflect.getMetadata(
        "params",
        target.prototype,
        methodName
      );

      const cookies: KeyIndexPair[] = Reflect.getMetadata(
        "cookies",
        target.prototype,
        methodName
      );

      const user = Reflect.getMetadata("user", target.prototype, methodName);

      const reqIndex = Reflect.getMetadata("req", target.prototype, methodName);
      const resIndex = Reflect.getMetadata("res", target.prototype, methodName);
      const bodyIndex = Reflect.getMetadata(
        "body",
        target.prototype,
        methodName
      );

      const handler = async (req: Request, res: Response) => {
        const args: any[] = [];

        if (params !== undefined) {
          params.forEach((item) => {
            attachParameter(item.index, req.params[item.key], args);
          });
        }

        if (cookies !== undefined) {
          cookies.forEach((item) => {
            attachParameter(item.index, req.cookies[item.key], args);
          });
        }

        if (resIndex !== undefined) {
          attachParameter(resIndex, res, args);
        }

        if (reqIndex !== undefined) {
          attachParameter(reqIndex, req, args);
        }

        if (bodyIndex !== undefined) {
          attachParameter(bodyIndex, req.body, args);
        }

        if (user !== undefined) {
          attachParameter(
            user,
            container
              .resolve(AuthService)
              .validate(req.cookies["access_token"]),
            args
          );
        }

        try {
          res.send(await method.call(container.resolve(target), ...args));
        } catch (e) {
          if (e instanceof CustomError) {
            return res
              .status(e.statusCode)
              .json({ message: e.message, status: e.statusCode });
          }

          return res
            .status(500)
            .json({ message: "Internal server error", status: 500 });
        }
      };

      addRoute(target.prototype.router, {
        method: route.method,
        path,
        handlers: [...middlewares, handler],
      });
    });
  };
};
