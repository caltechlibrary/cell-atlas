import os
import csv

host = 'https://www.cellstructureatlas.org'
siteDir = 'site'
lines = []
doiFileNameDict = {}
files = [f for f in os.listdir(siteDir) if os.path.isfile('{}/{}'.format(siteDir, f))]

with open("dois.csv", "r", encoding='utf-8') as csvfile:
    for row in csv.DictReader(csvfile): doiFileNameDict[ row["DOI"] ] = row["movie"]

lines.append('<?xml version="1.0" encoding="UTF-8"?>\n')
lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
for file in files:
    if(file == "searchData.json" or file == "search-test.html"): continue
    lines.append('\t<url>\n')
    if(file == "index.html"): file = ""
    lines.append('\t\t<loc>{}/{}</loc>\n'.format(host, file))
    lines.append('\t</url>\n')
lines.append('</urlset>')

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.writelines(lines)