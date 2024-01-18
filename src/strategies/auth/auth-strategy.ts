import { Request, Response } from "express";
import { Strategy } from "../strategy";

export abstract class AuthStrategy implements Strategy {
  name: string = "authStrategy";
  async validate(request: Request, response: Response): Promise<boolean> {
    return Promise.resolve(false);
  }
}
