import os
import subprocess
import json
import pathlib

sectionFiles = sorted(os.listdir('sections'), key=lambda s: (int(s.split('-')[0]), int(s.split('-')[1])))
appendixFiles = sorted(os.listdir('appendix'))
host = 'https://www.cellstructureatlas.org'
lines = []

def addSiteMapEntry(sourceFile):
    metadata = json.loads(subprocess.check_output(['pandoc', '--from=markdown', '--to=plain', '--template=templates/metadata.txt', sourceFile]))
    pageName = pathlib.Path(sourceFile).stem.replace("-0-", "-")

    lines.append('\t<url>\n')
    lines.append(f'\t\t<loc>{host}/{pageName}.html</loc>\n')
    if("doi" in metadata):
        videoName = pathlib.Path(metadata['video']).stem
        lines.append('\t\t<video:video>\n')
        lines.append(f'\t\t\t<video:thumbnail_loc>{host}/img/thumbnails/{videoName}_thumbnail.jpg</video:thumbnail_loc>\n')
        lines.append(f'\t\t\t<video:title>{metadata["title"]}</video:title>\n')
        lines.append(f'\t\t\t<video:description>{metadata["description"]}</video:description>\n')
        lines.append(f'\t\t\t<video:content_loc>{host}/videos/{metadata["video"]}</video:content_loc>\n')
        lines.append('\t\t</video:video>\n')
    lines.append('\t</url>\n')

lines.append('<?xml version="1.0" encoding="UTF-8"?>\n')
lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n')
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