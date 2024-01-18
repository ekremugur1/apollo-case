import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { inject, injectable } from "tsyringe";
import { ConfigService } from "../config/config.service";

@injectable()
export class AuthService {
  constructor(@inject(ConfigService) private configService: ConfigService) {}
  async generate(
    payload: any,
    signOptions: jwt.SignOptions = {}
  ): Promise<string> {
    return jwt.sign(
      payload,
      this.configService.get<string>("JWT_SECRET"),
      signOptions
    );
  }

  validate(token: string): Record<string, any> {
    return jwt.verify(
      token,
      this.configService.get<string>("JWT_SECRET")
    ) as Record<string, any>;
  }

  async hash(payload: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(payload, salt);
  }

  async compare(payload: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(payload, hash);
  }
}
