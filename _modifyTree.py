import sys
import re
import os

fileName = sys.argv[1]
outFile = sys.argv[2]
newFileLines = []

if os.path.exists(outFile):
    raise ValueError("The givin out file already exists")

with open(fileName, "r") as file:
    for line in file:
        if re.search(r"<text" , line):
            speciesName = re.sub("</text>" , "", line.split(">", 1)[1].strip()).strip()
            speciesId = speciesName.replace(" ", "-")
            newLine = '\t\t\t<a class="book-appendix-tree-species-entry" id="{}">{}</a>\n'.format(speciesId, line.strip())
            newFileLines.append(newLine)
        else:
            newFileLines.append(line)

with open(outFile, "w") as file:
    for line in newFileLines:
        file.write(line)