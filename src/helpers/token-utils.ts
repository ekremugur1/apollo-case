import { EntitySchema } from "typeorm";
import { Strategy } from "../strategies/strategy";

export const getRepositoryToken = (entity: Function | EntitySchema): string => {
  return (entity as unknown as Function).name;
};

export const getStrategyToken = (strategy: Strategy) => {
  return strategy.name;
};
