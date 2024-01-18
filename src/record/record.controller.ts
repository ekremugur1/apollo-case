import { inject } from "tsyringe";
import { AuthTokenContent } from "../auth/types/token-types";
import { Auth } from "../decorators/auth.decorator";
import { Body } from "../decorators/body.decorator";
import { Controller } from "../decorators/controller.decorator";
import { Delete } from "../decorators/delete.decorator";
import { Get } from "../decorators/get.decorator";
import { Param } from "../decorators/param.decorator";
import { Post } from "../decorators/post.decorator";
import { User } from "../decorators/user.decorator";
import { JwtStrategy } from "../strategies/auth/jwt.strategy";
import { CreateRecordDto } from "./dto/create-record.dto";
import { RecordService } from "./record.service";

@Controller("records")
export class RecordController {
  constructor(@inject(RecordService) private recordService: RecordService) {}

  @Auth(JwtStrategy)
  @Post()
  async createRecord(
    @User() user: AuthTokenContent,
    @Body() createRecordDto: CreateRecordDto
  ) {
    return await this.recordService.createRecord(user, createRecordDto);
  }

  @Auth(JwtStrategy)
  @Get("consumptions")
  async getConsumptions(@User() user: AuthTokenContent) {
    return await this.recordService.getConsumptions(user);
  }

  @Auth(JwtStrategy)
  @Get()
  async getRecords(@User() user: AuthTokenContent) {
    return await this.recordService.getRecords(user);
  }

  @Auth(JwtStrategy)
  @Delete(":id")
  async deleteRecord(
    @Param("id") recordId: number,
    @User() user: AuthTokenContent
  ) {
    return await this.recordService.deleteRecord(recordId, user);
  }
}
