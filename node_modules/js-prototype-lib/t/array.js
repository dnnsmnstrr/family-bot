var assert = require('assert').strict
const jsp = require('../index')

describe('Arrays', () => {
	before(() => {
		jsp.install()
	})
	describe('case functions', () => {
		it('uppercases', () => {
			var input = 'a/B/c'.split('/')
			var expected = ['A', 'B', 'C']
			assert.deepEqual(input.uc(), expected)
		})
		it('lowercases', () => {
			var input = 'A/B/c'.split('/')
			var expected = ['a', 'b', 'c']
			assert.deepEqual(input.lc(), expected)
		})
	})
	describe('unique', () => {
		it('Handles empty arrays', () => {
			var actual = [].unique();
			assert.deepEqual(actual, [])
		})
		it('Handles simple arrays', () => {
			var actual = [2, 3, 2, 5, 2].unique()
			assert.equal(actual.length, 3)
		})
		it('Handles arrays with objects', () => {
			var actual = [{n: 1}, {n: 2}, {n: 1}]
			assert.equal(actual.length, 3)
		})
	})
	describe('trim', () => {
		it('Empty array', () => {
			var actual = [].trim()
			assert.ok(Array.isArray(actual))
			assert.equal(actual.length, 0)
		})
		it('Base case', () => {
			var actual = ['  test\t'].trim()
			assert.deepEqual(actual, ['test'])
		})
		it('Multiple elements', () => {
			var actual = ['  test\t', '\t\ttest 2   '].trim()
			assert.deepEqual(actual, ['test', 'test 2'])
		})
		it('Non strings - objects', () => {
			var actual = ['  test\t', {x: 1}].trim()
			assert.deepEqual(actual, ['test', {x: 1}])
		})
		it('Array non recursion', () => {
			var actual = ['  test\t', [' inner ', '\tinner\t']].trim()
			assert.deepEqual(actual, ['test', [' inner ', '\tinner\t']])
		})
		it('Trims empty elements', () => {
			var actual = ['x','','y'].trim(true)
			var expected = ['x','y']
			assert.deepEqual(actual, expected)
		})
	})
	describe('flat', () => {
		it('Handles empty arrays', () => {
			var actual = [].flat()
			assert.ok(Array.isArray(actual))
			assert.equal(actual.length, 0)
		})
		it('Flat input', () => {
			var actual = [1, 3, 3];
			assert.deepEqual(actual.flat(), actual)
		})
		it('Base case', () => {
			var actual = [1, [2,3], 4].flat();
			assert.deepEqual(actual, [1,2,3,4])
		})
		it('Recursive', () => {
			var actual = [1, [2,[3,4]], 5].flat(2);
			assert.deepEqual(actual, [1,2,3,4,5])
		})
	})
	describe('last', () => {
		it('Empty array', () => {
			var actual = [].last();
			assert.equal(actual, undefined);
		})
		it('Niladic call', () => {
			var actual = [1,2,3].last();
			assert.equal(actual, 3)
		})
		it('Position specifier', () => {
			var actual = [1,2,3].last(1);
			assert.equal(actual, 2)
		})
	})
	describe('upack', () => {
		it('Empty array', () => {
			var actual = [].unpack()
			assert.ok(Array.isArray(actual))
			assert.equal(actual.length, 0)
		})
		it('Empty array with modifier', () => {
			var actual = [].unpack(true)
			assert.equal(typeof actual, 'undefined')
		})
		it('Array with single element (integer)', () => {
			var actual = [3].unpack()
			assert.equal(typeof actual, 'number')
			assert.equal(actual, 3)
		})
		it('Array with single element (object)', () => {
			var actual = [{n: 1}].unpack()
			assert.deepEqual(actual, {n: 1})
		})
		it('Array with multiple elements', () => {
			var actual = 'a/b/c'.split('/').unpack()
			assert.deepEqual(actual, ['a', 'b', 'c'])
		})
	})
	describe('keyval', () => {
		it('Base case', () => {
			var r = [
				{k: 'a', v: 1}, 
				{k: 'b', v: 2}, 
				{k: 'c', v: 3}
			]
			var expected = {a: 1, b: 2, c: 3}
			var actual = r.keyval()
			assert.deepEqual(actual, expected)
		})
		it('Named fields', () => {
			var r = [
				{key: 'a', val: 1}, 
				{key: 'b', val: 2}, 
				{key: 'c', val: 3}
			]
			var expected = {a: 1, b: 2, c: 3}
			var actual = r.keyval('key', 'val')
			assert.deepEqual(actual, expected)
		})
		it('Array suport', () => {
			r = [
				{k: 'a', v: 1},
				{k: 'a', v: 2},
				{k: 'a', v: 3}
			]
			var expected = {a: [1, 2, 3]}
			var actual = r.keyval()
			assert.deepEqual(actual, expected)
		})
	})
	describe('index of object', () => {
		it('Base case', () => {
			var r = [{nm: 'a'}, {nm: 'b'}, {nm: 'c'}, {nm: 'd'}]
			assert.equal(r.indexOfObj(o => o.nm == 'b'), 1)
		})
		it('Non-existent', () => {
			var r = [{nm: 'a'}, {nm: 'b'}, {nm: 'c'}, {nm: 'd'}]
			assert.equal(r.indexOfObj(o => o.nm == 'e'), -1)
		})
		it('Missing filter', () => {
			var r = [{nm: 'a'}, {nm: 'b'}, {nm: 'c'}, {nm: 'd'}]
			try {
				r.indexOfObj()
			}
			catch (e) {
				assert.ok(e.message == 'filter is not a function', 'Failed to issue exception')
			}
		})
	})
	describe('json', () => {
		it('Base case', () => {
			assert.deepEqual(['a', 'b'].json(), '["a","b"]')
		})
	})
	describe('item', () => {
		var r = [{a: 1, b: 2}, {a: 3, b: 4}, {a: 5, b: 6}]
		it('Base case', () => {
			assert.deepEqual(r.item('a', 3), r[1])
		})
		it('Not found', () => {
			var o = r.item('a', 2)
			assert.equal(typeof o, 'undefined')
		})
		it('Invalid key', () => {
			var o = r.item('c', 1)
			assert.equal(typeof o, 'undefined')
		})
		it('No arguments', () => {
			var o = r.item()
			assert.equal(typeof o, 'undefined')
		})
		it('Missing arguments', () => {
			var o = r.item('a')
			assert.equal(typeof o, 'undefined')
		})
		it('Empty array', () => {
			var r = []
			var o = r.item('a', 2)
			assert.equal(typeof o, 'undefined')
		})
		it('Scalar array', () => {
			var r = [0, 1, 2, 3, 4]
			var o = r.item('a', 2)
			assert.equal(typeof o, 'undefined')
		})
		it('Returns a single value', () => {
			var r = [{a: 1, b: 2}, {a: 1, b: 4}, {a: 5, b: 6}]
			assert.deepEqual(r.item('a', 1), r[0])
		})
		it('Integer array is regex safe', () => {
			var r = [{a: 1, b: 2}, {a: 1, b: 4}, {a: 5, b: 6}]
			assert.deepEqual(r.item('a', /1/), r[0])
		})
		it('Supports regular expressions', () => {
			var r = [{a: 1, b: 'abc'}, {a: 1, b: 'bcd'}, {a: 5, b: 'cde'}]
			assert.deepEqual(r.item('b', /e/), r[2])
		})
		it('String matches (partial)', () => {
			var r = [{a: 1, b: 'abc'}, {a: 1, b: 'bcd'}, {a: 5, b: 'cde'}]
			assert.deepEqual(typeof r.item('b', 'e'), 'undefined')
		})
		it('String matches (full)', () => {
			var r = [{a: 1, b: 'abc'}, {a: 1, b: 'bcd'}, {a: 5, b: 'cde'}]
			assert.deepEqual(r.item('b', 'cde'), r[2])
		})
	})
	describe('contains', () => {
		var r = [2,4,6,8]
		it('Item exists', () => {
			assert.equal(r.contains(2), true)
		})
		it('Item absent', () => {
			assert.equal(r.contains(3), false)
		})
		it('Array empty', () => {
			assert.equal([].contains(3), false)
		})
		it('No parameters', () => {
			assert.equal(r.contains(), false)
		})
		it('Object parameter', () => {
			assert.equal(r.contains({}), false)
		})
		it('Object array', () => {
			var r = [{a:1}, {b:1}, {c:1}]
			assert.equal(r.contains({a:1}), false)
		})
	})
	describe('split', () => {
		var r = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
		it('Base case', () => {
			var expected = [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h']]
			assert.deepEqual(r.split(3), expected)
		})
		it('Niladic call', () => {
			assert.deepEqual(r.split(), r)
		})
		it('Empty array', () => {
			assert.deepEqual([].split(2), [])
		})
		it('Single partition', () => {
			var r = ['a', 'b']
			var expected = [['a', 'b']]
			assert.deepEqual(r.split(4), expected)
		})
	})
})
