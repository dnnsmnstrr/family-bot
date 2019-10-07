const assert = require('assert').strict
const jsp = require('../index')

describe('Errors', () => {
	before(() => {
		jsp.install('error')
	})
	it('Object-ises errors', () => {
		try {
			throw new Error('test')
		}
		catch(e) {
			var actual = e.obj()
			assert.equal(Object.keys(actual).length, 2)
			assert.equal(actual.message, 'test')
			assert.ok(actual.stack.length > 0)
		}
	})
	it('Json-ises errors', () => {
		try {
			throw new Error('test')
		}
		catch(e) {
			var actual = e.json().replace(/\/Users\/\w+/g, '')
			assert.ok(typeof actual == 'string', 'did not return a string')
			assert.ok(actual.match(/^{"stack":"Error: test/, 'does not contain stack'))
			assert.ok(actual.match(/"message":"test"}$/, 'does not contain message'))
		}
	})
})
