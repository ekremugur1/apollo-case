import dotenv from "dotenv";
import { injectable } from "tsyringe";

dotenv.config();

@injectable()
export class ConfigService {
  setTimezone(timezone: string) {
    process.env.TZ = timezone;
  }

  get<T>(key: string, defaultValue?: T): T {
    if (!(key in process.env)) {
      if (arguments.length > 1) {
        return defaultValue as T;
      }

      throw new Error(
        `ConfigService could not find a matching value for key ${key}`
      );
    }

    return process.env[key] as T;
  }
}
