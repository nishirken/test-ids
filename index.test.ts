import {JSDOM} from 'jsdom';
import {makeTestIdSelectors, withAttrs, testIdPropString, testIdProp} from './index';

type ListItem = {
  id: string;
  name: string;
};

const testIds = {
  list: 'list',
  listWithAttrs: withAttrs<{name: string}>('list'),
  listItem: (item: ListItem) => `list-item-${item.id}`,
  listItemWithAttrs: (item: ListItem) => withAttrs<{status: 'A' | 'B'}>(`list-item-${item.id}`),
};

const testIdSelectors = makeTestIdSelectors(testIds);

describe('Test', () => {
  const items: ListItem[] = [
    {
      name: 'first',
      id: '1',
    },
    {
      name: 'second',
      id: '2',
    },
  ];

  test('static field', () => {
    expect(testIdSelectors.list).toBe('[data-test-id="list"]');
  });

  test('dynamic field', () => {
    expect(testIdSelectors.listItem(items[0])).toBe('[data-test-id="list-item-1"]');
  });

  test('With attrs', () => {
    expect(testIdSelectors.listItemWithAttrs(items[0]).attributes({status: 'A'})).toBe('[data-test-id="list-item-1"][data-status="A"]');
  });

  test('testIdProp', () => {
    expect(testIdProp(testIds.list, {name: 'A'})).toEqual({
      'data-test-id': testIds.list,
      'data-name': 'A',
    });
  });

  test('testIdPropString', () => {
    expect(testIdPropString(testIds.listItem(items[0]), {status: 'A'})).toBe(`data-test-id="${testIds.listItem(items[0])}" data-status="A"`);
  });

  test('jsdom', () => {
    const dom = new JSDOM(`
      <ul ${testIdPropString(testIds.list)}>
        ${items.map((item) => `<li ${testIdPropString(testIds.listItem(item))}>${item.name}</li>`)}
      </ul>
    `);
    const ul = dom.window.document.querySelector(testIdSelectors.list);
    const li1 = dom.window.document.querySelector<HTMLLIElement>(testIdSelectors.listItem(items[0]));

    expect(ul).not.toBeNull();
    expect(li1?.innerHTML).toBe(items[0].name);
  });

  test('jsdom with attributes', () => {
    const dom = new JSDOM(`
      <ul ${testIdPropString(testIds.listWithAttrs.id, {name: 'A'})}>
        ${items.map((item) => `<li ${testIdPropString(testIds.listItemWithAttrs(item).id, {status: 'A'})}>${item.name}</li>`)}
      </ul>
    `);
    const ul = dom.window.document.querySelector(testIdSelectors.listWithAttrs.attributes({name: 'A'}));
    const li1 = dom.window.document.querySelector<HTMLLIElement>(testIdSelectors.listItemWithAttrs(items[0]).attributes({status: 'A'}));
    const li2 = dom.window.document.querySelector<HTMLLIElement>(testIdSelectors.listItemWithAttrs(items[0]).attributes({status: 'B'}));

    expect(ul).not.toBeNull();
    expect(li1?.innerHTML).toBe(items[0].name);
    expect(li2).toBeNull();
  });
});
