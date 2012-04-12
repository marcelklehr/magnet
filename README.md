#  Magnet
### An interpreted programming language

Magnet is written in JavaScript for node.js using a modified version of Jan Max Meyer's [JS/CC](http://jscc.jmksf.com/) (a LARL(1) parser generator for JavaScript). It consist of three main things:

 * The interpreter, called Ferrite
 * The standart library (which currently does not, yet, exist -- simple programs work, though)
 * The command line interface for Ferrite

The API is changing very rapidly at the moment, so don't expect anything to last. I'm curretnly figuring out what feels best for me.
Submit any suggestions, questions or bugs to the [Issue Tracker](http://github.com/marcelklehr/tivoka/issues), though.

## Install
1. Well, download it.
2. Run `make`
3. Run `node cli sample/test.mg`

## License
Copyright (c) 2012 by Marcel Klehr
MIT (X11) License (see `LICENSE`)

Magnet is based upon  
JS/CC - A LALR(1) Parser Generator written in JavaScript
Copyright (c) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer
http://www.jmksf.com ++ jscc<-AT->jmksf.com