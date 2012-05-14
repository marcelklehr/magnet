#  Magnet
### An interpreted programming language

The Magnet language is written in JavaScript for node.js. It consist of three main things:

 * The interpreter, called `Ferrite`
 * The standart library (which currently does not, yet, exist -- simple programs work, though)
 * The command line interface for Ferrite

The API is changing very rapidly at the moment, so don't expect anything to last. I'm curretnly figuring out what feels best for me.
Submit any suggestions, questions or bugs to the [Issue Tracker](http://github.com/marcelklehr/tivoka/issues), though.

## Install
1. [Download](https://github.com/marcelklehr/magnet/zipball/master) it.
2. Run `make`

That's it. Now try runnig `node cli sample/test.mg`.

## License
Copyright (c) 2012 by Marcel Klehr  
MIT License (see `LICENSE`)

This software uses a slightly modified version of:

JS/CC - A LALR(1) Parser Generator written in JavaScript (contained in `/jscc`)  
Copyright (c) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer <jscc<-AT->jmksf.com>, http://www.jmksf.com  
*JS/CC is licensed under the terms of the 3-clause BSD License (see `jscc/jscc.js` for more information).*