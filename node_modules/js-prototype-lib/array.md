# Array Extensions

   ### lc / uc

   Uppercases or lowercases every element in the array.  Non-destructive so use it this
   way: `var ls = ['a','b','c']; ls = ls.uc()`

   ### unique
   
   As the name suggests, returns the contents or the array, without duplicates
   
   ### trim
   
   Trims the contents of the array.  Elements in the array are only trimmed if they are strings
   
   ### flat
   
   Flattens nested arrays.  This method behaves identically to the implementation available 
   in NodeJs 11.0.0 and serves as a polyfill for older versions
   
   ### last n = 0
   
   Returns the last element in the array, if called without arguments.  If passed an
   integer, the nth element from the tail is returned e.g. `.last(1)` returns the penultimate
   element, `.last(2)` the element before it, etc.
   
   ### unpack
   
   If the array contains a single element, this extension returns it, otherwise it returns
   the array.  If any argument is passed to the method and the array is empty, `undefined`
   is returned

   ### keyval key = 'k', val = 'v'

   Converts a key/value array into an object where the array elements are expected to have
   a key and a value with the names passed to this function e.g. `{k: 'a', v: 3}` which 
   converts to `{a: 3}`.  In such cases where there are multiple values per key, the method
   will concatenate appropriately e.g. `[{a:1},{a:2},{a:3}]` evaluates to `{a: [1,2,3]}`

   ### indexOfObj filter

   Searches through an array using the *filter* function provided and returns the index
   number of the first object found, -1 if none is found

   ### json

   Converts the array to a Json string

   ### item key, val

   Extracts an item from an array of objects by specifying the key and value sought.  When
   multiple items match only the first found is returned.  The `val` parameter may specify
   a regular expression, in which case it is matched against the array elements

   ### contains val

   Returns a boolena indicating whether the passed value exists within the array.  Please note
   the method works only for scalar values, not objects

   ### split max

   Breaks up an array into an array of arrays containing no more than `max` elements each.  As
   an example: `['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].split(3)` results in:
   `[['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h']]`
