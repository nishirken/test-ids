type StaticId = string;
type DynamicId = <T>(x: T) => string;

type TestIdValue = StaticId | DynamicId;

export type TestIds = Record<string, TestIdValue>;

export const makeTestIdSelectors = () => {};
