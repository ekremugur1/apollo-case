import { KeyIndexPair } from "../types/param-item.type";

export const Cookie = (key: string) => {
  return (target: any, propertyKey: string, index: number) => {
    const existingCookies: KeyIndexPair[] =
      Reflect.getMetadata("cookies", target, key) || [];
    existingCookies.push({ key, index });
    Reflect.defineMetadata("cookies", existingCookies, target, propertyKey);
  };
};
