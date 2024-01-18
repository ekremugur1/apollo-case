export const Res = () => {
  return (target: any, propertyKey: string, index: number) => {
    Reflect.defineMetadata("res", index, target, propertyKey);
  };
};
