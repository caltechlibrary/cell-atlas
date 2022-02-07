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
    pageName = os.path.basename(fileName)
    pageName = os.path.splitext(pageName)[0]
    pageName = pageName.replace("-0-", "-")
    return pageName

def getYAMLMetadata(fileName):
    return json.loads( subprocess.check_output(["pandoc", "--from=markdown", "--to=plain", "--template=templates/metadata.tmpl", fileName]) )

def addDocumentToBibList(fileName, bibData, bibList):
    bodyText = subprocess.check_output(["pandoc", "--from=markdown", "--to=markdown", fileName]).decode("utf-8")
    for match in re.finditer(r"\[@.*?]", bodyText): 
        bibId = match.group().strip("[@]")
        if bibData[bibId] not in bibList: bibList.append(bibData[bibId])

def addPageToBibList(fileName, bibData, bibList):
    metadata = getYAMLMetadata(fileName)
    addDocumentToBibList(fileName, bibData, bibList)
    if "subsections" in metadata:
        for subsectionFileName in metadata["subsections"]: 
            addDocumentToBibList(f"subsections/{subsectionFileName}.md", bibData, bibList)

def getFormattedBodyTextHTML(fileName, bibList):
    bodyText = subprocess.check_output(["pandoc", "--from=markdown-citations", "--to=html", fileName]).decode("utf-8")
    for match in re.finditer(r"\[@.*?]", bodyText): 
        bibId = match.group().strip("[@]")
        bodyText = bodyText.replace(match.group(), f'[<a href="D-references.html#ref-{bibId}">{bibList.index(bibData[bibId]) + 1}</a>]')
    return bodyText

def getFormattedBodyTextPlain(fileName, bibList):
    bodyText = subprocess.check_output(["pandoc", "--from=markdown", "--to=plain", fileName]).decode("utf-8")
    for match in re.finditer(r"\[@.*?]", bodyText): 
        bibId = match.group().strip("[@]")
        bodyText = bodyText.replace(match.group(), f"[{bibList.index(bibData[bibId]) + 1}]")
    return bodyText

def createSearchDataDocument(fileName, id, bibList, searchData, titlePrefix):
    metadata = getYAMLMetadata(fileName)
    document = {}
    document["id"] = id
    document["title"] = metadata["title"]
    document["content"] = getFormattedBodyTextPlain(fileName, bibList)
    if "species" in metadata: document["species"] = metadata["species"]
    if "collector" in metadata: document["collector"] = metadata["collector"]
    if "structure" in metadata: document["structure"] = ", ".join([structure.strip() for structure in metadata["structure"].split(",")])
    if titlePrefix is not None: document["titlePrefix"] = titlePrefix
    searchData[document["id"]] = document

def addPageToSearchData(fileName, bibList, searchData):
    metadata = getYAMLMetadata(fileName)
    titlePrefix = None
    subsectionTitlePrefix = None
    if os.path.dirname(fileName) == "sections":
        chapter = os.path.basename(fileName).split("-")[0]
        section = os.path.basename(fileName).split("-")[1]
        titlePrefix = f"{chapter}.{section}" if section != "0" else chapter
        subsectionTitlePrefix = f"{titlePrefix} {metadata['title']}:"

    createSearchDataDocument(fileName, f"{getPageName(fileName)}.html", bibList, searchData, titlePrefix)

    if "subsections" in metadata:
        for subsectionFileName in metadata["subsections"]: 
            createSearchDataDocument(f"subsections/{subsectionFileName}.md", f"{getPageName(fileName)}.html#{subsectionFileName}", bibList, searchData, subsectionTitlePrefix)


def getVidPlayerMetadata(fileName):
    fileMetadata = getYAMLMetadata(fileName)
    vidPlayerMetadata = {}
    vidPlayerMetadata["vidName"] = fileMetadata["video"].split(".")[0]
    vidPlayerMetadata["thumbnail"] = f"{'_'.join(fileMetadata['video'].split('_', 2)[:2])}_thumbnail"
    if "doi" in fileMetadata: vidPlayerMetadata["doi"] = fileMetadata["doi"]
    return vidPlayerMetadata

def getCompSliderMetadata(fileName):
    fileMetadata = getYAMLMetadata(fileName)
    compSliderMetadata = {}
    compSliderMetadata["imgName"] = fileMetadata["video"].split(".")[0]
    return compSliderMetadata

def getCitationMetadata(fileName):
    fileMetadata = getYAMLMetadata(fileName)
    citationMetadata = {}
    if "species" in fileMetadata: 
        citationMetadata["species"] = fileMetadata["species"]
        citationMetadata["speciesId"] = fileMetadata["species"].replace(" ", "-")
    if "collector" in fileMetadata: 
        citationMetadata["collector"] = fileMetadata["collector"]
        if fileMetadata["collector"] in profileData:
            citationMetadata["collectorProfile"] = True
            citationMetadata["collectorId"] = profileData[fileMetadata["collector"]]["id"]
    if "doi" in fileMetadata: citationMetadata["doi"] = fileMetadata["doi"]
    if "source" in fileMetadata:
        citationMetadata["sources"] = []
        sources = [source.strip() for source in fileMetadata["source"].split(',')]
        for source in sources:
            id = source.strip("[@]")
            if id in bibData: 
                name = bibData[id]["author"][0]["family"] 
                if len(bibData[id]["author"]) > 1: name = f"{name} et al."
                year = bibData[id]["issued"]["date-parts"][0][0]
                citationMetadata["sources"].append({"text": f"{name} ({year})", "link": f"D-references.html#ref-{id}.html"})
        if(len(citationMetadata["sources"]) >= 1): citationMetadata["sources"][-1]["last"] = True
    return citationMetadata

def getProgressMetadata(fileName, navData):
    fileMetadata = getYAMLMetadata(fileName)
    progressMetadata = {}
    # Find entry in nav data with the same page name
    for navEntry in navData["navList"]:
        if "title" in navEntry and navEntry["title"] == fileMetadata["title"]:
            progressMetadata["currentPageNum"] = navEntry["pageNum"]
        elif "sections" in navEntry:
            for sectionEntry in navEntry["sections"]:
                if "title" in sectionEntry and sectionEntry["title"] == fileMetadata["title"]: progressMetadata["currentPageNum"] = sectionEntry["pageNum"]
    progressMetadata["totalPages"] = navData["totalPages"]
    progressMetadata["progPercent"] = (progressMetadata["currentPageNum"] / navData["totalPages"]) * 100
    progressMetadata["displayPercent"] = round(progressMetadata["progPercent"])
    progressMetadata["chapterPageNums"] = [ { "progPercent": navEntry["progPercent"] } for navEntry in navData["navList"] if "isChapter" in navEntry ]
    return progressMetadata

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

def buildSectionMetadata(fileName, metadata):
    # Get media viewer metadata
    if "doi" in metadata:
        metadata["mediaViewer"] = {}
        metadata["mediaViewer"]["isSection"] = True
        metadata["mediaViewer"]["vidPlayer"] = getVidPlayerMetadata(fileName)
        metadata["mediaViewer"]["vidPlayer"]["isSection"] = True
        if metadata["title"] != "Introduction":
            metadata["mediaViewer"]["hasTabMenu"] = True
            metadata["mediaViewer"]["compSlider"] = getCompSliderMetadata(fileName)
            metadata["mediaViewer"]["compSlider"]["isSection"] = True
    # Create narration metadata
    metadata["narration"] = {}
    metadata["narration"]["src"] = metadata["pageName"]
    metadata["narration"]["isSection"] = True
    # Create citation data
    if "doi" in metadata:
        metadata["citation"] = getCitationMetadata(fileName)
        metadata["citation"]["isSection"] = True
    # Process subsections
    if "subsections" in metadata:
        metadata["subsectionsData"] = []
        for subsectionFileName in metadata["subsections"]:
            subsectionData = getYAMLMetadata(f"subsections/{subsectionFileName}.md")
            subsectionData["id"] = subsectionFileName

            # Format body text to insert links
            subsectionData["body"] = getFormattedBodyTextHTML(f"subsections/{subsectionFileName}.md", usedBibs)

            # Get media viewer metadata
            if "doi" in subsectionData or "video" in  subsectionData or "graphic" in subsectionData:
                subsectionData["hasMainMediaViewer"] = True
                subsectionData["mediaViewer"] = {}
                subsectionData["mediaViewer"]["id"] = subsectionData["id"]
                if "doi" in subsectionData or "video" in  subsectionData:
                    subsectionData["mediaViewer"]["hasTabMenu"] = True
                    subsectionData["mediaViewer"]["vidPlayer"] = getVidPlayerMetadata(f"subsections/{subsectionFileName}.md")
                    subsectionData["mediaViewer"]["compSlider"] = getCompSliderMetadata(f"subsections/{subsectionFileName}.md")
                elif "graphic" in subsectionData:
                    subsectionData["mediaViewer"]["graphic"] = subsectionData["graphic"]
            # Create narration metadata
            subsectionData["narration"] = {}
            subsectionData["narration"]["id"] = subsectionData["id"]
            subsectionData["narration"]["src"] = subsectionData["id"]
            # Create citation data
            if "doi" in subsectionData or "source" in subsectionData:
                subsectionData["citation"] = getCitationMetadata(f"subsections/{subsectionFileName}.md")
                subsectionData["mediaViewer"]["citationAttached"] = True
            
            metadata["subsectionsData"].append(subsectionData)

siteDir = "site"
sectionFileNames = sorted(os.listdir("sections"), key=lambda s: (int(s.split("-")[0]), int(s.split("-")[1])))
appendixFileNames = os.listdir("appendix")
profileFileNames = sorted(os.listdir("profiles"), key=lambda s: s.split("-")[-1])
speciesData = {}

# Create site directory with assets
if os.path.isdir(siteDir): shutil.rmtree(siteDir)
os.mkdir(siteDir)
shutil.copytree("img/", f"{siteDir}/img")
shutil.copytree("styles/", f"{siteDir}/styles")
shutil.copytree("js/", f"{siteDir}/js")

# Create navigation menu data for site
navData = {}
navData["navList"] = []
navData["totalPages"] = len(sectionFileNames) + 3
navData["navList"].append({ "title": "Introduction", "page": "introduction", "pageNum": 1 })
for pageNum, fileName in enumerate(sectionFileNames, 2):
    metadata = getYAMLMetadata(f"sections/{fileName}")
    chapter = fileName.split("-")[0]
    section = fileName.split("-")[1]
    navEntry = {}
    navEntry["chapter"] = chapter
    navEntry["title"] = metadata["title"]
    navEntry["page"] = getPageName(fileName)
    navEntry["pageNum"] = pageNum
    if section == "0":
        navEntry["sections"] = []
        navEntry["isChapter"] = True
        navEntry["progPercent"] = (pageNum / navData["totalPages"]) * 100
        navData["navList"].append(navEntry)
    else:
         navEntry["section"] = section
         navData["navList"][-1]["sections"].append(navEntry)
navData["navList"].append({
    "title": "Outlook",
    "page": "outlook",
    "pageNum": len(sectionFileNames) + 2,
    "isChapter": "true",
    "sections": [{ "title": "Keep Looking", "page": "keep-looking", "pageNum": navData["totalPages"] }],
    "progPercent": ((len(sectionFileNames) + 2) / navData["totalPages"]) * 100
})
navData["navList"].append({ "chapter": "Appendix", "isAppendix": True })
navData["navList"].append({ "chapter": "A", "title": "Feature Index", "page": "A-feature-index" })
navData["navList"].append({ "chapter": "B", "title": "Scientist Profiles", "page": "B-scientist-profiles" })
navData["navList"].append({ "chapter": "C", "title": "Phylogenetic Tree", "page": "C-phylogenetic-tree" })
navData["navList"].append({ "chapter": "D", "title": "References", "page": "D-references" })

# Generate profiles data
profileData = {}
for profileFileName in profileFileNames:
    profileMetadata = getYAMLMetadata(f"profiles/{profileFileName}")
    profileMetadata["id"] = profileMetadata["title"].title().replace(" ", "")
    profileMetadata["html"] = subprocess.check_output(["pandoc", "--from=markdown", "--to=html", f"profiles/{profileFileName}"]).decode("utf-8")
    profileData[profileMetadata["title"]] = profileMetadata

# Generate bibliography data
bibData = { ref["id"]: ref for ref in json.loads( subprocess.check_output(["pandoc", "--to=csljson", "AtlasBibTeX.bib"]) ) }
usedBibs = []
addPageToBibList("begin.md", bibData, usedBibs)
addPageToBibList("introduction.md", bibData, usedBibs)
for fileName in sectionFileNames: addPageToBibList(f"sections/{fileName}", bibData, usedBibs)
addPageToBibList("outlook.md", bibData, usedBibs)
addPageToBibList("keep-looking.md", bibData, usedBibs)

# Generate search data
searchData = {}
addPageToSearchData("begin.md", usedBibs, searchData)
addPageToSearchData("introduction.md", usedBibs, searchData)
for fileName in sectionFileNames: addPageToSearchData(f"sections/{fileName}", usedBibs, searchData)
addPageToSearchData("outlook.md", usedBibs, searchData)
addPageToSearchData("keep-looking.md", usedBibs, searchData)
with open("{}/searchData.json".format(siteDir), "w", encoding="utf-8") as f: json.dump(searchData, f, indent="\t")

# Render landing page
subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={siteDir}/index.html", "--template=templates/index.tmpl", "index.md"])

# Render begin page
metadata = getYAMLMetadata("begin.md")
metadata["nav"] = navData["navList"]
metadata["nextSection"] = "introduction"
metadata["typeChapter"] = True
metadata["body"] = getFormattedBodyTextHTML("begin.md", usedBibs)
writePage("begin.md", "begin", metadata)

# Render introduction page
metadata = getYAMLMetadata("introduction.md")
metadata["pageName"] = "introduction"
metadata["nav"] = navData["navList"]
metadata["prevSection"] = "begin"
metadata["nextSection"] = getPageName(sectionFileNames[0])
metadata["typeSection"] = True
metadata["body"] = getFormattedBodyTextHTML("introduction.md", usedBibs)
for key, value in getProgressMetadata("introduction.md", navData).items(): metadata[key] = value
buildSectionMetadata("introduction.md", metadata)
addPageToSpeciesData(metadata) 
writePage("introduction.md", metadata["pageName"], metadata)

# Render pages in sections/
for i, fileName in enumerate(sectionFileNames):
    metadata = getYAMLMetadata(f"sections/{fileName}")

    # Generate chapter/section metadata
    metadata["chapter"] = fileName.split("-")[0]
    if fileName.split("-")[1] == "0":
        metadata["typeChapter"] = True
    else:
        metadata["section"] = fileName.split("-")[1]
        metadata["typeSection"] = True

    # Generate next/prev section metadata
    if i == 0:
        metadata["prevSection"] = "introduction"
    else: 
        metadata["prevSection"] = getPageName(sectionFileNames[i - 1])
    if i == len(sectionFileNames) - 1:
        metadata["nextSection"] = "outlook"
    else:
        metadata["nextSection"] = getPageName(sectionFileNames[i + 1])

    # Generate general metadata
    metadata["pageName"] = getPageName(fileName)
    metadata["nav"] = navData["navList"]
    metadata["body"] = getFormattedBodyTextHTML(f"sections/{fileName}", usedBibs)
    for key, value in getProgressMetadata(f"sections/{fileName}", navData).items(): metadata[key] = value
    if "typeSection" in metadata:
        buildSectionMetadata(f"sections/{fileName}", metadata)
        addPageToSpeciesData(metadata) 
    
    metadata["navData"] = { "nav": True }

    writePage(f"sections/{fileName}", metadata["pageName"], metadata)

# Render outlook page
metadata = getYAMLMetadata("outlook.md")
metadata["pageName"] = "outlook"
metadata["nav"] = navData["navList"]
metadata["prevSection"] = getPageName(sectionFileNames[-1])
metadata["nextSection"] = "keep-looking"
metadata["typeChapter"] = True
metadata["body"] = getFormattedBodyTextHTML("outlook.md", usedBibs)
for key, value in getProgressMetadata("outlook.md", navData).items(): metadata[key] = value
writePage("outlook.md", metadata["pageName"], metadata)

# Render keep looking page
metadata = getYAMLMetadata("keep-looking.md")
metadata["pageName"] = "keep-looking"
metadata["nav"] = navData["navList"]
metadata["prevSection"] = "outlook"
metadata["nextSection"] = "A-feature-index"
metadata["typeSection"] = True
metadata["body"] = getFormattedBodyTextHTML("keep-looking.md", usedBibs)
for key, value in getProgressMetadata("keep-looking.md", navData).items(): metadata[key] = value
buildSectionMetadata("keep-looking.md", metadata)
addPageToSpeciesData(metadata) 
writePage("keep-looking.md", metadata["pageName"], metadata)

# Render appendix pages
for i, fileName in enumerate(appendixFileNames):
    metadata = getYAMLMetadata(f"appendix/{fileName}")
    metadata["pageName"] = os.path.splitext(fileName)[0]
    metadata["chapter"] = fileName.split("-")[0]
    metadata["nav"] = navData["navList"]
    metadata["typeAppendix"] = True

    # Generate next/prev section metadata
    if(i == 0):
        metadata["prevSection"] = "keep-looking"
    else: 
        metadata["prevSection"] = os.path.splitext(appendixFileNames[i - 1])[0]
    if(i != len(appendixFileNames) - 1):
        metadata["nextSection"] = os.path.splitext(appendixFileNames[i + 1])[0]

    if fileName == "A-feature-index.md":
        metadata["appendixTypeFeatures"] = True
        with open("features.json", "r", encoding="utf-8") as f:
            featureIndexData = json.load(f)
            metadata["accordionData"] = [{"title": key, "id": key.title().replace(" ", ""), "refs": featureIndexData[key]} for key in featureIndexData]
    elif fileName == "B-scientist-profiles.md":
        metadata["appendixTypeProfiles"] = True
        metadata["accordionData"] = list(profileData.values())
    elif fileName == "C-phylogenetic-tree.md":
        metadata["appendixTypeTree"] = True
        metadata["speciesList"] = [speciesEntry for speciesEntry in speciesData.values()]
        metadata["treeData"] = { "id": "treeViewer", "speciesList": metadata["speciesList"] }
        metadata["treeViewerFsConfirmData"] = { "id": "treeViewerFsConfirm", "treeViewerFsConfirm": True }
    elif fileName == "D-references.md":
        metadata["appendixTypeReferences"] = True

    if fileName == "D-references.md":
        with open("bib.json", "w", encoding='utf-8') as f: json.dump(usedBibs, f)
        with open("metadata.json", "w", encoding='utf-8') as f: json.dump(metadata, f)
        subprocess.run(["pandoc", "--from=csljson", "--citeproc", "--csl=springer-socpsych-brackets.csl", "--to=html", f"--output={siteDir}/{metadata['pageName']}.html", "--template=templates/page.tmpl", "--metadata-file=metadata.json", "bib.json"])
        os.remove("metadata.json")
        os.remove("bib.json")
    else:
        writePage(f"appendix/{fileName}", metadata["pageName"], metadata)

# Render about page
metadata = getYAMLMetadata("about.md")
metadata["pageName"] = "about"
metadata["nav"] = navData["navList"]
metadata["typeAppendix"] = True
metadata["appendixTypeAbout"] = True
metadata["feedbackData"] = { "id": "feedback", "feedback": True }
metadata["accordionData"] = []
with open("about.md", 'r', encoding='utf-8') as f:
    for line in f.readlines():
        if re.search(r"##", line):
            entry = {}
            entry["title"] = line.split("##")[1].strip()
            entry["content"] = ""
            entry["id"] = re.sub(r"[^\w\s]", "", entry["title"].replace(" ", "-"))
            metadata["accordionData"].append(entry)
        elif not re.search(r"---", line) and not re.search("title: About this Book", line):
            metadata["accordionData"][-1]["content"] = metadata["accordionData"][-1]["content"] + line    
writePage("about.md", metadata["pageName"], metadata)

# Render download page
metadata = getYAMLMetadata("download.md")
metadata["pageName"] = "download"
metadata["nav"] = navData["navList"]
metadata["typeAppendix"] = True
metadata["appendixTypeDownload"] = True
writePage("download.md", metadata["pageName"], metadata)