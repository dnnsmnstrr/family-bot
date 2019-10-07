var assert = require('assert').strict
const jsp = require('../index')

var v = jsp.version()
console.log('Version: ' + v.SemVer + ' (' + v.nbr + ')')

describe('Package functions', () => {
    describe('Metadata', () => {
        it('Contains version', () => {
            assert.ok(!!v.SemVer)
            assert.ok(!!v.nbr)
        })
    })
    describe('Lister', () => {
        it('Expands categories', () => {
            var actual = jsp.ls('array');
            var expected = Object.keys(jsp.extensions.array)
                .map(k => 'array:' + k)
            assert.deepEqual(actual, expected)
        })
        it('Individual functions', () => {
            var expected = ['unique', 'trim', 'flat'];
            var actual = jsp.ls(expected);
            assert.deepEqual(actual, expected)
        })
        it('Supports mixes', () => {
            var actual = jsp.ls('object', 'trim')
            var expected = Object.keys(jsp.extensions.object)
            assert.equal(actual.length, expected.length + 1)
        })
    })
    describe('Installer', () => {
        before(() => {
            if (Array.prototype.last) delete Array.prototype.last
        })
        it('Handles a single function', () => {
            jsp.install('array:last')
            assert.ok(!!Array.prototype.last)
        })
        it('Supports groups', () => {
            jsp.install('object')
            var expected = Object.keys(jsp.extensions.object)
                .filter(k => typeof jsp.extensions.object[k] == 'function')
            var actual = expected
                .filter(k => Object.prototype[k])
            assert.equal(actual.length, expected.length)
        })
        it('Preserves object enumerability', () => {
            jsp.install('object:keys');
            var ok = true, o = {};
            for (var i in o) ok = false;
            assert.ok(ok, 'Object space polluted')
        })
        it('Niladic call', () => {
            jsp.install()
            var actual = 0, expected = 0;
            Object.keys(jsp.extensions).map(x => {
                var k = Object.keys(jsp.extensions[x])
                    .filter(k => typeof jsp.extensions.object[x] == 'function');
                expected += k.length;
                actual += k.filter(k => {
                    var o = eval(x.tc());
                    return !!o.prototype[k];
                }).length;
            });
            assert.equal(actual, expected)
        })
    })
    describe('Uninstaller', () => {
        before(() => {
            jsp.install('array:last')
        })
        it('Single function', () => {
            jsp.uninstall('array:last')
            assert.ok(!Array.prototype.last, 'Failed uninstallation')
        })
        it('Supports groups', () => {
            jsp.uninstall('object')
            var keys = Object.keys(jsp.extensions.object)
            var expected = keys.filter(k => !Object.prototype[k])
            assert.equal(keys.length, expected.length)
        })
    })
})
