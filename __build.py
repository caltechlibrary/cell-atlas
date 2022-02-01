import os
import shutil
import subprocess
import json
import re

def getPageName(fileName):
    pageName = os.path.splitext(fileName)[0]
    pageName.replace("-0-", "-")
    return pageName

def getYAMLMetadata(fileName):
    return json.loads( subprocess.check_output(["pandoc", "--template=templates/metadata.tmpl", fileName]) )

def getFormattedBodyText(fileName):
    bodyText = subprocess.check_output(["pandoc", "--from=markdown", "--to=markdown", fileName]).decode("utf-8")
    for match in re.finditer(r"\[@.*?]", bodyText): 
        bibId = match.group().strip("[@]")
        if bibId not in usedBibs: usedBibs.append(bibId)
        bodyText = bodyText.replace(match.group(), f"[[{usedBibs.index(bibId) + 1}](D-references.html#ref-{bibId})]")
    return bodyText

def getVidPlayerMetadata(metadata):
    vidPlayerMetadata = {}
    vidPlayerMetadata["vidName"] = metadata["video"].split(".")[0]
    vidPlayerMetadata["thumbnail"] = f"{'_'.join(metadata['video'].split('_', 2)[:2])}_thumbnail"
    if "doi" in metadata: vidPlayerMetadata["doi"] = metadata["doi"]
    return vidPlayerMetadata

def getCompSliderMetadata(metadata):
    compSliderMetadata = {}
    compSliderMetadata["imgName"] = metadata["video"].split(".")[0]
    return compSliderMetadata

def getCitationMetadata(metadata):
    citationMetadata = {}
    if "species" in metadata: citationMetadata["species"] = metadata["species"]
    if "collector" in metadata: citationMetadata["collector"] = metadata["collector"]
    if "doi" in metadata: citationMetadata["doi"] = metadata["doi"]
    if "source" in metadata: citationMetadata["sources"] = metadata["source"]
    return citationMetadata

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
    metadata = getYAMLMetadata(f"sections/{fileName}")
    
    # Start generating metadata to be used in page template
    metadata["chapter"] = fileName.split("-")[0]
    metadata["section"] = fileName.split("-")[1]
    if(i > 0): metadata["prevSection"] = getPageName(sectionFileNames[i - 1])
    if(i < len(sectionFileNames) - 1): metadata["nextSection"] = getPageName(sectionFileNames[i + 1])
    if(metadata["section"] == "0"):
        metadata["typeChapter"] = True
    else:
        metadata["typeSection"] = True

    # Format body text to insert links
    metadata["body"] = getFormattedBodyText(f"sections/{fileName}")

    if "typeSection" in metadata:
        # Get media viewer metadata
        if "doi" in metadata:
            metadata["mediaViewer"] = {}
            metadata["mediaViewer"]["isSection"] = True
            metadata["mediaViewer"]["hasTabMenu"] = True
            metadata["mediaViewer"]["vidPlayer"] = getVidPlayerMetadata(metadata)
            metadata["mediaViewer"]["vidPlayer"]["isSection"] = True
            metadata["mediaViewer"]["compSlider"] = getCompSliderMetadata(metadata)
            metadata["mediaViewer"]["compSlider"]["isSection"] = True
        # Create narration metadata
        metadata["narration"] = {}
        metadata["narration"]["src"] = getPageName(fileName)
        metadata["narration"]["isSection"] = True
        # Create citation data
        if "doi" in metadata: 
            metadata["citation"] = getCitationMetadata(metadata)
            metadata["citation"]["isSection"] = True
        # Process subsections
        if "subsections" in metadata:
            metadata["subsectionsData"] = []
            for subsectionFileName in metadata["subsections"]:
                subsectionData = getYAMLMetadata(f"subsections/{subsectionFileName}.md")
                subsectionData["id"] = subsectionFileName

                # Format body text to insert links
                subsectionData["body"] = getFormattedBodyText(f"subsections/{subsectionFileName}.md")

                # Get media viewer metadata
                if "doi" in subsectionData or "video" in  subsectionData:
                    subsectionData["mediaViewer"] = {}
                    subsectionData["mediaViewer"]["id"] = subsectionData["id"]
                    subsectionData["mediaViewer"]["citationAttached"] = True
                    subsectionData["mediaViewer"]["hasTabMenu"] = True
                    subsectionData["mediaViewer"]["vidPlayer"] = getVidPlayerMetadata(subsectionData)
                    subsectionData["mediaViewer"]["compSlider"] = getCompSliderMetadata(subsectionData)
                    subsectionData["hasMainMediaViewer"] = True
                # Create narration metadata
                subsectionData["narration"] = {}
                subsectionData["narration"]["id"] = subsectionData["id"]
                subsectionData["narration"]["src"] = subsectionData["id"]
                # Create citation data
                if "doi" in subsectionData or "source" in subsectionData: subsectionData["citation"] = getCitationMetadata(subsectionData)
                
                metadata["subsectionsData"].append(subsectionData)

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