import {kebabCase, mapKeys} from 'lodash';

type Flavor<T, S> = {__type?: T} & S;

type StaticId = Flavor<'staticId', string>;
type DynamicId = Flavor<'dynamicId', (x: any) => string>;
type WithAttrsId<T extends Record<string, any> = Record<string, any>> = Flavor<'withAttrsId', S> & {attrs?: T};
type DynamicIdWithAttrs<T extends Record<string, any> = Record<string, any>> = Flavor<'dynamicIdWithAttrs', (x: any, attrs?: Record<string, any>) => WithAttrsId<T>>;

type TestId = StaticId | DynamicId | WithAttrsId | DynamicIdWithAttrs;

class S extends String {}

export function withAttrs<T extends Record<string, any>>(x: string): WithAttrsId<T> {return new S(x)};
withAttrs.__type = 'withAttrsId';

const testIdSelector = (id: string, attrName = 'test-id'): string => `[data-${attrName}="${id}"]`;

const makeSelectorWithAttrs = (id: string, attrs: Record<string, any>, attrName?: string): string => {
  return Object.entries(attrs).reduce((acc, [dataAttrName, dataAttrValue]) => {
    return `${acc}[data-${kebabCase(dataAttrName)}="${dataAttrValue}"]`;
  }, testIdSelector(id, attrName));
}; 

export const makeTestIdSelectors = <
  S extends Record<string, TestId>,
>(
    testIds: S,
    attrName?: string,
  ): any => {
  const selectors: any = {};

  for (const key in testIds) {
    const value: any = testIds[key];

    if (value instanceof S) {
      selectors[key] = (attrs: Record<string, any>) => makeSelectorWithAttrs(value as string, attrs, attrName);
    } else if (typeof value === 'string') {
      selectors[key] = testIdSelector(value, attrName);
    } else if (typeof value === 'function') {
      selectors[key] = (x: any, attrs?: Record<string, any>) => {
        const res: any = value(x);
        return res instanceof S ? makeSelectorWithAttrs(res as string, attrs!, attrName) : testIdSelector(res as string, attrName);
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

