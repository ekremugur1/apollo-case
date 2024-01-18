import { inject } from "tsyringe";
import { EntitySchema } from "typeorm";
import { getRepositoryToken } from "../helpers/token-utils";

export const InjectRepository = (entity: Function | EntitySchema) =>
  inject(getRepositoryToken(entity));
