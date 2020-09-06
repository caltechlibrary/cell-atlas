#!/bin/sh

set -ev

python3 format_text.py *.txt
Rscript -e "bookdown::render_book('index.Rmd', 'bookdown::gitbook')"
# Rscript -e "bookdown::render_book('index.Rmd', 'bookdown::tufte_book2')"
# Rscript -e "bookdown::render_book('index.Rmd', 'bookdown::epub_book')"
Rscript -e "rmarkdown::render('splash/splash.Rmd', 'html_document', output_file = '../index.html')"

