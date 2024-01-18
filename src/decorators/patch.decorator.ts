export const Post = (path: string = "") => {
  return (target: any, propertyKey: string, decriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      "route",
      { method: "patch", path },
      target,
      propertyKey
    );
  };
};
