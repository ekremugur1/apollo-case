import { KeyIndexPair } from "../types/param-item.type";

export const Param = (parameterKey: string) => {
  return (target: any, key: string | symbol, parameterIndex: number) => {
    const existingParams: KeyIndexPair[] =
      Reflect.getMetadata("params", target, key) || [];
    existingParams.push({ key: parameterKey, index: parameterIndex });
    Reflect.defineMetadata("params", existingParams, target, key);
  };
};
