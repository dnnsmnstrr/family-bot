var assert = require('assert').strict
const jsp = require('../index')

describe('Type properties', () => {
	before(() => {
		jsp.setIsProperties();
	})
	describe('Numbers', () => {
		var x = 0;
		it('is a number', () => {
			assert.ok(x.isNbr)
		})
		it('is a string', () => {
			assert.ok(!x.isStr)
		})
		it('is an array', () => {
			assert.ok(!x.isArr)
		})
		it('is an object', () => {
			assert.ok(!x.isObj)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'number')
		})
	})
	describe('Strings', () => {
		var x = ''
		it('is a number', () => {
			assert.ok(!x.isNbr)
		})
		it('is a string', () => {
			assert.ok(x.isStr)
		})
		it('is an array', () => {
			assert.ok(!x.isArr)
		})
		it('is an object', () => {
			assert.ok(!x.isObj)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'string')
		})
	})
	describe('Arrays', () => {
		var x = []
		it('is a number', () => {
			assert.ok(!x.isNbr)
		})
		it('is a string', () => {
			assert.ok(!x.isStr)
		})
		it('is an array', () => {
			assert.ok(x.isArr)
		})
		it('is an object', () => {
			assert.ok(!x.isObj)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'array')
		})
	})
	describe('Objects', () => {
		var x = {}
		it('is a number', () => {
			assert.ok(!x.isNbr)
		})
		it('is a string', () => {
			assert.ok(!x.isStr)
		})
		it('is an array', () => {
			assert.ok(!x.isArr)
		})
		it('is an object', () => {
			assert.ok(x.isObj)
		})
		it('typeof', () => {
			assert.equal(x.typeof, 'object')
		})
	})
})
