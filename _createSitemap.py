import os
import pathlib

sectionFiles = sorted(os.listdir('sections'), key=lambda s: (int(s.split('-')[0]), int(s.split('-')[1])))
appendixFiles = sorted(os.listdir('appendix'))
host = 'https://www.cellstructureatlas.org'
lines = []

def addSiteMapEntry(sourceFile):
    pageName = pathlib.Path(sourceFile).stem.replace('-0-', '-')
    outFile = f'{pageName}.html' if pageName != 'index' else ''
    lines.append('\t<url>\n')
    lines.append(f'\t\t<loc>{host}/{outFile}</loc>\n')
    lines.append('\t</url>\n')

lines.append('<?xml version="1.0" encoding="UTF-8"?>\n')
lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
addSiteMapEntry('index.md')
addSiteMapEntry('begin.md')
addSiteMapEntry('introduction.md')
for file in sectionFiles: addSiteMapEntry(f'sections/{file}')
addSiteMapEntry('outlook.md')
addSiteMapEntry('keep-looking.md')
for file in appendixFiles: addSiteMapEntry(f'appendix/{file}')
addSiteMapEntry('about.md')
addSiteMapEntry('download.md')
lines.append('</urlset>')

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.writelines(lines)