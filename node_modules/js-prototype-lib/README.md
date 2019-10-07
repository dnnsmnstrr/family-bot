[![npm version](https://badge.fury.io/js/js-prototype-lib.svg)](https://badge.fury.io/js/js-prototype-lib)

# Javascript Prototype Library

This collection of native-type prototype extensions in Javascript helps make expressions 
more terse and improves legibility.  The argument could be made that its use is unadvisable
within browsers as your mileage may vary due to the instability of these implementations,
but in NodeJs it works (and comes with a test suite)

## Install / Import
The project is published on NPM so install is easy:
```
npm install js-prototype-lib
```
...and to use in your projects, simply import it:
```js
// import the module
const jsp = require('js-prototype-lib');

// install classes of extensions
jsp.install();                      // installs array and string
jsp.install('object');              // installs object prototypes (see warnings)
jsp.install('array', 'string');     // same as .install()

// and use them
console.log([1,2,3].last());        // should print 3

// if the extensions are no longer needed
// they can be uninstalled

jsp.uninstall('object');            // just object extensions
jsp.uninstall();                    // or all
```

## Extensions

The prototype extensions provided are documented separately by root object:

* [Strings](string.md)
* [Arrays](array.md)
* [Objects](object.md)

## Errors

Errors are not easily examinable, thus attempting to create a Json string from one will fail.
By installing the error module it is possible to extract the object within an error:
```js
const jsp = require('js-prototype-lib')
jsp.install('error')
try {
   throw new Error('test')
}
catch(e) {
    console.log(JSON.stringify(e))        // produces '{}', but
    console.log(JSON.stringify(e.obj()))  // generates {"message": "error", "stack": "Error: test\n at Context.it..."}
    console.log(e.json())                 // more easily
}
```

## Common

The objects *Array*, *String* *Object* and *Number* have also been marked up with properties
that facilitate determining their type.  This short-circuits the need to do `typeof x == '...'`
comparisons, which is inconsistent with arrays where the result is 'object'.  Additionally, the
`.typeof` property is also defined for each object

Below are the properties available:
```js
var x = '';
console.log(x.isStr);             // prints true
console.log(x.isArr);             // prints false
console.log(x.isObj);             // prints false
console.log(x.isNbr);             // prints false
console.log(x.typeof);            // prints 'string'
x = [];
console.log(x.isStr);             // prints false
console.log(x.isArr);             // prints true
console.log(x.isObj);             // prints false
console.log(x.isNbr);             // prints false
console.log(x.typeof);            // prints 'array'
x = {};
console.log(x.isStr);             // prints false
console.log(x.isArr);             // prints false
console.log(x.isObj);             // prints true
console.log(x.isNbr);             // prints false
console.log(x.typeof);            // prints 'object'
x = 0;
console.log(x.isStr);             // prints false
console.log(x.isArr);             // prints false
console.log(x.isObj);             // prints false
console.log(x.isNbr);             // prints true
console.log(x.typeof);            // prints 'number'
```

# Notes

As this module may be included at multiple levels of a project (a project includes it but a dependency
of the project also includes it), and the versions at each level differ, the codebase makes sure that
only the latest version available is installed.

To accomplish this the *Array*, *Object* and *String* objects are marked up with the attributes `library`
and `version`, thus to check what version is loaded you can:

```js
const jsp = require('js-prototype-lib')
console.log(jsp.version().SemVer)

// or load some functions and check the objects
jsp.install('string')
console.log(String.version)
```
both of which could show:

> 1.0.11

# Contribute

If you have an extension you're fond of, post an issue on Github.  We're happy to add new functionality

# Licence

MIT
