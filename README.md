#  Magnet
### An interpreted programming language

Magnet is written in JavaScript for [node.js](http://nodejs.org/). It consists of three main things:

 * The interpreter, called Ferrite
 * The standart library (which currently does not, yet, exist -- simple programs work, though)
 * The command line interface for Ferrite

## Install
1. Make sure [node.js](http://nodejs.org/) is installed.
1. [Download](https://github.com/marcelklehr/magnet/zipball/master) Magnet.
2. Run `make`.

That's it. Now try  
`> magnet sample/test.mg` on Windows  
`$ ./magnet sample/test.mg` on UNIX

## Contributing
Every contribution is greatly appreciated! You will just need [node.js](http://nodejs.org/), [git](http://git-scm.com) and a [github account](https://github.com/signup/free). [Fork](http://help.github.com/fork-a-repo/) this repo, [clone](http://git-scm.com/docs/git-clone) your fork, create a [feature branch](https://www.google.com/search?q=git+feature+branches), [commit](http://git-scm.com/docs/git-commit), [push](http://git-scm.com/docs/git-push) and submit a [pull request](http://help.github.com/send-pull-requests/).

Submit any suggestions, questions or bugs to the [Issue Tracker](http://github.com/marcelklehr/magnet/issues). Also, have a look at the [wiki](http://github.com/marcelklehr/magnet/wiki).

## License
Copyright (c) 2012 by Marcel Klehr  
MIT License (see `LICENSE`)

### Third-party software
This software uses a slightly modified version of JS/CC - A LALR(1) Parser Generator written in JavaScript (contained in `/jscc`)  
Copyright (c) 2007, 2008 by J.M.K S.F. Software Technologies, Jan Max Meyer jscc!AT!jmksf.com, http://www.jmksf.com  
3-clause BSD License (see `jscc/jscc.js` for more information)