import { addDays, differenceInCalendarDays } from "date-fns";
import { injectable } from "tsyringe";
import { LessThan, MoreThan, Repository } from "typeorm";
import { AuthTokenContent } from "../auth/types/token-types";
import { InjectRepository } from "../decorators/inject-repository.decorator";
import { BadRequestException } from "../helpers/error-type";
import { Consumption } from "./consumption.entity";
import { CreateRecordDto } from "./dto/create-record.dto";
import { Record } from "./record.entity";

@injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record) private recordRepository: Repository<Record>,
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>
  ) {}

  async deleteRecord(recordId: number, user: AuthTokenContent) {
    const { company_id } = user;

    const record = await this.recordRepository.findOneBy({
      id: recordId,
      company_id,
    });

    if (!record) {
      throw new BadRequestException();
    }

    const [previousRecord] = await this.recordRepository.find({
      where: {
        date: LessThan(record.date),
        company_id,
      },
      order: {
        date: "DESC",
      },
      take: 1,
    });

    const [nextRecord] = await this.recordRepository.find({
      where: {
        date: MoreThan(record.date),
        company_id,
      },
      order: {
        date: "ASC",
      },
      take: 1,
    });

    if (previousRecord && nextRecord) {
      await this.updateInbetween(previousRecord, nextRecord, company_id);
    } else if (previousRecord) {
      await this.removeInbetween(previousRecord, record, company_id);
    } else if (nextRecord) {
      await this.removeInbetween(record, nextRecord, company_id);
    }

    return await this.recordRepository.remove(record);
  }

  async getConsumptions(user: AuthTokenContent) {
    return await this.consumptionRepository.findBy({
      company_id: user.company_id,
    });
  }

  async getRecords(user: AuthTokenContent) {
    return await this.recordRepository.findBy({ company_id: user.company_id });
  }

  async createRecord(user: AuthTokenContent, createRecordDto: CreateRecordDto) {
    if (createRecordDto.date > new Date()) {
      throw new BadRequestException("Cannot create a record in the future");
    }

    const { company_id: companyId } = user;

    const existingRecord = await this.recordRepository.findOne({
      where: {
        date: createRecordDto.date,
        company_id: companyId,
      },
    });

    if (existingRecord) {
      throw new BadRequestException(
        "The date you provided already has a record"
      );
    }

    const record = await this.recordRepository.save({
      ...createRecordDto,
      company_id: user.company_id,
      user_id: user.user_id,
    });

    const [previousRecord] = await this.recordRepository.find({
      where: {
        date: LessThan(record.date),
        company_id: companyId,
      },
      order: {
        date: "DESC",
      },
      take: 1,
    });

    const [nextRecord] = await this.recordRepository.find({
      where: {
        date: MoreThan(record.date),
        company_id: companyId,
      },
      order: {
        date: "ASC",
      },
      take: 1,
    });

    if (previousRecord && !nextRecord) {
      await this.fillInbetween(previousRecord, record, companyId);
    }

    if (!previousRecord && nextRecord) {
      await this.fillInbetween(record, nextRecord, companyId);
    }

    if (previousRecord && nextRecord) {
      await this.updateInbetween(previousRecord, record, companyId);
      await this.updateInbetween(record, nextRecord, companyId);
    }

    return record;
  }

  updateInbetween = async (
    previousRecord: Record,
    nextRecord: Record,
    companyId: number
  ) => {
    const daysBetween = differenceInCalendarDays(
      nextRecord.date,
      previousRecord.date
    );
    const startDate = previousRecord.date;
    const endDate = nextRecord.date;
    const avgConsumption =
      (nextRecord.value - previousRecord.value) / daysBetween;

    await this.consumptionRepository
      .createQueryBuilder()
      .update()
      .set({ value: avgConsumption })
      .where("company_id = :companyId", { companyId })
      .andWhere("date >= :startDate AND date < :endDate", {
        startDate,
        endDate,
      })
      .execute();
  };

  fillInbetween = async (
    previousRecord: Record,
    nextRecord: Record,
    companyId: number
  ) => {
    const daysBetween = differenceInCalendarDays(
      nextRecord.date,
      previousRecord.date
    );

    const startDate = previousRecord.date;
    const avgConsumption =
      (nextRecord.value - previousRecord.value) / daysBetween;

    const rowsToInsert = Array.from({ length: daysBetween }, (_, i) => ({
      date: addDays(startDate, i),
      value: avgConsumption,
      company_id: companyId,
    }));

    await this.consumptionRepository
      .createQueryBuilder()
      .insert()
      .values(rowsToInsert)
      .execute();
  };

  removeInbetween = async (
    previousRecord: Record,
    nextRecord: Record,
    companyId: number
  ) => {
    const daysBetween = differenceInCalendarDays(
      nextRecord.date,
      previousRecord.date
    );
    const startDate = previousRecord.date;
    const endDate = nextRecord.date;

    await this.consumptionRepository
      .createQueryBuilder()
      .delete()
      .where("company_id = :companyId", { companyId })
      .andWhere("date >= :startDate AND date < :endDate", {
        startDate,
        endDate,
      })
      .execute();
  };
}
