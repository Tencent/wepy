const expect = require('chai').expect;
const tag = require('../../core/tag');

describe('Tag', function() {
  it('should combine tag map', function() {
    const additional = {
      'test-tag-1': 'to-test-tag-1',
      'test-tag-2': 'to-test-tag-2'
    };
    const ret = tag.combineTagMap(tag.HTML2WXML_MAP, additional);

    expect(ret).to.include(tag.HTML2WXML_MAP);
    expect(ret).to.include(additional);
  });

  it('should combine tag', function() {
    let additional = 'add-test-tag-1';
    let ret = tag.combineTag(tag.HTML_TAGS, additional);
    expect(ret).to.include.members(tag.HTML_TAGS);
    expect(ret).to.include(additional);

    additional = 'add-test-tag-1,add-test-tag-2';
    ret = tag.combineTag(tag.HTML_TAGS, additional);
    expect(ret).to.include.members(tag.HTML_TAGS);
    expect(ret).to.include.members(additional.split(','));

    additional = ['add-test-tag-1', 'add-test-tag-2'];
    ret = tag.combineTag(tag.HTML_TAGS, additional);
    expect(ret).to.include.members(tag.HTML_TAGS);
    expect(ret).to.include.members(additional);

    additional = 123;
    ret = tag.combineTag(tag.HTML_TAGS, additional);
    expect(ret).to.eql(tag.HTML_TAGS);
  });
});
