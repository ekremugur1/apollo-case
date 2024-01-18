import { Type } from "class-transformer";
import { IsDate, IsNumber } from "class-validator";

export class CreateRecordDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  value: number;
}
