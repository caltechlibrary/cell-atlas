#!/bin/sh

set -ev

Rscript -e "bookdown::render_book('index.Rmd', 'bookdown::gitbook')"
Rscript -e "bookdown::render_book('index.Rmd', 'bookdown::tufte_book2')"
Rscript -e "bookdown::render_book('index.Rmd', 'bookdown::epub_book')"

