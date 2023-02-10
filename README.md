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

<u>This will delete the `site/` directory in the this script's working directory</u>. 
Videos are will not be included in the site build and need to be moved to a `videos` directory 
in 'site' directory.
Supplemental files (video preview images, narration, and pdb files) are required for the
site to function completely and are available to
[download from CaltechDATA](https://doi.org/10.22002/n91mg-zc832)


Offline versions of the cell atlas are automatically generated in the
`cell_atlas_offline` and `cell_atlas_offline_lite` directories, assuming you
have "video", "videos-480p", "narration", and "stillimages" directories present. 
In order to zip up the offline version, navigate to `cell_atlas_offline` and `cell_atlas_offline_lite` directories 
and use the command `zip -rX cell_atlas_offline_lite.zip *`

Getting help
------------

Please submit an issue using the issue tracker in this repo

Contributing
------------

You can submit change requests by submitting a pull request through GitHub.


License
-------

Software produced by the Caltech Library is Copyright (C) 2022, Caltech.  This software is freely distributed under a BSD/MIT type license.  Please see the [LICENSE](LICENSE) file for more information.

The book text is (C) 2022, Caltech.

Authors and Acknowledgments
---------------------------

Catherine M. Oikonomou and Grant J. Jensen wrote "Atlas of Bacterial and
Archaeal Cell Structure". See the [full list of
Acknowledgments in the book text](https://cellatlas.library.caltech.edu/introduction.html#acknowledgements).

Kian Badie, Tom Morrell, and Robert Doiel developed the software in this repository that automates book
formatting and integrates videos from CaltechDATA.

Software Development was funded by the California Institute of Technology
Library and the Jensen Lab.

"[File](https://thenounproject.com/search/?q=file&i=3723131)" icon by Vectorstall from [the Noun Project](https://thenounproject.com/).

"[Video](https://thenounproject.com/search/?q=video&i=2567858)" icon by i cons from [the Noun Project](https://thenounproject.com/).

"[Image](https://thenounproject.com/search/?q=image&i=3776456)" by Dooder from [the Noun Project](https://thenounproject.com/).

"[cycle](https://thenounproject.com/term/cycle/406578/)" by ImageCatalog from [the Noun Project](https://thenounproject.com/).
