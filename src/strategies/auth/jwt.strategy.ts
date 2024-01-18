import { Request, Response } from "express";
import { container } from "tsyringe";
import { AuthService } from "../../auth/auth.service";
import { UserService } from "../../user/user.service";
import { Strategy } from "../strategy";
import { AuthStrategy } from "./auth-strategy";

export class JwtStrategy implements AuthStrategy, Strategy {
  name: string = "JwtStrategy";
  authService: AuthService;

  constructor() {
    this.authService = container.resolve(AuthService);
  }

  async validate(request: Request, response: Response): Promise<boolean> {
    const token = request.cookies["access_token"];

    try {
      this.authService.validate(token);
      return true;
    } catch (error) {
      const refresh_token = request.cookies["refresh_token"];
      try {
        await container
          .resolve(UserService)
          .refresh(refresh_token, request, response);
        return true;
      } catch (error) {
        return false;
      }
    }
  }
}
