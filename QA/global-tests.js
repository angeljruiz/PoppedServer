suite('Global Tests', () => {
  test('Page has a valid title', () => {
    assert(document.title && document.title.match(/\S/));
  });
  test('Page should show privacy link', () => {
    assert($('a[href="/privatepolicy"]').length);
  })
});
