Cell atlas
=====================================================

Source for the "Atlas of Bacterial and Archaeal Cell Structure" by Catherine M.
Oikonomou and Grant J. Jensen.

Table of contents
-----------------

* [Installation](#installation)
* [Usage](#usage)
* [Getting help](#getting-help)
* [Contributing](#contributing)
* [License](#license)
* [Authors and history](#authors-and-acknowledgments)


Installation
------------

Install [Pandoc](https://pandoc.org/index.html) Version >= 2.11 and [Python](https://www.python.org/) Version >=3.

Usage
-----

Run the build script using:

```
python3 _build.py
# or (depending on python configuration)
python _build.py
```

<u>This will delete the `site/` directory in the this script's working directory</u>. Videos are will not be included in the site build by default and will only be included in the generated site if there exists a `videos` directory in this script's working directory.

Getting help
------------

Please submit an issue using the issue tracker in this repo

Contributing
------------

You can submit change requests by submitting a pull request through GitHub.


License
-------

Software produced by the Caltech Library is Copyright (C) 2020, Caltech.  This software is freely distributed under a BSD/MIT type license.  Please see the [LICENSE](LICENSE) file for more information.

The book text is (C) 2020, Caltech.

Authors and Acknowledgments
---------------------------

Catherine M. Oikonomou and Grant J. Jensen wrote "Atlas of Bacterial and
Archaeal Cell Structure". See the [full list of
Acknowledgments in the book text](https://cellatlas.library.caltech.edu/introduction.html#acknowledgements).

Kian Badie, Tom Morrell, and Robert Doiel developed the software in this repository that automates book
formatting and integrates videos from CaltechDATA.

Software Development was funded by the California Institute of Technology
Library and the Jensen Lab.

"[Download](https://thenounproject.com/search/?q=download&i=1570345)" icon by Kimmi Studio from [the Noun Project](https://thenounproject.com/).

"[File](https://thenounproject.com/search/?q=file&i=3723131)" icon by Vectorstall from [the Noun Project](https://thenounproject.com/).

"[Video](https://thenounproject.com/search/?q=video&i=2567858)" icon by i cons from [the Noun Project](https://thenounproject.com/).
