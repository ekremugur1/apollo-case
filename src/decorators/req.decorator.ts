export const Req = () => {
  return (target: any, propertyKey: string, index: number) => {
    Reflect.defineMetadata("req", index, target, propertyKey);
  };
};
