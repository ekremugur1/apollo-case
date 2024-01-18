export const Get = (path: string = "") => {
  return (target: any, propertyKey: string, decriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      "route",
      { method: "get", path },
      target,
      propertyKey
    );
  };
};
