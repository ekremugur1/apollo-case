import cookieParser from "cookie-parser";
import express, { Express, Router } from "express";
import { inject, singleton } from "tsyringe";
import { ConfigService } from "../config/config.service";
import { TypeORMService } from "../database/typeorm.service";
import { ErrorBoundary } from "../middlewares/error.middleware";
import { RecordController } from "../record/record.controller";
import { UserController } from "../user/user.controller";

@singleton()
export class AppModule {
  constructor(
    @inject(ConfigService) private configService: ConfigService,
    @inject(TypeORMService) private typeORMService: TypeORMService,
    @inject(UserController) private userController: UserController,
    @inject(RecordController) private recordController: RecordController
  ) {
    this.configService.setTimezone("UTC");
  }

  async bootstrap() {
    const app: Express = express();
    const port = this.configService.get<number>("PORT");

    app.use(express.json());
    app.use(cookieParser());

    app.use(
      (this.userController as UserController & { router: Router }).router
    );

    app.use(
      (this.recordController as RecordController & { router: Router }).router
    );

    app.use(new ErrorBoundary().handleRequest);

    await this.typeORMService.dataSource.initialize();

    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  }
}
