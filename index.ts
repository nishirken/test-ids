type StaticId = string;
type DynamicId = <T>(x: T) => string;

type TestIdValue = StaticId | DynamicId;

export type TestIds = Record<string, TestIdValue>;

export const makeTestIdSelectors = () => {};
export const makeTestIdSelectors = <
  S extends Record<string, any> = StringResult<string> & CreatorsResult<string>
>(
  testIds: S,
): S => {
  const selectors: any = {};

  for (const key in testIds) {
    const value: any = testIds[key];
    selectors[key] =
      typeof value === 'string'
        ? testIdSelector(value)
        : (x: number | string) => testIdSelector(value(x));
  }

  return selectors;
};