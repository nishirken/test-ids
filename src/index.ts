import { kebabCase, mapKeys, mapValues } from "lodash";
import {
  StaticId,
  StaticIdWithAttrs,
  DynamicId,
  DynamicIdWithAttrs,
  TestId,
  WithAttrsString,
} from "./types";

export function withAttrs<T extends Record<string, any>>(
  x: string
): StaticIdWithAttrs<T> {
  return new WithAttrsString(x);
}

const testIdSelector = (id: string, attrName = "test-id"): string =>
  `[data-${attrName}="${id}"]`;

const makeSelectorWithAttrs = (
  // eslint-disable-next-line
  id: String, attrs: Record<string, any>,
  attrName?: string
): string => {
  return Object.entries(attrs).reduce((acc, [dataAttrName, dataAttrValue]) => {
    return `${acc}[data-${kebabCase(dataAttrName)}="${dataAttrValue}"]`;
  }, testIdSelector(id as string, attrName));
};

const isStaticId = (x: TestId): x is StaticId =>
  !(x instanceof WithAttrsString) && typeof x === "string";
const isStaticIdWithAttrs = (x: TestId): x is StaticIdWithAttrs =>
  x instanceof WithAttrsString;
const isDynamicId = (
  x: DynamicId | DynamicIdWithAttrs,
  id: StaticId | StaticIdWithAttrs
): x is DynamicId => {
  return isStaticId(id);
};

type TestIdSelectors<T extends Record<string, TestId>> = {
  [P in keyof T]: T[P] extends StaticId
    ? T[P]
    : T[P] extends DynamicId
    ? T[P]
    : T[P] extends StaticIdWithAttrs<infer A>
    ? (attrs: A) => string
    : T[P] extends (x: any) => StaticIdWithAttrs<infer A>
    ? (x: Parameters<T[P]>[0], attrs: A) => string
    : never;
};

export const makeTestIdSelectors = <S extends Record<string, TestId>>(
  testIds: S,
  attrName?: string
): TestIdSelectors<S> => {
  return mapValues(testIds as any, (value: TestId) => {
    if (isStaticId(value)) {
      return testIdSelector(value, attrName);
    } else if (isStaticIdWithAttrs(value)) {
      return (attrs: Record<string, any>) =>
        makeSelectorWithAttrs(value, attrs, attrName);
    } else {
      return (x: any, attrs: Record<string, any> = {}) => {
        const res = value(x);
        return isDynamicId(value, res)
          ? testIdSelector(res as string, attrName)
          : makeSelectorWithAttrs(res, attrs, attrName);
      };
    }
  }) as any;
};

export function testIdProp<T extends StaticId>(
  id: T,
  attrName?: string
): Record<string, string>;
export function testIdProp<T extends StaticIdWithAttrs, A extends T["__attrs"]>(
  id: T,
  attrs: A,
  attrName?: string
): Record<string, string>;
export function testIdProp(
  id: string,
  attrs: any = {},
  attrName = "test-id"
): any {
  return mapKeys(
    {
      [attrName]: id.valueOf(),
      ...attrs,
    },
    (_, key: string) => `data-${kebabCase(key)}`
  );
}

export function testIdPropString<T extends StaticId>(
  id: T,
  attrName?: string
): string;
export function testIdPropString<
  T extends StaticIdWithAttrs,
  A extends T["__attrs"]
>(id: T, attrs: A, attrName?: string): string;
export function testIdPropString(
  id: string,
  attrs: any = {},
  attrName = "test-id"
): string {
  return Object.entries(attrs).reduce((acc, [key, value]) => {
    return `${acc} data-${kebabCase(key)}="${value}"`;
  }, `data-${attrName}="${id}"`);
}
