import os
import shutil
import subprocess
import json
import re

def getPageName(fileName):
    pageName = os.path.splitext(fileName)[0]
    pageName.replace("-0-", "-")
    return pageName

siteDir = "site"
sectionFileNames = sorted(os.listdir("sections"), key=lambda s: (int(s.split("-")[0]), int(s.split("-")[1])))
bibData = json.loads( subprocess.check_output(["pandoc", "--to=csljson", "AtlasBibTeX.bib"]) )
usedBibs = []

# Create site directory with assets
if os.path.isdir(siteDir): shutil.rmtree(siteDir)
os.mkdir(siteDir)
shutil.copytree("img/", f"{siteDir}/img")
shutil.copytree("styles/", f"{siteDir}/styles")
shutil.copytree("js/", f"{siteDir}/js")

# Render landing page
subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={siteDir}/index.html", "--template=templates/index.tmpl", "index.md"])

# Render pages in sections/
for i, fileName in enumerate(sectionFileNames):
    # Initialize metadata with yaml metadata in markdown file
    metadata = json.loads( subprocess.check_output(["pandoc", "--template=templates/metadata.tmpl", f"sections/{fileName}"]) )

    metadata["chapter"] = fileName.split("-")[0]
    metadata["section"] = fileName.split("-")[1]
    if(i > 0): metadata["prevSection"] = getPageName(sectionFileNames[i - 1])
    if(i < len(sectionFileNames) - 1): metadata["nextSection"] = getPageName(sectionFileNames[i + 1])
    if(metadata["section"] == "0"):
        metadata["typeChapter"] = True
    else:
        metadata["typeSection"] = True

    # Format body text to insert links
    metadata["body"] = subprocess.check_output(["pandoc", "--from=markdown", "--to=markdown", f"sections/{fileName}"]).decode("utf-8")
    for match in re.finditer(r"\[@.*?]", metadata["body"]): 
        bibId = match.group().strip("[@]")
        if bibId not in usedBibs: usedBibs.append(bibId)
        metadata["body"] = metadata["body"].replace(match.group(), f"[[{usedBibs.index(bibId) + 1}](D-references.html#ref-{bibId})]")

    metadata["mediaViewer"] = {}
    metadata["mediaViewer"]["hasTabMenu"] = True
    metadata["mediaViewer"]["isSection"] = True

    # Create video metadata
    if "doi" in metadata:
        metadata["mediaViewer"]["vidPlayer"] = {}
        metadata["mediaViewer"]["vidPlayer"]["doi"] = metadata["doi"]
        metadata["mediaViewer"]["vidPlayer"]["vidName"] = metadata["video"].split(".")[0]
        metadata["mediaViewer"]["vidPlayer"]["thumbnail"] = f"{metadata['chapter']}_{metadata['section']}_thumbnail"
        metadata["mediaViewer"]["vidPlayer"]["isSection"] = getPageName(fileName)

    # Create comp slider metadata
    if "doi" in metadata:
        metadata["mediaViewer"]["compSlider"] = {}
        metadata["mediaViewer"]["compSlider"]["imgName"] = metadata["video"].split(".")[0]
        metadata["mediaViewer"]["compSlider"]["isSection"] = getPageName(fileName)
    
    # Create narration metadata
    if "doi" in metadata:
        metadata["narration"] = {}
        metadata["narration"]["id"] = "main"
        metadata["narration"]["src"] = getPageName(fileName)
        metadata["narration"]["isSection"] = getPageName(fileName)

    # Create citation data
    if "doi" in metadata:
        metadata["citation"] = {}
        metadata["citation"]["species"] = metadata["species"]
        metadata["citation"]["collector"] = metadata["collector"]
        metadata["citation"]["doi"] = metadata["doi"]

    with open("metadata.json", "w", encoding='utf-8') as f: json.dump(metadata, f)

    subprocess.run([
        "pandoc", 
        "--from=markdown", 
        "--to=html", 
        f"--output={siteDir}/{getPageName(fileName)}.html", 
        "--template=templates/page.tmpl",
        "--metadata-file=metadata.json",
        f"sections/{fileName}"
    ])

    os.remove("metadata.json")