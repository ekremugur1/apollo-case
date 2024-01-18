import { container, inject, singleton } from "tsyringe";
import { DataSource } from "typeorm";
import { ConfigService } from "../config/config.service";
import { getRepositoryToken } from "../helpers/token-utils";
import { Consumption } from "../record/consumption.entity";
import { Record } from "../record/record.entity";
import { Company } from "../user/company.entity";
import { User } from "../user/user.entity";

@singleton()
export class TypeORMService {
  dataSource: DataSource;
  entities: Function[] = [User, Company, Record, Consumption];

  constructor(@inject(ConfigService) private configService: ConfigService) {
    const environment = this.configService.get<string>("NODE_ENV");

    this.dataSource = new DataSource({
      type: "postgres",
      host: this.configService.get<string>("DB_HOST"),
      port: this.configService.get<number>("DB_PORT"),
      username: this.configService.get<string>("DB_USERNAME"),
      password: this.configService.get<string>("DB_PASSWORD"),
      database: this.configService.get<string>("DB_NAME"),

      synchronize: environment === "development" ? true : false,
      logging: false,
      entities: this.entities,
      migrations: [__dirname + "/migrations/*.ts"],
      subscribers: [],
    });

    this.entities.forEach((entity) => {
      const token = getRepositoryToken(entity);

      if (container.isRegistered(token)) {
        throw new Error("Repository for entity already registered");
      }

      container.register(token, {
        useValue: this.dataSource.getRepository(entity),
      });
    });
  }
}
