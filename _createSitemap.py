import os
import csv
import subprocess
import json

def getMarkdownMetadata(file):
    process = subprocess.run(args=["pandoc", "--template=templates/metadata.tmpl", file], stdout=subprocess.PIPE)
    return json.loads(process.stdout)

def addSiteMapEntry(sourceFile, outFileName):
    metadata = getMarkdownMetadata(sourceFile) if sourceFile else None
    lines.append('\t<url>\n')
    lines.append('\t\t<loc>{}/{}</loc>\n'.format(host, outFileName))
    if(metadata and "doi" in metadata):
        videoFile = doiFileNameDict[metadata["doi"]]
        lines.append('\t\t<video:video>\n')
        lines.append('\t\t\t<video:thumbnail_loc>{}/img/thumbnails/{}_thumbnail.jpg</video:thumbnail_loc>\n'.format(host, "_".join(videoFile.split("_")[:2])))
        lines.append('\t\t\t<video:title>{}</video:title>\n'.format(metadata["title"]))
        lines.append('\t\t\t<video:description>Microbiology textbook video highlighting {}</video:description>\n'.format(metadata["title"]))
        lines.append('\t\t\t<video:content_loc>{}/videos/{}</video:content_loc>\n'.format(host, videoFile))
        lines.append('\t\t</video:video>\n')
    lines.append('\t</url>\n')

sectionFiles = sorted(os.listdir("sections"), key=lambda s: (int(s.split("-")[0]), int(s.split("-")[1])))
host = 'https://www.cellstructureatlas.org'
lines = []
doiFileNameDict = {}

with open("dois.csv", "r", encoding='utf-8') as csvfile:
    for row in csv.DictReader(csvfile): doiFileNameDict[ row["DOI"] ] = row["movie"]

lines.append('<?xml version="1.0" encoding="UTF-8"?>\n')
lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n')
addSiteMapEntry(sourceFile=None, outFileName="")
addSiteMapEntry(sourceFile=None, outFileName="begin.html")
addSiteMapEntry("introduction.md", "introduction.html")
for file in sectionFiles: addSiteMapEntry("sections/{}".format(file), "{}.html".format(file.split(".")[0].replace("-0", "")))
addSiteMapEntry(sourceFile=None, outFileName="outlook.html")
addSiteMapEntry("keepLooking.md", "keep-looking.html")
addSiteMapEntry(sourceFile=None, outFileName="A-feature-index.html")
addSiteMapEntry(sourceFile=None, outFileName="B-scientist-profiles.html")
addSiteMapEntry(sourceFile=None, outFileName="C-phylogenetic-tree.html")
addSiteMapEntry(sourceFile=None, outFileName="D-references.html")
addSiteMapEntry(sourceFile=None, outFileName="about.html")
addSiteMapEntry(sourceFile=None, outFileName="download.html")
lines.append('</urlset>')

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.writelines(lines)