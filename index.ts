import {kebabCase, mapKeys} from 'lodash';

export type StaticId = string | WithAttrs;
export type DynamicId = (x: any) => string | WithAttrs;

export type TestIdValue = StaticId | DynamicId;
export type TestIds = Record<string, TestIdValue>;

class WithAttrs<T extends Record<string, any> = Record<string, any>> {
  constructor(public readonly id: string) {}

  public attributes(attrs: T, attrName?: string): string {
    return makeSelectorWithAttrs(this.id, attrs, attrName);
  }
}

export const withAttrs = <T extends Record<string, any>>(id: string) => new WithAttrs<T>(id);

const testIdSelector = (id: string, attrName = 'test-id'): string => `[data-${attrName}="${id}"]`;

const makeSelectorWithAttrs = (id: string, attrs: Record<string, any>, attrName?: string): string => {
  return Object.entries(attrs).reduce((acc, [dataAttrName, dataAttrValue]) => {
    return `${acc}[data-${kebabCase(dataAttrName)}="${dataAttrValue}"]`;
  }, testIdSelector(id, attrName));
}; 

export const makeTestIdSelectors = <
  S extends Record<string, TestIdValue>,
>(
    testIds: S,
    attrName?: string,
  ): S => {
  const selectors: any = {};

  for (const key in testIds) {
    const value: TestIdValue = testIds[key];
    
    if (typeof value === 'string') {
      selectors[key] = testIdSelector(value, attrName);
    } else {
      if (value instanceof WithAttrs) {
        selectors[key] = value;
      } else {
        selectors[key] = (x: any) => {
          const res = value(x);

          return typeof res === 'string' ? testIdSelector(res) : res;
        };
      }
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

export const testIdPropString = (id: string, attrs: Record<string, any> = {}, attrName = 'test-id'): string => {
  return Object.entries(attrs).reduce((acc, [key, value]) => {
    return `${acc} data-${kebabCase(key)}="${value}"`;
  }, `data-${attrName}="${id}"`);
};

