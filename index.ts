import {kebabCase, mapKeys} from 'lodash';

type Flavor<T, S> = {__type?: T} & S;

type StaticId = Flavor<'staticId', string>;
type DynamicId = Flavor<'dynamicId', (x: any) => StaticId>;
type StaticIdWithAttrs<T extends Record<string, any> = Record<string, any>> = Flavor<'staticIdWithAttrs', WithAttrsString> & {__attrs?: T};
type DynamicIdWithAttrs<T extends Record<string, any> = Record<string, any>> = Flavor<'dynamicIdWithAttrs', (x: any) => WithAttrsString> & {__attrs?: T};

type TestId = StaticId | DynamicId | StaticIdWithAttrs | DynamicIdWithAttrs;

class WithAttrsString extends String {}

export function withAttrs<T extends Record<string, any>>(x: string): StaticIdWithAttrs<T> {return new WithAttrsString(x)};

const testIdSelector = (id: String, attrName = 'test-id'): string => `[data-${attrName}="${id}"]`;

const makeSelectorWithAttrs = (id: String, attrs: Record<string, any>, attrName?: string): string => {
  return Object.entries(attrs).reduce((acc, [dataAttrName, dataAttrValue]) => {
    return `${acc}[data-${kebabCase(dataAttrName)}="${dataAttrValue}"]`;
  }, testIdSelector(id, attrName));
};

const isStaticId = (x: TestId): x is StaticId => !(x instanceof WithAttrsString) && typeof x === 'string';
const isStaticIdWithAttrs = (x: TestId): x is StaticIdWithAttrs => x instanceof WithAttrsString;
const isDynamicId = (x: DynamicId | DynamicIdWithAttrs, id: StaticId | StaticIdWithAttrs): x is DynamicId => {
  return isStaticId(id); 
};

type TestIdSelectors<T extends Record<string, TestId>> = {
  [P in keyof T]: T[P] extends StaticId
    ? T[P]
    : (T[P] extends DynamicId
      ? T[P]
      : (T[P] extends StaticIdWithAttrs<infer A>
        ? ((attrs: A) => string)
        : T[P] extends (x: any) => StaticIdWithAttrs<infer A>
          ? ((x: Parameters<T[P]>[0], attrs: A) => string)
          : never))
};

export const makeTestIdSelectors = <
  S extends Record<string, TestId>,
>(
    testIds: S,
    attrName?: string,
  ): TestIdSelectors<S> => {
  const selectors: any = {};

  for (const key in testIds) {
    const value: TestId = testIds[key];

    if (isStaticId(value)) {
      selectors[key] = testIdSelector(value, attrName);
    } else if (isStaticIdWithAttrs(value)) {
      selectors[key] = (attrs: Record<string, any>) => makeSelectorWithAttrs(value, attrs, attrName);
    } else {
      selectors[key] = (x: any, attrs: Record<string, any> = {}) => {
        const res = value(x);
        return isDynamicId(value, res) ? testIdSelector(res, attrName) : makeSelectorWithAttrs(res, attrs, attrName);
      };
    }
  }

  return selectors;
};

export const testIdProp = <T extends Record<string, any>, K extends string, S extends string>(
  id: K,
  attrs: Record<string, any> = {},
  attrName: S = ('test-id' as S),
): T & Record<S, K> => {
  return mapKeys({
    [attrName]: id,
    ...attrs,
  }, (_, key: string) => `data-${kebabCase(key)}`) as any;
};

export const testIdPropString = <S extends string>(id: S, attrs: Record<string, any> = {}, attrName = 'test-id'): string => {
  return Object.entries(attrs).reduce((acc, [key, value]) => {
    return `${acc} data-${kebabCase(key)}="${value}"`;
  }, `data-${attrName}="${id}"`);
};

