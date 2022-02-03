import os
import shutil
import subprocess
import json
import re

def writePage(source, pageName, metadata):
    with open("metadata.json", "w", encoding='utf-8') as f: json.dump(metadata, f)
    subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={siteDir}/{pageName}.html", "--template=templates/page.tmpl", "--metadata-file=metadata.json", source])
    os.remove("metadata.json")

def getPageName(fileName):
    pageName = os.path.splitext(fileName)[0]
    pageName.replace("-0-", "-")
    return pageName

def getYAMLMetadata(fileName):
    return json.loads( subprocess.check_output(["pandoc", "--from=markdown", "--to=plain", "--template=templates/metadata.tmpl", fileName]) )

def getFormattedBodyText(fileName):
    bodyText = subprocess.check_output(["pandoc", "--from=markdown-citations", "--to=html", fileName]).decode("utf-8")
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
    if "collector" in metadata: 
        citationMetadata["collector"] = metadata["collector"]
        if metadata["collector"] in profileData:
            citationMetadata["collectorProfile"] = True
            citationMetadata["collectorId"] = profileData[metadata["collector"]]["id"]
    if "doi" in metadata: citationMetadata["doi"] = metadata["doi"]
    if "source" in metadata:
        citationMetadata["sources"] = []
        sources = [source.strip() for source in metadata["source"].split(',')]
        for source in sources:
            id = source.strip("[@]")
            if id in bibData: 
                name = bibData[id]["author"][0]["family"] 
                if len(bibData[id]["author"]) > 1: name = f"{name} et al."
                year = bibData[id]["issued"]["date-parts"][0][0]
                citationMetadata["sources"].append({"text": f"{name} ({year})", "link": f"D-references.html#ref-{id}.html"})
        if(len(citationMetadata["sources"]) >= 1): citationMetadata["sources"][-1]["last"] = True
    return citationMetadata

def buildProgressBarData(pageNum, metadata):
    metadata["currentPageNum"] = pageNum
    metadata["totalPages"] = len(sectionFileNames) + 3
    metadata["progPercent"] = (metadata["currentPageNum"] / metadata["totalPages"]) * 100
    metadata["displayPercent"] = round(metadata["progPercent"])
    metadata["chapterPageNums"] = [ { "progPercent": navEntry["progPercent"] } for navEntry in navData if "isChapter" in navEntry ]

def addSpeciesEntryToSpeciesData(species, speciesEntry):
    if(species in speciesData):
        speciesData[species]["speciesRefs"].append(speciesEntry)
    else:
        speciesData[species] = {}
        speciesData[species]["species"] = species
        speciesData[species]["speciesRefs"] = [ speciesEntry ]
        speciesData[species]["id"] = species.replace(" ", "-")

def addPageToSpeciesData(metadata):
    if "species" in metadata:
        speciesEntry = {}
        speciesEntry["title"] =  metadata["title"]
        speciesEntry["page"] =  f"{metadata['pageName']}.html"
        if "chapter" in metadata: speciesEntry["chapter"] = metadata["chapter"]
        if "section" in metadata: speciesEntry["section"] = metadata["section"]
        addSpeciesEntryToSpeciesData(metadata["species"], speciesEntry)
    if "subsections" in metadata:
        for subsectionFileName in metadata["subsections"]:
            subsectionData = getYAMLMetadata(f"subsections/{subsectionFileName}.md")
            if "species" in subsectionData:
                speciesEntry = {}
                speciesEntry["title"] =  f"{metadata['title']}: {subsectionData['title']}"
                speciesEntry["page"] =  f"{metadata['pageName']}.html#{subsectionFileName}"
                if "chapter" in metadata: speciesEntry["chapter"] = metadata["chapter"]
                if "section" in metadata: speciesEntry["section"] = metadata["section"]
                addSpeciesEntryToSpeciesData(subsectionData["species"], speciesEntry)


def buildSectionMetadata(metadata):
    # Get media viewer metadata
    if "doi" in metadata:
        metadata["mediaViewer"] = {}
        metadata["mediaViewer"]["isSection"] = True
        metadata["mediaViewer"]["vidPlayer"] = getVidPlayerMetadata(metadata)
        metadata["mediaViewer"]["vidPlayer"]["isSection"] = True
        if metadata["title"] != "Introduction":
            metadata["mediaViewer"]["hasTabMenu"] = True
            metadata["mediaViewer"]["compSlider"] = getCompSliderMetadata(metadata)
            metadata["mediaViewer"]["compSlider"]["isSection"] = True
    # Create narration metadata
    metadata["narration"] = {}
    metadata["narration"]["src"] = metadata["pageName"]
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
            if "doi" in subsectionData or "video" in  subsectionData or "graphic" in subsectionData:
                subsectionData["hasMainMediaViewer"] = True
                subsectionData["mediaViewer"] = {}
                subsectionData["mediaViewer"]["id"] = subsectionData["id"]
                if "doi" in subsectionData or "video" in  subsectionData:
                    subsectionData["mediaViewer"]["hasTabMenu"] = True
                    subsectionData["mediaViewer"]["vidPlayer"] = getVidPlayerMetadata(subsectionData)
                    subsectionData["mediaViewer"]["compSlider"] = getCompSliderMetadata(subsectionData)
                elif "graphic" in subsectionData:
                    subsectionData["mediaViewer"]["graphic"] = subsectionData["graphic"]
            # Create narration metadata
            subsectionData["narration"] = {}
            subsectionData["narration"]["id"] = subsectionData["id"]
            subsectionData["narration"]["src"] = subsectionData["id"]
            # Create citation data
            if "doi" in subsectionData or "source" in subsectionData:
                subsectionData["citation"] = getCitationMetadata(subsectionData)
                subsectionData["mediaViewer"]["citationAttached"] = True
            
            metadata["subsectionsData"].append(subsectionData)

siteDir = "site"
sectionFileNames = sorted(os.listdir("sections"), key=lambda s: (int(s.split("-")[0]), int(s.split("-")[1])))
profileFileNames = sorted(os.listdir("profiles"), key=lambda s: s.split("-")[-1])
profileData = {}
for profileFileName in profileFileNames:
    profileMetadata = getYAMLMetadata(f"profiles/{profileFileName}")
    profileMetadata["id"] = profileMetadata["title"].title().replace(" ", "")
    profileMetadata["html"] = getFormattedBodyText(f"profiles/{profileFileName}")
    profileData[profileMetadata["title"]] = profileMetadata
speciesData = {}
bibData = { ref["id"]: ref for ref in json.loads( subprocess.check_output(["pandoc", "--to=csljson", "AtlasBibTeX.bib"]) ) }
usedBibs = []

# Create site directory with assets
if os.path.isdir(siteDir): shutil.rmtree(siteDir)
os.mkdir(siteDir)
shutil.copytree("img/", f"{siteDir}/img")
shutil.copytree("styles/", f"{siteDir}/styles")
shutil.copytree("js/", f"{siteDir}/js")

# Create navigation menu data for site
navData = []
navData.append({ "title": "Introduction", "page": "introduction" })
for page, fileName in enumerate(sectionFileNames, 2):
    metadata = getYAMLMetadata(f"sections/{fileName}")
    chapter = fileName.split("-")[0]
    section = fileName.split("-")[1]
    navEntry = {}
    navEntry["chapter"] = chapter
    navEntry["title"] = metadata["title"]
    navEntry["page"] = getPageName(fileName)
    if section == "0":
        navEntry["sections"] = []
        navEntry["isChapter"] = True
        navEntry["progPercent"] = (page / (len(sectionFileNames) + 3)) * 100
        navData.append(navEntry)
    else:
         navEntry["section"] = section
         navData[-1]["sections"].append(navEntry)
navData.append({
    "title": "Outlook",
    "page": "outlook",
    "isChapter": "true",
    "sections": [{ "title": "Keep Looking", "page": "keep-looking" }],
    "progPercent": ((len(sectionFileNames) + 2) / (len(sectionFileNames) + 3)) * 100
})
navData.append({ "chapter": "Appendix", "isAppendix": True })
navData.append({ "chapter": "A", "title": "Feature Index", "page": "A-feature-index" })
navData.append({ "chapter": "B", "title": "Scientist Profiles", "page": "B-scientist-profiles" })
navData.append({ "chapter": "C", "title": "Phylogenetic Tree", "page": "C-phylogenetic-tree" })
navData.append({ "chapter": "D", "title": "References", "page": "D-references" })

# Render landing page
subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={siteDir}/index.html", "--template=templates/index.tmpl", "index.md"])

# Render begin page
metadata = getYAMLMetadata("introQuote.md")
metadata["nav"] = navData
metadata["nextSection"] = "introduction"
metadata["typeChapter"] = True
metadata["body"] = getFormattedBodyText("introQuote.md")
writePage("introQuote.md", "begin", metadata)

# Render introduction page
metadata = getYAMLMetadata("introduction.md")
metadata["pageName"] = "introduction"
metadata["nav"] = navData
metadata["prevSection"] = "begin"
metadata["nextSection"] = getPageName(sectionFileNames[0])
metadata["typeSection"] = True
metadata["body"] = getFormattedBodyText("introduction.md")
buildProgressBarData(1, metadata)
buildSectionMetadata(metadata)
addPageToSpeciesData(metadata) 
writePage("introduction.md", metadata["pageName"], metadata)

# Render pages in sections/
for i, fileName in enumerate(sectionFileNames):
    metadata = getYAMLMetadata(f"sections/{fileName}")

    # Generate data specefic to pages in sections/ folder
    metadata["chapter"] = fileName.split("-")[0]
    metadata["section"] = fileName.split("-")[1]
    if(i == 0):
        metadata["prevSection"] = "introduction"
    else: 
        metadata["prevSection"] = getPageName(sectionFileNames[i - 1])
    if(i == len(sectionFileNames) - 1):
        metadata["nextSection"] = "outlook"
    else:
        metadata["nextSection"] = getPageName(sectionFileNames[i + 1])
    if(metadata["section"] == "0"):
        metadata["typeChapter"] = True
    else:
        metadata["typeSection"] = True

    # Generate general metadata
    metadata["pageName"] = getPageName(fileName)
    metadata["nav"] = navData
    metadata["body"] = getFormattedBodyText(f"sections/{fileName}")
    buildProgressBarData(i + 2, metadata)
    if "typeSection" in metadata:
        buildSectionMetadata(metadata)
        addPageToSpeciesData(metadata) 
    
    writePage(f"sections/{fileName}", metadata["pageName"], metadata)

# Render outlook page
metadata = getYAMLMetadata("outlook.md")
metadata["pageName"] = "outlook"
metadata["nav"] = navData
metadata["prevSection"] = getPageName(sectionFileNames[-1])
metadata["nextSection"] = "keep-looking"
metadata["typeChapter"] = True
metadata["body"] = getFormattedBodyText("outlook.md")
buildProgressBarData(len(sectionFileNames) + 2, metadata)
writePage("outlook.md", metadata["pageName"], metadata)

# Render keep looking page
metadata = getYAMLMetadata("keepLooking.md")
metadata["pageName"] = "keep-looking"
metadata["nav"] = navData
metadata["prevSection"] = "outlook"
metadata["nextSection"] = "A-feature-index"
metadata["typeSection"] = True
metadata["body"] = getFormattedBodyText("keepLooking.md")
buildProgressBarData(len(sectionFileNames) + 3, metadata)
buildSectionMetadata(metadata)
addPageToSpeciesData(metadata) 
writePage("keepLooking.md", metadata["pageName"], metadata)

# Render feature index page
metadata = getYAMLMetadata("features.md")
metadata["pageName"] = "A-feature-index"
metadata["chapter"] = "A"
metadata["nav"] = navData
metadata["prevSection"] = "keep-looking"
metadata["nextSection"] = "B-scientist-profiles"
metadata["typeAppendix"] = True
metadata["appendixTypeFeatures"] = True
with open("features.json", "r", encoding="utf-8") as f:
    featureIndexData = json.load(f)
    metadata["accordionData"] = [{"title": key, "id": key.title().replace(" ", ""), "refs": featureIndexData[key]} for key in featureIndexData]
writePage("features.md", metadata["pageName"], metadata)

# Render profiles page
metadata = getYAMLMetadata("profiles.md")
metadata["pageName"] = "B-scientist-profiles"
metadata["chapter"] = "B"
metadata["nav"] = navData
metadata["prevSection"] = "A-feature-index"
metadata["nextSection"] = "C-phylogenetic-tree"
metadata["typeAppendix"] = True
metadata["appendixTypeProfiles"] = True
metadata["accordionData"] = list(profileData.values())
writePage("profiles.md", metadata["pageName"], metadata)

# Render phylogenetic tree page
metadata = getYAMLMetadata("profiles.md")
metadata["pageName"] = "C-phylogenetic-tree"
metadata["chapter"] = "C"
metadata["nav"] = navData
metadata["prevSection"] = "B-scientist-profiles"
metadata["nextSection"] = "D-references"
metadata["typeAppendix"] = True
metadata["appendixTypeTree"] = True
metadata["speciesList"] = [speciesEntry for speciesEntry in speciesData.values()]
metadata["treeData"] = { "id": "treeViewer", "speciesList": metadata["speciesList"] }
metadata["treeViewerFsConfirmData"] = { "id": "treeViewerFsConfirm", "treeViewerFsConfirm": True }
writePage("phylogenetics.md", metadata["pageName"], metadata)