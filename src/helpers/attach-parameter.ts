export const attachParameter = (index: number, value: any, list: any[]) => {
  while (list.length <= index) {
    list.push(undefined);
  }

  list[index] = value;
};
