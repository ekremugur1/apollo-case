export const User = () => {
  return (target: any, propertyKey: string, index: number) => {
    Reflect.defineMetadata("user", index, target, propertyKey);
  };
};
