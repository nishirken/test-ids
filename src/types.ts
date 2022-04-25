export type Flavor<T, S> = {__type?: T} & S;

export type StaticId = Flavor<'staticId', string>;
export type DynamicId = Flavor<'dynamicId', (x: any) => StaticId>;
export type StaticIdWithAttrs<T extends Record<string, any> = Record<string, any>> = Flavor<'staticIdWithAttrs', WithAttrsString> & {__attrs?: T};
export type DynamicIdWithAttrs<T extends Record<string, any> = Record<string, any>> = Flavor<'dynamicIdWithAttrs', (x: any) => WithAttrsString> & {__attrs?: T};

export type TestId = StaticId | DynamicId | StaticIdWithAttrs | DynamicIdWithAttrs;

export class WithAttrsString extends String {}
