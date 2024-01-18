export const Delete = (path: string = "") => {
  return (target: any, propertyKey: string, decriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      "route",
      { method: "delete", path },
      target,
      propertyKey
    );
  };
};
