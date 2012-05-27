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
1. Make sure [node.js](http://nodejs.org/) is installed.
2. Download Magnet: [stable](https://github.com/marcelklehr/magnet/zipball/master) | [bleeding edge (recommended)](https://github.com/marcelklehr/magnet/zipball/develop)
3. Run `make`.

That's it. Now try  
`> magnet sample/test.mg` on Windows  
`$ ./magnet sample/test.mg` on UNIX

## License
Copyright (c) 2012 by Marcel Klehr  
MIT License (see `LICENSE`)

### Third-party software
This software uses a slightly modified version of JS/CC - A LALR(1) Parser Generator written in JavaScript (contained in `/jscc`)  
Copyright (c) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer jscc!AT!jmksf.com, http://www.jmksf.com  
3-clause BSD License (see `jscc/jscc.js` for more information)