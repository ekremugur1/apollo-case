import { Validator } from "../middlewares/validator.middleware";

export const Body = () => {
  return (target: any, propertyKey: string, index: number) => {
    const types =
      Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];

    const middlewares =
      Reflect.getMetadata("middlewares", target, propertyKey) || [];

    Reflect.defineMetadata(
      "middlewares",
      [...middlewares, new Validator(types[index]).handleRequest],
      target,
      propertyKey
    );

    Reflect.defineMetadata("body", index, target, propertyKey);
  };
};
