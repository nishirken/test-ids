import {TestIds, makeTestIdSelectors} from "./";

type ListItem = {
  id: string;
  name: string;
};

const testIds: TestIds = {
  list: 'list',
  listItem: (item: ListItem) => `list-item-${item.id}`,
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
});
