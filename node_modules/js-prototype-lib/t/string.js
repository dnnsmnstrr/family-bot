const os = require('os')
const fs = require('fs')
const assert = require('assert').strict
const jsp = require('../index')

describe('Strings', () => {
	before(() => {
		jsp.install('string')
	})
	describe('translate', () => {
		it('Base case', () => {
			var input = "john's response: sure!"
			var expected = "john;s rEsponsE# surE%"
			assert.equal(input.tr("':!e", ";#%E"), expected)
		})
	})
	describe('sprintf', () => {
		it('Base case', () => {
			var actual = 'math: %{a} + %{b}'.sprintf({a: 1, b: 2})
			assert.equal(actual, 'math: 1 + 2')
		})
		it('Missing parameters', () => {
			var actual = 'math: %{a} + %{b}'.sprintf()
			assert.equal(actual, 'math: %{a} + %{b}')
		})
		it('String parameter', () => {
			var actual = 'math: %{a} + %{a}'.sprintf('')
			assert.equal(actual, 'math: %{a} + %{a}')
		})
		it('Multiple instances', () => {
			var actual = 'math: %{a} + %{a}'.sprintf({a: 1})
			assert.equal(actual, 'math: 1 + 1')
		})
		it('handles array data', () => {
			var actual = 'alle %s werden %s'.sprintf(['menschen', 'brüder'])
			var expected = 'alle menschen werden brüder'
			assert.equal(actual, expected)
		})
		it('array parameter contains non-string data', () => {
			var actual = 'buy %s bar of soap'.sprintf([1])
			var expected = 'buy 1 bar of soap'
			assert.equal(actual, expected)
		})
		it('skips objects in array', () => {
			var actual = 'buy %s bar of %s'.sprintf([{a:1}, 1, 'soap'])
			var expected = 'buy 1 bar of soap'
			assert.equal(actual, expected)
		})
	})
	describe('chomp', () => {
		it('Niladic', () => {
			var input = 'testing\n'
			var expected = 'testing'
			assert.equal(input.chomp(), expected)
		})
		it('String argument', () => {
			var input = 'testing'
			var expected = 'testin'
			assert.equal(input.chomp('g'), expected)
		})
		it('Dot support', () => {
			assert.equal('testing.js'.chomp('.js'), 'testing', 'Chomp should succeed')
			assert.equal('testing_js'.chomp('.js'), 'testing_js', 'Chomp should fail')
		})
		it('Regular expression', () => {
			var input = 'testing.js'
			var expected = 'testing'
			assert.equal(input.chomp(/\.js/), expected)
		})
		it('Explicit terminal', () => {
			var input = 'testing.js'
			var expected = 'testing'
			assert.equal(input.chomp(/\.js$/), expected)
		})
	})
	describe('replaceall', () => {
		it('Base case', () => {
			var input = 'me and you and him and her'
			var expected = 'me or you or him or her'
			assert.equal(input.replaceall('and', 'or'), expected)
		})
	})
	describe('unindent', () => {
		it('Pre-trimmed', () => {
			var actual = 'x'.unindent()
			assert.equal(actual, 'x')
		})
		it('Trims leading spaces', () => {
			var actual = '   x'.unindent()
			assert.equal(actual, 'x')
		})
		it('Trims leading tabs', () => {
			var actual = '\t\tx'.unindent()
			assert.equal(actual, 'x')
		})
		it('Trims mixed whitespace', () => {
			var actual = ' \tx'.unindent()
			assert.equal(actual, 'x')
		})
		it('Trims trailing whitespace', () => {
			var actual = ' \tx\t\t  '.unindent()
			assert.equal(actual, 'x')
		})
		it('Multi-line - No trailing', () => {
			var actual = `
			x
			y`;
			assert.equal(actual.unindent(), 'x\ny')
		})
		it('Multi-line - Trailing', () => {
			var actual = `
			x
			y
			`;
			assert.equal(actual.unindent(), 'x\ny')
		})
		it('Multi-line - Respects embedding', () => {
			var actual = `
			x
			\ty
			  z
			`;
			assert.equal(actual.unindent(), 'x\n\ty\n  z')
		})
		it('Multi-line - Does not manage outdentions', () => {
			var actual = `
			  x
			y
			`;
			assert.equal(actual.unindent(), 'x\n\t\t\ty')
		})
	})
	describe('heredoc', () => {
		it('Joins multilines', () => {
			var actual = 'line1\nline2\nline3'.heredoc()
			assert.equal(actual, 'line1 line2 line3')
		})
		it('Respects double lines', () => {
			var actual = 'line1\n\nline2\n\nline3'.heredoc()
			assert.equal(actual, 'line1 \nline2 \nline3')
		})
	})
	describe('keyval', () => {
		it('Base case', () => {
			var input = 'a=1\nb=2\nc=string'
			var actual = input.keyval()
			var expected = {a:1, b:2, c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Supports key separator', () => {
			var input = 'a:1\nb:2\nc:string'
			var actual = input.keyval(':')
			var expected = {a:1, b:2, c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Supports line separator', () => {
			var input = 'a:1;b:2;c:string'
			var actual = input.keyval(':', ';')
			var expected = {a:1, b:2, c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Can quote all fields', () => {
			var input = 'a=1;b=2;c=string'
			var actual = input.keyval('=', ';', true)
			var expected = {a:"1", b:"2", c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Manages empty fields', () => {
			var input = 'a=1;b=2;;c=string'
			var actual = input.keyval('=', ';', true)
			var expected = {a:"1", b:"2", c:"string"}
			assert.deepEqual(actual, expected)
		})
		it('Produces empty keys', () => {
			var input = 'a=1;b=;c=string'
			var actual = input.keyval('=', ';', true)
			var expected = {a:"1", b:'', c:"string"}
			assert.deepEqual(actual, expected)
		})
	})
	describe('quoting', () => {
		it('Base case', () => {
			var actual = "test".q()
			assert.equal(actual, "'test'")
		})
		it('Prequoted', () => {
			var actual = "'test'".q()
			assert.equal(actual, "'test'")
		})
		it('Embedded quotes protected', () => {
			var actual = "test's failure".q()
			assert.equal(actual, "'test's failure'")
		})
		it('Respects whitespace', () => {
			var actual = "\ttest's failure  ".q()
			assert.equal(actual, "'\ttest's failure  '")
		})
		it('Double quotes', () => {
			var actual = 'test'.q('"')
			assert.equal(actual, '"test"')
		})
		it('Supports sets', () => {
			var actual = 'test'.q('{}')
			assert.equal(actual, '{test}')
		})
		it('Supports square brackets', () => {
			var actual = 'test'.q('[]')
			assert.equal(actual, '[test]')
		})
		it('Empty quotes', () => {
			var actual = 'test'.q("")
			assert.equal(actual, '"test"')
		})
	})
	describe('case functions', () => {
		var s = 'in a littLe bOOk';
		it('Uppercases', () => {
			var actual = s.uc()
			var expected = s.toUpperCase()
			assert.equal(actual, expected)
		})
		it('Lowercases', () => {
			var actual = s.lc()
			var expected = s.toLowerCase()
			assert.equal(actual, expected)
		})
		it('Titlecases', () => {
			var actual = s.tc()
			var expected = 'In a Little Book'
			assert.equal(actual, expected)
		})
	})
	describe('list management', () => {
		it('array - base case', () => {
			var expected = ['ett', 'två', 'tre']
			assert.deepEqual('ett|två|tre'.arr(), expected, 'Pipes failed')
			assert.deepEqual('ett,två,tre'.arr(), expected, 'Commas failed')
			assert.deepEqual('ett;två;tre'.arr(), expected, 'Semicolons failed')
			assert.deepEqual('ett.två.tre'.arr(), expected, 'Dots failed')
			assert.deepEqual('ett\ttvå\ttre'.arr(), expected, 'Tabs failed')
			assert.deepEqual('ett\ntvå\ntre'.arr(), expected, 'Newlines failed')
		})
		it('array - custom delimiter', () => {
			var expected = ['ett', 'två', 'tre']
			assert.deepEqual('ett två tre'.arr(' '), expected)
		})
		it('array - with callback', () => {
			var n = 0, expected = ['ett', 'två']
			'ett/två'.arr('/', v => {
				assert.ok(expected.indexOf(v) > -1); n++;
			})
			assert.equal(n, 2, 'Iteration count failed')
		})
		it('array - with only callback', () => {
			var n = 0, expected = ['ett', 'två']
			'ett/två'.arr(v => {
				assert.ok(expected.indexOf(v) > -1); n++;
			})
			assert.equal(n, 2, 'Iteration count failed')
		})
		it('splitn - base case', () => {
			var actual = 'ett/två/tre'.splitn();
			var expected = ['ett', 'två/tre']
			assert.deepEqual(actual, expected)
		})
		it('splitn - invalid segment length', () => {
			var actual = 'ett/två/tre/fyra/fem'.splitn(1);
			var expected = ['ett/två/tre/fyra/fem']
			assert.deepEqual(actual, expected)
		})
		it('splitn - explicit number', () => {
			var actual = 'ett/två/tre/fyra/fem'.splitn(3);
			var expected = ['ett', 'två', 'tre/fyra/fem']
			assert.deepEqual(actual, expected)
		})
		it('splitn - segment deficit', () => {
			var actual = 'ett/två/tre'.splitn(4);
			var expected = ['ett', 'två', 'tre']
			assert.deepEqual(actual, expected)
		})
		it('splitn - with delimiters', () => {
			var actual = 'ett  två  tre'.splitn(' ');
			var expected = ['ett', 'två  tre']
			assert.deepEqual(actual, expected)
		})
		it('nth - empty', () => {
			var input = ''
			var actual = input.nth(0)
			assert.equal(actual, '')
		})
		it('nth - base case', () => {
			var input = 'ett/två/tre'
			assert.equal(input.nth(0), 'ett')
			assert.equal(input.nth(1), 'två')
			assert.equal(input.nth(2), 'tre')
		})
		it('nth - index exceeds', () => {
			var input = 'ett/två/tre'
			assert.equal(input.nth(3), '')
		})
		it('nth - negative index', () => {
			var input = 'ett/två/tre'
			assert.equal(input.nth(-1), 'tre')
			assert.equal(input.nth(-2), 'två')
		})
		it('nth - delimiter defaults', () => {
			assert.equal('ett|två|tre'.nth(0), 'ett', 'Pipes failed')
			assert.equal('ett,två,tre'.nth(0), 'ett', 'Commas failed')
			assert.equal('ett;två;tre'.nth(0), 'ett', 'Semicolons failed')
			assert.equal('ett.två.tre'.nth(0), 'ett', 'Dots failed')
			assert.equal('ett\ttvå\ttre'.nth(0), 'ett', 'Tabs failed')
			assert.equal('ett\ntvå\ntre'.nth(0), 'ett', 'Newlines failed')
			assert.equal('ett två tre'.nth(0), 'ett', 'Spaces failed')
		})
		it('nth - delimiter options', () => {
			assert.equal('ett#två#tre'.nth(0, '#'), 'ett')
		})
		it('nth - empty elements', () => {
			assert.equal('ett//två///tre'.nth(1), 'två')
		})
	})
	describe('extracts regular expression', () => {
		var re = /\((.*?)\)/
		it('base case', () => {
			assert.equal('test (case)'.extract(re), 'case')
		})
		it('handles mismatch', () => {
			var input = 'test [case]'
			assert.deepEqual(input.extract(re), [])
		})
		it('handles mismatch with original return', () => {
			var input = 'test [case]'
			assert.equal(input.extract(re, true), input)
		})
		it('handles mismatch with default', () => {
			var input = 'test [case]'
			assert.equal(input.extract(re, 'x'), 'x')
		})
		it('supports multiple fields', () => {
			var re = /(\w+) first (\w+)/
			var input = 'test a first case'
			assert.deepEqual(input.extract(re), ['a', 'case'])
		})
		it('supports global captures', () => {
			var re = /\{(\w+)\}/g
			var input = '{a} first {test} case {for} global'
			assert.deepEqual(input.extract(re), ['a', 'test', 'for'])
		})
	})
	describe('json', () => {
		it('base case', () => {
			assert.deepEqual('{"a":"x", "b":"y"}'.json(), {a: "x", b: "y"})
		})
		it('handles empty strings', () => {
			assert.deepEqual(''.json(), {})
		})
		it('handles whitespace', () => {
			assert.deepEqual(' \t '.json(), {})
		})
	})
	describe('filename functions', () => {
		var fn = '/dir1/dir2/dir3/fn.ext1.ext2'
		it('extracts file name', () => {
			assert.equal(fn.path('filename'), 'fn.ext1.ext2')
		})
		it('default behaviour', () => {
			assert.equal(fn.path(), 'fn.ext1.ext2')
		})
		it('extracts base name', () => {
			assert.equal(fn.path('basename'), 'fn.ext1')
		})
		it('extracts path', () => {
			assert.equal(fn.path('dir'), '/dir1/dir2/dir3')
		})
	})
	describe('filesystem functions', () => {
		var d = os.tmpdir() + '/__tst__';
		it('resolves dots', () => {
			var path = require('path').resolve('.')
			assert.equal('.'.resolve(), path) 
		})
		it('resolves tildes', () => {
			var path = os.homedir() + '/tst'
			assert.equal('~/tst'.resolve(), path) 
		})
		it('creates a directory', () => {
			if (fs.existsSync(d)) rmdir(d)
			d.mkdir()
			assert.ok(fs.existsSync(d), 'directory not created')
		})
		it('creates a directory - recursive', () => {
			if (fs.existsSync(d)) rmdir(d)
			var path = d + '/d1/d2/d3'
			path.mkdir()
			assert.ok(fs.existsSync(path), 'directory not created')
		})
		it('creates file - form 1', () => {
			var path = d + '/f1.txt'
			if (fs.existsSync(path)) fs.unlinkSync(path)
			path.tee('contents of file 1')
			assert.ok(fs.existsSync(path))
		})
		it('creates file - form 2', () => {
			var path = d + '/f2.txt'
			if (fs.existsSync(path)) fs.unlinkSync(path)
			'contents of file 1'.tee(path)
			assert.ok(fs.existsSync(path))
		})
		it('creates a file symlink', () => {
			var path = d + '/sym1'
			path.symlink(d + '/f1.txt')
			assert.ok(fs.existsSync(path))
		})
		it('creates a directory symlink', () => {
			var path = d + '/sym2'
			path.symlink(d + '/d1')
			assert.ok(fs.existsSync(path))
		})
		it('copies file', () => {
			var orig = d + '/f1.txt'
			var dup = d + '/f3.txt'
			if (fs.existsSync(dup)) fs.unlinkSync(dup)

			orig.cp(dup)
			assert.ok(fs.existsSync(dup))
		})
		it('moves file', () => {
			var orig = d + '/f3.txt'
			var dup = d + '/f4.txt'
			if (fs.existsSync(dup)) fs.unlinkSync(dup)

			orig.mv(dup)
			assert.ok(fs.existsSync(dup))
			assert.ok(!fs.existsSync(orig))
		})
		it('removes file', () => {
			var path = d + '/f4.txt'
			path.rm();
			assert.ok(!fs.existsSync(path))
		})
		it('reads file', () => {
			var path = d + '/f1.txt'
			assert.equal(path.cat(), 'contents of file 1')
		})
		it('reads properties', () => {
			var path = d + '/f1.txt'
			var st = path.fstat()
			assert.ok(st instanceof fs.Stats)
		})
		it('reads directory', () => {
			assert.deepEqual(d.ls(), ['d1', 'f1.txt', 'f2.txt', 'sym1', 'sym2'])
		})
		it('reads full pathnames', () => {
			var actual = d.ls({fullpath: true})
			var m = actual[0].match(/.*\//)
			assert.ok(m, 'no path in filenames')
			assert.deepEqual(actual, [
				m[0] + 'd1', 
				m[0] + 'f1.txt', 
				m[0] + 'f2.txt', 
				m[0] + 'sym1', 
				m[0] + 'sym2'
			])
		})
		it('reads directory - entry objects', () => {
			var actual = d.ls({withFileTypes: true})
			assert.ok(actual[0] instanceof fs.Dirent)
			assert.equal(actual[0].name, 'd1')
		})
		it('reads directory - recursive', () => {
			var actual = d.ls({recurse: true})
			var expected = [
				'd1','d1/d2','d1/d2/d3',
				'f1.txt','f2.txt',
				'sym1','sym2'
			]
			assert.deepEqual(actual, expected.map(s => d + '/' + s))
		})
		it('reads directory - symlinks', () => {
			var actual = d.ls({followSymlinks: true, recurse: true})
			var expected = [
				'd1','d1/d2','d1/d2/d3',
				'f1.txt','f2.txt',
				'sym1','sym2','sym2/d2','sym2/d2/d3'
			]
			assert.deepEqual(actual, expected.map(s => d + '/' + s))
		})
		it('file existence', () => {
			var path = d + '/f1.txt'
			assert.ok(path.fex())
			path = d + '/x.txt'
			assert.ok(!path.fex())
		})
		it('directory existence', () => {
			assert.ok(d.fex())
		})
		it('stat - regular file', () => {
			var path = d + '/' + 'f1.txt'
			var st = path.fstat()
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isFile())
		})
		it('stat - directory', () => {
			var path = d + '/' + 'd1'
			var st = path.fstat()
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isDirectory())
		})
		it('stat - file symlink', () => {
			var path = d + '/' + 'sym1'
			var st = path.fstat({symlinks: true})
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isSymbolicLink())
		})
		it('stat - directory symlink', () => {
			var path = d + '/' + 'sym2'
			var st = path.fstat()
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isDirectory())
			assert.ok(!st.isSymbolicLink())
		})
		it('stat - directory symlink, follow', () => {
			var path = d + '/' + 'sym2'
			var st = path.fstat({symlinks: true})
			assert.ok(st instanceof fs.Stats)
			assert.ok(st.isSymbolicLink())
			assert.ok(!st.isDirectory())
		})
		// need to figure out what owner to change to
		it.skip('change ownership', () => {
			var path = d + '/f1.txt'
			var ost = fs.statSync(path)
			path.chown(1, 1)
			var nst = fs.statSync(path)
			assert.notEqual(nst.uid, ost.uid)
			assert.notEqual(nst.gid, ost.gid)
			path.chown(ost.uid, ost.gid)
		})
		it('change mode', () => {
			var path = d + '/f1.txt'
			var ost = fs.statSync(path)
			path.chmod(0)
			var nst = fs.statSync(path)
			assert.notEqual(ost.mode, nst.mode)
			path.chmod(ost.mode)
		})
		it('removes directory - single', () => {
			var path = d + '/d1/d2/d3'
			path.rmdir()
			assert.ok(!fs.existsSync(path), 'directory not removed')
		})
		it('removes directory - recursive', () => {
			d.rmdir({recurse: true})
			assert.ok(!fs.existsSync(d), 'directory not removed')
		})
	})
})

function rmdir(path) {
	if (!fs.existsSync(path)) return;
	var st = fs.statSync(path);
	if (st.isDirectory())
		fs.readdirSync(path).forEach(fn => fs.unlinkSync(path + '/' + fn))
	fs.rmdirSync(path)
}