# String Extensions

  ### sprintf [object | array]
  
  Very similar to the original C function but only accepts `%s` as the token replacement tag.
  In this mode the parameter passed must be an array
  e.g. `"It's a %s of %s".sprintf(["figure", "speech"])`

  As a secondary syntax, the method accepts an object with values to use as replacement
  and references are made with the `%{elem}` syntax
  e.g. `"Call my %{relative}".sprintf({relative: 'mother'})`
  
  ### chomp [regular-expression | string = '\n']

  Like its perl cousin, removes the string or regular expression from the end of the string.
  If left unspecified, defaults to a newline.  The function returns the new string

  ### tr <search-character-set> <replacement-character-set>

  Equivalent to the *bash* translate function, replaces characters in the search character set
  with those in the replacement character set.  The sets must be of equal length as the replacements
  are one-for-one e.g. `'double fast :)'.tr('a) ', 'i(_')` yields `'double_fist :('`

  ### replaceall search-str replace-str

  Does what `.replace()` should have done, allows for replacing more than one instance of a string
  with another

  ### unindent

  Useful for adjusting multi-line strings that, in order to conform to code indention, include
  indents that don't display well to the user.  Unlike with *bash* heredocs, the determinant
  factor is the opening tick:
  ```js
  // don't do this
  var o = {
    s: `first line
    second line`
  }
  // do this instead
  var o = {
    s: `
    first line
    second line
    `
  }
  ```
  The function respects embedding (with respect to the leading line) such that:
  ```js
  var o = {
    s: `
      first line
         second line
      third line
    `
  }
  console.log(o.s.unindent());
  ```
  displays:
  > first line
  >    second line
  > third line

  ### heredoc

  Adjusts the content of multi-line strings that represent paragraphs necessarily cut
  into separate lines for the sake of code neatness but that do not display well to 
  users.  The function requires developers to double their newlines to insert empty lines
  ```js
  var s = `
      This paragraph should be
      one continuous line but was cut
      into multiple lines
      \n
      This is a second paragraph
      `;
  console.log(s.heredoc())
  ```
  will display to users:
  > This paragraph should be one continuous line but was cut into multiple lines
  
  > This is a second paragraph

  ### uc / lc / tc

  Upper-case, lower-case and title-cases for strings.  Title case turns 'iN a liTTle bOOk' 
  into 'In a Little Book'

  ### q quote-set = "'"

  Quotes the string with the given character or character set.  If quote set
  is left unspecified, defaults to ticks.  The method will not double quote so
  passing `"'test'".q()` returns `'test'`, not `''test''`
  
  For characters sets the first character serves as opening and the second as
  closing e.g. `"test".q("{}")` results in `"{test}"`.  The function doesn't 
  close match so passing `"test".q("{")` results in `"{test{"`

  Additionally, the method respects embedded quotes and spacing so `"  Ender's game\t".q()`
  yields `"'  Ender's game\t'"` and `" 'test' "` produces `"' 'test' '"`

  Finally, as a convenience double quotes can be used to quote by passing an empty string
  e.g. `'test'.q("")` results in `"test"` -- this is equivalent but nicer than: `'test'.q('"')`

  ### keyval key-separator = "=", record-separator = "\n", quote-all = false

  Returns an object from a string containing key/value pairs where keys and records
  are separated by the given parameters

  The object produced will contain numbers where these are found in the source but
  if everything should be turned into a string the final parameter may be indicated
  as true

  ### arr [delimiter-character-set] [callback]

  Splits the string by the character set specified (which defaults to the set shown
  above) and returns the resulting array.  If an optional callback is supplied, the
  method will iterate through the resulting array, providing each element to the
  callback

  **Note: the default value for any method that accepts a `delimiter-character-set`
  is `'/|,;. \t\n'`, which notably breaks by spaces.  In such cases where spaces must
  be preserved, specify the character set explicitly**

  ### splitn [delimiter-character-set] [segments = 2]

  Splits a string into the number of segments specified, for example: `'this/that/these'.splitn()`
  will regenerate `['this', 'that/these']`.  If the number of segments specified is greater
  than those available, the function returns the shorter of the two.  Specifying a single
  segment will return the entire string in an array

  ### nth n [delimiter-character-set]

  Returns the nth value in a string separated by any of the characters in the delimiter
  set e.g. `'eth/eos/btc'.nth(0)` returns 'eth', `'eth eos btc'.nth(1)` returns 'eos', etc.

  The method can also accept negative indexes, which begin at the end of the array e.g.
  `'eth,eos,btc'.nth(-1)` returns 'btc'.  Though the set of delimiter characters is rather
  broad, you can also specify your own e.g. `'eth-eos-btc'.nth(0, '-')` returns 'eth'

  ### extract regular-expression empty = false

  Used to extract values from a string as specified in the regular expression passed.  
  
  Unlike regular matching, this function captures global and recursive capture groups i.e. 
  either by passing multiple capture sequences in the same expression, or by specifying
  the /g modifier to the regexp, which is not normally supported by the `.match()` method.

  **return value**
  Ordinarily the function returns an unpacked array i.e. when the array contains a single
  element then that element is returned instead.  If the return value is an empty array,
  the `empty` parameter can cause the function to return a) when set to `true`, the original
  string, or b) set to anything else returns what is passed

  Below are some examples:
  ```javascript
  // no match
  'now is the time'.extract(/(hello)/)                // returns []
  'now is the time'.extract(/(hello)/, true)          // returns 'now is the time'
  'now is the time'.extract(/(hello)/, 'awesome')     // returns 'awesome'
  
  // the query below provides multiple capture groups
  'now is the time for all good men'.extract(/now (\w+) the (\w+) for (\w+)/)
  // returns ['is', 'time', 'all']

  // the query below provides a recursive capture group
  'You say "goodbye" and I say "hello"'.extract(/"(\w+)"/g)
  // returns ['goodbye', 'hello']
  ```

  ### json

  Parses the given Json string, returning an object.  Empty or whitespace strings
  return an empty object instead of issuing an exception

  ### path [segment = 'filename']

  Parses the path provided, returning one of the following segments:

  * filename: removes directory information from a path
  * basename: strips path of directory and extension
  * dir: returns only the directory of the path
  
  ### resolve
  ### mkdir / rmdir / ls
  ### fex / chmod / chown / fstat
  ### cat / tee / cp / mv / rm / symlink

  This family of functions provides filesystem functionality on file paths.
  The functions make use of the *Sync* versions in the 'fs' package and behave 
  pretty much like their bash equivalents

  **- Notes -**
  The `.resolve()` method is more-or-less equivalent to `require('path').resolve()` 
  and can be used to expand double-dots, relative paths, etc. e.g. `'..'.resolve()` 
  yields the full path to the parent directory.  However, this method also resolves
  tildes, which are defined as equivalent to the return of `os.homedir()` -- thus
  `'~/.bashrc`.resolve()` returns the full path to the bash resource file
  
  Both `mkdir` and `rmdir` both recurse e.g. `'/tmp/a/b/c/d'.mkdir()` creates
  each component in the path as needed, but in the case of the latter an 
  explicit directive is needed i.e. `'/tmp/a'.rmdir()` will fail but
  `'/tmp/a'.rmdir({recurse: true})` succeeds
  
  Symlinks take the target as a parameter, so `'sym1'.symlink('/tmp/x')` creates
  a symlink called `sym1` pointing to `/tmp/x`

  The `tee` method is used for writing to files but has two modes, 1) where the
  argument specifies the path, and 2) where the object the method is called on
  serves as the path
  
  The determining factor for which is which is the presence of slashes in the argument,
  but this creates ambiguity.  Consider the third call below where neither is clearly
  a path (because there are no slashes).  In this case, the the argument is presumed
  to be data, but this can be forced with the option shown:
  ```js
  '/tmp/t.txt'.tee('sample text')           // these two calls
  'sample text'.tee('/tmp/t.txt')           // are equivalent

  't'.tee('sample text')                    // this call is ambiguous so the argument is presumed data
  'sample text'.tee('t', {argIsPath: true}) // the option forces the argument to serve as a path
  ```

  The `ls` command accepts two optional parameters, a filter (a regular expression) to match
  names against, and an options object, which is passed to the underlying `fs.readdirSync()`
  method.  Options may be passed without supplying a regular expression and vice-versa.  If
  passing only options, the key `filter` may be passed, in addition to `fullpath`, a boolean
  value that causes the filenames to be returned with a full path
  
  Like `rmdir`, this method also supports an explicit recursion directive, therefore
  `'/tmp'.ls({recurse: true})` will return the entire tree under the /tmp directory.  The
  attribute 'symlinks` is also supported such that when set to true recursive listings
  will follow symlinks

  Additionally, Node versions below 10 do not support the `withFileTypes` option but this
  method polyfills so the output is consistent:
  ```js
  var d = '/var/log';
  d.ls()                        // could return ['system.log', 'mail.log', 'postfix.log']
  d.ls(/^s/)                    // regular expressions are nicer.  returns: ['system.log']
  d.ls({withFileTypes: true})   // returns fs.Dirent objects
  ```
  Other examples:
  ```javascript
  '~/.profile'.cat()    // would return the contents of your profile
  'x.tst'.rm()          // removes the file
  '~/t.txt'.mv('/tmp')  // would move t.txt in your home directory to the /tmp
  
  // cat accepts an encoding
  var s = '~/.bashrc'.cat('utf8')
  ```