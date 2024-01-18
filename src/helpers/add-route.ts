import { NextFunction, Request, Response, Router } from "express";

export type Handler = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;

export type RouteOptions = {
  method: "get" | "post" | "delete" | "patch";
  path: string;
  handlers: Handler[];
};

export const addRoute = (router: Router, options: RouteOptions) => {
  const { method, path, handlers } = options;

  switch (method.toLowerCase()) {
    case "get":
      router.get(path, ...handlers);
      break;
    case "post":
      router.post(path, ...handlers);
      break;
    case "patch":
      router.patch(path, ...handlers);
      break;
    case "delete":
      router.delete(path, ...handlers);
      break;
    default:
      console.error(`Unsupported HTTP method: ${method}`);
  }
};
