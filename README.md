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

Offline versions of the cell atlas are automatically generated in the
`cell_atlas_offline` and `cell_atlas_offline_lite` directories. In order to
package these for release, you need to copy in the full resolution or 480p
videos into a directory called `videos`. You will also need to copy the 
'stillimages' folder of preview images for the
movies to the 'img' folder. Then zip up the cell atlas using the 
command `zip -rX cell_atlas_offline_lite.zip *`

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

"[File](https://thenounproject.com/search/?q=file&i=3723131)" icon by Vectorstall from [the Noun Project](https://thenounproject.com/).

"[Video](https://thenounproject.com/search/?q=video&i=2567858)" icon by i cons from [the Noun Project](https://thenounproject.com/).

"[play button](https://thenounproject.com/search/?q=play+button&i=2467761)" by Assyifa Art from [the Noun Project](https://thenounproject.com/).

"[pause](https://thenounproject.com/search/?q=pause+button&i=1738044)" by amantaka from [the Noun Project](https://thenounproject.com/).

"[Fullscreen](https://thenounproject.com/search/?q=fullscreen&i=1953799)" by Nociconist from [the Noun Project](https://thenounproject.com/).

"[chevron](https://thenounproject.com/search/?q=chevron&i=933246)" by Numero Uno from [the Noun Project](https://thenounproject.com/).

"[Image](https://thenounproject.com/search/?q=image&i=3776456)" by Dooder from [the Noun Project](https://thenounproject.com/).

"[triangle](https://thenounproject.com/term/triangle/2309918/)" by Nawicon from [the Noun Project](https://thenounproject.com/).

"[X](https://thenounproject.com/search/?q=x&i=2222119)" by Imam from [the Noun Project](https://thenounproject.com/).

"[play](https://thenounproject.com/search/?q=play&i=86420)" by Slicon from [the Noun Project](https://thenounproject.com/).

"[Plus](https://thenounproject.com/search/?q=plus&i=705287)" by Eagle Eye from [the Noun Project](https://thenounproject.com/).

"[Minus](https://thenounproject.com/term/minus/705290/)" by Eagle Eye from [the Noun Project](https://thenounproject.com/).

"[Check](https://thenounproject.com/search/?q=check&i=3850095)" by Justin Henry from [the Noun Project](https://thenounproject.com/).

"[up and down](https://thenounproject.com/search/?q=up+and+down&i=3861732)" by Mas Dhimas from [the Noun Project](https://thenounproject.com/).

"[broken image](https://thenounproject.com/search/?q=broken+image&i=3157423)" by Pelin Kahraman from [the Noun Project](https://thenounproject.com/).

"[cycle](https://thenounproject.com/term/cycle/406578/)" by ImageCatalog from [the Noun Project](https://thenounproject.com/).