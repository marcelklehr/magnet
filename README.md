#  Magnet
### An <del>interpreted</del> awesome programming language

Magnet is an object-oriented programming language, that is prototype-based to the point of real types being absent in favor of duck types.  
E.g. every object providing a `read` method that returns a readable, is considered "readable" (meaning it can represent a string). Since this causes a recursion, there must be some "primal" readable to end that: Such primal readable is also known as a String Object in Magnet.

Furthermore, Magnet is syntax driven. This means: Everything that can be done to reduce code, retain simplicity and to amaze the developer, IS done!

## Example
```
5 * {puts '5 times'}
```
Displays '5 times' five times.

```
'Hello':split.each({char :: puts char})
```
Displays 'Hello', with each character on a new line.

Learn more about Magnet in [the docs](http://github.com/marcelklehr/magnet/wiki/docs).

## Install
If you have [npm](http://npmjs.org/), just do: `npm install -g magnet`

That's it! Now try `magnet test.mg`, after copying the [test file](https://github.com/marcelklehr/magnet/blob/develop/sample/test.mg) to `test.mg`.

### Installing from source
1. Download Magnet ([stable](https://github.com/marcelklehr/magnet/zipball/master) or [bleeding edge (recommended)](https://github.com/marcelklehr/magnet/zipball/develop)), or grab the repo using `git clone git://github.com/marcelklehr/magnet.git`
2. Run `make`.

Now try `$ ./bin/magnet sample/test.mg`  
or `> node bin/magnet sample/test.mg` on windows

## License
Copyright (c) 2012 by Marcel Klehr  
MIT License (see `LICENSE`)

### Third-party software
This software uses a slightly modified version of JS/CC - A LALR(1) Parser Generator written in JavaScript (contained in `/jscc`)  
Copyright (c) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer jscc!AT!jmksf.com, http://www.jmksf.com  
3-clause BSD License (see `jscc/jscc.js` for more information)