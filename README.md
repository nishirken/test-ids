#### Single element
For a single static element, an id should be static.

     const div = document.createElement('div');
     
     const testIds = {
       singleItem: 'item',
     };
     const testIdSelectors = makeTestIdSelectors(testIds);
     
     div.setAttribute('data-test-id', testIds.singleItem);
     document.body.appendChild(div);
     
     console.log(testIdSelectors.singleItem); // [data-test-id="item"]
     document.querySelector(testIdSelectors.singleItem) !== null; // true

#### List item
For a dynamic element, an id should be dynamic. For example, a list item.

    const testIds = {
      listItemOne: (id: string) => `item-${id}`,
    };
    const testIdSelectors = makeTestIdSelectors(testIds);
    
    console.log(testIdSelectors.listItemOne('1')); // [data-test-id="item-1"]

#### Additional metadata through attributes
An id should answer the question: "Is an element exists?".
And sometimes, you want to provide additional metadata to an element.
For example, checking some element properties without having an opportunity to achieve an expectation of a test visually.

    const testIds = {
      singleItem: withAttrs<{status: 'ready' | 'loading'}>('item'),
      dropdownItem: (item: {title: string}) => withAttrs<{disabled: boolean}>('dropdownItem'),
    };
    const testIdSelectors = makeTestIdSelectors(testIds);
    
    testIdSelectors.singleItem({status: 'ready'}); // [data-test-id="item"][data-status="ready"]
    testIdSelectors.dropdownItem({disabled: true}); // [data-test-id="dropdownItem"][data-disabled="true"]

Id and additional attributes propery names will be transformed into snake case.

    const testIdSelectors = makeTestIdSelectors(({x: withAttrs<{loadingStatus: 'loadingStatus'}>('someItem')}));

    testIdSelectors.item({loadingStatus: 'loadingStatus'}); // [data-test-id="someItem"][data-loading-status="loadingStatus"]


#### Setting testId to an element
    const testIds = {
      singleItem: withAttrs<{status: 'ready' | 'loading'}>('item'),
    };
    testIdProp(testIds.singleItem, {status: 'ready'}); // {['data-test-id']: 'item', ['data-status']: 'ready'}
    testIdPropString(testIds.singleItem, {status: 'ready'}) // [data-test-id="item"][data-status="ready"]

    
    
