import os
import shutil
import subprocess
import json
import re
import copy

def createSiteDir(siteDir):
    if os.path.isdir(siteDir): shutil.rmtree(siteDir)
    os.mkdir(siteDir)
    shutil.copytree("img/", f"{siteDir}/img")
    shutil.copytree("styles/", f"{siteDir}/styles")
    shutil.copytree("js/", f"{siteDir}/js")

def createOfflineDir(siteDir, version):
    createSiteDir(siteDir)
    shutil.copytree("stillimages/", f"{siteDir}/img/stillimages")
    shutil.copytree("narration/", f"{siteDir}/audio")
    if version == "full":
        shutil.copytree("videos/", f"{siteDir}/videos")
    elif version == "lite":
        shutil.copytree("videos-480p/", f"{siteDir}/videos")

def writePage(siteDir, source, pageName, metadata):
    with open("metadata.json", "w", encoding='utf-8') as f: json.dump(metadata, f)
    subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={siteDir}/{pageName}.html", "--template=templates/page.html", "--metadata-file=metadata.json", source])
    os.remove("metadata.json")

def writePageOffline(siteDirOffline, siteDirOfflineLite, source, pageName, metadata):
    offlineMetadata = copy.deepcopy(metadata)

    offlineMetadata["offline"] = { "full": True }
    writePage(siteDirOffline, source, pageName, offlineMetadata)

    offlineMetadata["offline"] = { "lite": True }
    writePage(siteDirOfflineLite, source, pageName, offlineMetadata)

def getPageName(fileName):
    pageName = os.path.basename(fileName)
    pageName = os.path.splitext(pageName)[0]
    pageName = pageName.replace("-0-", "-")
    return pageName

def getYAMLMetadata(fileName):
    return json.loads( subprocess.check_output(["pandoc", "--from=markdown", "--to=plain", "--template=templates/metadata.txt", fileName]) )

def addPageToBibList(fileName, bibList, bibDict):
    metadata = getYAMLMetadata(fileName)
    addDocumentToBibList(fileName, bibList, bibDict)
    if "subsections" in metadata:
        for subsectionFileName in metadata["subsections"]: 
            addDocumentToBibList(f"subsections/{subsectionFileName}.md", bibList, bibDict)

def addDocumentToBibList(fileName, bibList, bibDict):
    bodyText = subprocess.check_output(["pandoc", "--from=markdown", "--to=plain", fileName]).decode("utf-8")
    for match in re.finditer(r"\[@.*?]", bodyText): 
        bibId = match.group().strip("[@]")
        if bibDict[bibId] not in bibList: bibList.append(bibDict[bibId])

def getFormattedBodyText(fileName, format, bibList, bibDict):
    bodyText = subprocess.check_output(["pandoc", "--from=markdown-citations", f"--to={format}", fileName]).decode("utf-8")
    for match in re.finditer(r"\[@.*?]", bodyText): 
        bibId = match.group().strip("[@]")
        bibNum = bibList.index(bibDict[bibId]) + 1
        if format == "html":
            bodyText = bodyText.replace(match.group(), f'[<a href="D-references.html#ref-{bibId}">{bibNum}</a>]')
        elif format == "plain":
            bodyText = bodyText.replace(match.group(), f"[{bibNum}]")
    return bodyText

def addPageToSearchData(fileName, bibList, bibDict, searchData):
    metadata = getYAMLMetadata(fileName)
    titlePrefix = None
    subsectionTitlePrefix = None
    if os.path.dirname(fileName) == "sections":
        chapter = os.path.basename(fileName).split("-")[0]
        section = os.path.basename(fileName).split("-")[1]
        titlePrefix = f"{chapter}.{section}" if section != "0" else chapter
        subsectionTitlePrefix = f"{titlePrefix} {metadata['title']}:"

    createSearchDataDocument(fileName, f"{getPageName(fileName)}.html", bibList, bibDict, searchData, titlePrefix)

    if "subsections" in metadata:
        for subsectionFileName in metadata["subsections"]: 
            createSearchDataDocument(f"subsections/{subsectionFileName}.md", f"{getPageName(fileName)}.html#{subsectionFileName}", bibList, bibDict, searchData, subsectionTitlePrefix)

def createSearchDataDocument(fileName, id, bibList, bibDict, searchData, titlePrefix):
    metadata = getYAMLMetadata(fileName)
    document = {}
    document["id"] = id
    document["title"] = metadata["title"]
    document["content"] = getFormattedBodyText(fileName, "plain", bibList, bibDict)
    if "species" in metadata: document["species"] = metadata["species"]
    if "collector" in metadata: document["collector"] = metadata["collector"]
    if "structure" in metadata: document["structure"] = ", ".join([structure["name"] for structure in metadata["structure"]])
    if titlePrefix is not None: document["titlePrefix"] = titlePrefix
    searchData[document["id"]] = document

def getVidPlayerMetadata(fileName):
    fileMetadata = getYAMLMetadata(fileName)
    vidPlayerMetadata = {}
    vidPlayerMetadata["vidName"] = fileMetadata["video"].split(".")[0]
    if "doi" in fileMetadata:
        vidPlayerMetadata["thumbnail"] = f"{'_'.join(fileMetadata['video'].split('_', 2)[:2])}_thumbnail"
    else:
        vidPlayerMetadata["thumbnail"] = f"{os.path.splitext(fileMetadata['video'])[0]}_thumbnail"
    if "doi" in fileMetadata: vidPlayerMetadata["doi"] = fileMetadata["doi"]
    return vidPlayerMetadata

def getCompSliderMetadata(fileName):
    fileMetadata = getYAMLMetadata(fileName)
    compSliderMetadata = {}
    compSliderMetadata["imgName"] = fileMetadata["video"].split(".")[0]
    return compSliderMetadata

def getCitationMetadata(fileName, bibDict):
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
            if id in bibDict: 
                name = bibDict[id]["author"][0]["family"] 
                if len(bibDict[id]["author"]) > 1: name = f"{name} et al."
                year = bibDict[id]["issued"]["date-parts"][0][0]
                citationMetadata["sources"].append({"text": f"{name} ({year})", "link": f"D-references.html#ref-{id}.html"})
            elif id in profileData:
                citationMetadata["sources"].append({"text": id, "link": f"B-scientist-profiles.html#{profileData[id]['id']}"})
        if(len(citationMetadata["sources"]) >= 1): citationMetadata["sources"][-1]["last"] = True
    if "structure" in fileMetadata:
        citationMetadata["structures"] = []
        for structure in fileMetadata["structure"]:
            if "PDB" in structure["name"]: structure["viewerId"] = structure["name"].split(" ")[1].lower()
            citationMetadata["structures"].append(structure)
        citationMetadata["structures"][-1]["last"] = True
    return citationMetadata

def getProgressMetadata(fileName, navData):
    progressMetadata = {}
    # Find entry in nav data with the same page name
    for navEntry in navData["navList"]:
        if "isAppendix" in navEntry: continue
        if getPageName(fileName) == navEntry["page"]:
            progressMetadata["currentPageNum"] = navEntry["pageNum"]
        elif "sections" in navEntry:
            for sectionEntry in navEntry["sections"]:
                if getPageName(fileName) == sectionEntry["page"]: progressMetadata["currentPageNum"] = sectionEntry["pageNum"]
    progressMetadata["totalPages"] = navData["totalPages"]
    progressMetadata["progPercent"] = (progressMetadata["currentPageNum"] / navData["totalPages"]) * 100
    progressMetadata["displayPercent"] = round(progressMetadata["progPercent"])
    progressMetadata["chapterPageNums"] = [ { "progPercent": navEntry["progPercent"] } for navEntry in navData["navList"] if "isChapter" in navEntry ]
    return progressMetadata

def addPageToSpeciesData(fileName, speciesData):
    fileMetadata = getYAMLMetadata(fileName)
    if "species" in fileMetadata:
        species = fileMetadata["species"].split("/")[0].strip()
        speciesEntry = {}
        speciesEntry["title"] =  fileMetadata["title"]
        speciesEntry["page"] =  f"{getPageName(fileName)}.html"
        if os.path.dirname(fileName) == "sections":
            speciesEntry["chapter"] = os.path.basename(fileName).split("-")[0]
            speciesEntry["section"] = os.path.basename(fileName).split("-")[1]
        addSpeciesEntryToSpeciesData(species, speciesEntry, speciesData)

    if "subsections" in fileMetadata:
        for subsectionFileName in fileMetadata["subsections"]:
            subsectionData = getYAMLMetadata(f"subsections/{subsectionFileName}.md")
            if "species" in subsectionData:
                species = subsectionData["species"].split("/")[0].strip()
                speciesEntry = {}
                speciesEntry["title"] =  f"{fileMetadata['title']}: {subsectionData['title']}"
                speciesEntry["page"] =  f"{getPageName(fileName)}.html#{subsectionFileName}"
                if os.path.dirname(fileName) == "sections":
                    speciesEntry["chapter"] = os.path.basename(fileName).split("-")[0]
                    speciesEntry["section"] = os.path.basename(fileName).split("-")[1]
                addSpeciesEntryToSpeciesData(species, speciesEntry, speciesData)

def addSpeciesEntryToSpeciesData(species, speciesEntry, speciesData):
    if(species in speciesData):
        speciesData[species]["speciesRefs"].append(speciesEntry)
    else:
        speciesData[species] = {}
        speciesData[species]["species"] = species
        speciesData[species]["speciesRefs"] = [ speciesEntry ]
        speciesData[species]["id"] = species.replace(" ", "-")

def addRefToFeatureIndex(feature, ref, featureIndex):
    if feature in featureIndex:
        featureIndex[feature]["refs"].append(ref)
    else:
        featureIndex[feature] = {}
        featureIndex[feature]["title"] = feature
        featureIndex[feature]["id"] = feature.title().replace(" ", "")
        featureIndex[feature]["refs"] = [ ref ]

def addPageToFeatureIndex(fileName, featureIndex):
    fileMetadata = getYAMLMetadata(fileName)
    chapter = os.path.basename(fileName).split("-")[0]
    section = os.path.basename(fileName).split("-")[1]
    sectionLink = f"{getPageName(fileName)}.html"
    sectionTitle = f"{chapter}.{section} {fileMetadata['title']}"
    if "features" in fileMetadata:
        ref = {"species": fileMetadata["species"], "link": sectionLink, "title": sectionTitle}
        for feature in fileMetadata["features"]: addRefToFeatureIndex(feature, ref, featureIndex)
    
    if "subsections" in fileMetadata:
        for subsectionFileName in fileMetadata["subsections"]:
            subsectionData = getYAMLMetadata(f"subsections/{subsectionFileName}.md")
            subsectionLink = f"{sectionLink}#{subsectionFileName}"
            subsectionTitle = f"{sectionTitle}: {subsectionData['title']}"
            if "features" in subsectionData:
                ref = {"species": subsectionData["species"], "link": subsectionLink, "title": subsectionTitle}
                for feature in subsectionData["features"]: addRefToFeatureIndex(feature, ref, featureIndex)

def addMainSectionMetadata(fileName, metadata, bibDict):
    # Get media viewer metadata
    metadata["mediaViewer"] = {}
    metadata["mediaViewer"]["isSection"] = True
    metadata["mediaViewer"]["vidPlayer"] = getVidPlayerMetadata(fileName)
    metadata["mediaViewer"]["vidPlayer"]["isSection"] = True
    if "noSlider" not in metadata:
        metadata["mediaViewer"]["hasTabMenu"] = True
        metadata["mediaViewer"]["compSlider"] = getCompSliderMetadata(fileName)
        metadata["mediaViewer"]["compSlider"]["isSection"] = True
    # Create narration metadata
    metadata["narration"] = {}
    metadata["narration"]["src"] = metadata["pageName"]
    metadata["narration"]["isSection"] = True
    # Create citation data
    metadata["citation"] = getCitationMetadata(fileName, bibDict)
    metadata["citation"]["isSection"] = True
    # Process subsections
    if "subsections" in metadata:
        metadata["subsectionsData"] = []
        for subsectionFileName in metadata["subsections"]:
            subsectionData = getYAMLMetadata(f"subsections/{subsectionFileName}.md")
            subsectionData["id"] = subsectionFileName

            # Format body text to insert links
            subsectionData["body"] = getFormattedBodyText(f"subsections/{subsectionFileName}.md", "html", bibList, bibDict)

            # Get media viewer metadata
            if "doi" in subsectionData or "video" in  subsectionData or "graphic" in subsectionData:
                subsectionData["hasMainMediaViewer"] = True
                subsectionData["mediaViewer"] = {}
                subsectionData["mediaViewer"]["id"] = subsectionData["id"]
                if "doi" in subsectionData or "video" in  subsectionData:
                    subsectionData["mediaViewer"]["vidPlayer"] = getVidPlayerMetadata(f"subsections/{subsectionFileName}.md")
                    if "noSlider" not in subsectionData:
                        subsectionData["mediaViewer"]["hasTabMenu"] = True
                        subsectionData["mediaViewer"]["compSlider"] = getCompSliderMetadata(f"subsections/{subsectionFileName}.md")
                elif "graphic" in subsectionData:
                    subsectionData["mediaViewer"]["graphic"] = subsectionData["graphic"]
            # Create narration metadata
            subsectionData["narration"] = {}
            subsectionData["narration"]["id"] = subsectionData["id"]
            subsectionData["narration"]["src"] = subsectionData["id"]
            # Create citation data
            if "doi" in subsectionData or "source" in subsectionData:
                subsectionData["citation"] = getCitationMetadata(f"subsections/{subsectionFileName}.md", bibDict)
                subsectionData["mediaViewer"]["citationAttached"] = True
            # Create protein viewer data
            if "structure" in subsectionData:
                for structure in subsectionData["structure"]:
                    if "PDB" in structure["name"]: 
                        subsectionData["viewer"] = {}
                        subsectionData["viewer"]["id"] = f"pv-{subsectionData['id']}"
                        subsectionData["viewer"]["pdb"] = structure["name"].split(" ")[1].lower()
                        if "modified" in structure: subsectionData["viewer"]["modified"] = True

            metadata["subsectionsData"].append(subsectionData)

def getSummaryMenuMetadata(fileName):
    summaryMetadata = {}
    summaryMetadata["isSummary"] = True
    summaryMetadata["isSection"] = True
    summaryMetadata[f'chapter{os.path.basename(fileName).split("-")[0]}'] = True
    return summaryMetadata

siteDirRegular = "site"
siteDirOffline = "cell_atlas_offline"
siteDirOfflineLite = "cell_atlas_offline_lite"
sectionFileNames = sorted(os.listdir("sections"), key=lambda s: (int(s.split("-")[0]), int(s.split("-")[1])))
appendixFileNames = sorted( os.listdir("appendix") )
profileFileNames = sorted(os.listdir("profiles"), key=lambda s: s.split("-")[-1])
offlineAssetsExists = os.path.isdir("videos") and os.path.isdir("videos-480p") and os.path.isdir("stillimages") and os.path.isdir("narration")

# Create site directories with assets
createSiteDir(siteDirRegular)
# Create offline versions only if all offline assets are present
if offlineAssetsExists:
    createOfflineDir(siteDirOffline, "full")
    createOfflineDir(siteDirOfflineLite, "lite")
else:
    print("Not all offline assets exist. Skipping offline build")

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

# Generate species data
speciesData = {}
addPageToSpeciesData("introduction.md", speciesData)
for fileName in sectionFileNames: addPageToSpeciesData(f"sections/{fileName}", speciesData)
addPageToSpeciesData("keep-looking.md", speciesData)

# Generate feature index data
featureIndex = {}
for fileName in sectionFileNames: addPageToFeatureIndex(f"sections/{fileName}", featureIndex)

# Generate bibliography data
bibDict = { ref["id"]: ref for ref in json.loads( subprocess.check_output(["pandoc", "--to=csljson", "AtlasBibTeX.bib"]) ) }
bibList = []
addPageToBibList("begin.md", bibList, bibDict)
addPageToBibList("introduction.md", bibList, bibDict)
for fileName in sectionFileNames: addPageToBibList(f"sections/{fileName}", bibList, bibDict)
addPageToBibList("outlook.md", bibList, bibDict)
addPageToBibList("keep-looking.md", bibList, bibDict)

# Generate search data
searchData = {}
addPageToSearchData("begin.md", bibList, bibDict, searchData)
addPageToSearchData("introduction.md", bibList, bibDict, searchData)
for fileName in sectionFileNames: addPageToSearchData(f"sections/{fileName}", bibList, bibDict, searchData)
addPageToSearchData("outlook.md", bibList, bibDict, searchData)
addPageToSearchData("keep-looking.md", bibList, bibDict, searchData)
with open("{}/searchData.json".format(siteDirRegular), "w", encoding="utf-8") as f: json.dump(searchData, f, indent="\t")

# Render landing page
subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={siteDirRegular}/index.html", "--template=templates/index.html", "index.md"])
if offlineAssetsExists: subprocess.run(["pandoc", "--from=markdown", "--to=html", "--metadata=offline", f"--output={siteDirOffline}/index.html", "--template=templates/index.html", "index.md"])
if offlineAssetsExists: subprocess.run(["pandoc", "--from=markdown", "--to=html", "--metadata=offline", f"--output={siteDirOfflineLite}/index.html", "--template=templates/index.html", "index.md"])

# Render begin page
metadata = getYAMLMetadata("begin.md")
metadata["nav"] = navData["navList"]
metadata["navData"] = { "nav": True }
metadata["nextSection"] = "introduction"
metadata["typeChapter"] = True
metadata["body"] = getFormattedBodyText("begin.md", "html", bibList, bibDict)
writePage(siteDirRegular, "begin.md", "begin", metadata)
if offlineAssetsExists: writePageOffline(siteDirOffline, siteDirOfflineLite, "begin.md", "begin", metadata)

# Render introduction page
metadata = getYAMLMetadata("introduction.md")
metadata["pageName"] = "introduction"
metadata["nav"] = navData["navList"]
metadata["navData"] = { "nav": True }
metadata["prevSection"] = "begin"
metadata["nextSection"] = getPageName(sectionFileNames[0])
metadata["typeSection"] = True
metadata["body"] = getFormattedBodyText("introduction.md", "html", bibList, bibDict)
metadata["progressData"] = getProgressMetadata("introduction.md", navData)
addMainSectionMetadata("introduction.md", metadata, bibDict)
writePage(siteDirRegular, "introduction.md", metadata["pageName"], metadata)
if offlineAssetsExists: writePageOffline(siteDirOffline, siteDirOfflineLite, "introduction.md", metadata["pageName"], metadata)

# Render pages in sections/
for i, fileName in enumerate(sectionFileNames):
    metadata = getYAMLMetadata(f"sections/{fileName}")
    metadata["pageName"] = getPageName(fileName)
    metadata["nav"] = navData["navList"]
    metadata["navData"] = { "nav": True }

    # Generate chapter/section metadata
    metadata["chapter"] = fileName.split("-")[0]
    if fileName.split("-")[1] == "0":
        metadata["typeChapter"] = True
    else:
        metadata["section"] = fileName.split("-")[1]
        metadata["typeSection"] = True

    # Generate next/prev section metadata
    metadata["prevSection"] = "introduction" if i == 0 else getPageName(sectionFileNames[i - 1])
    metadata["nextSection"] = "outlook" if i == len(sectionFileNames) - 1 else getPageName(sectionFileNames[i + 1])

    metadata["body"] = getFormattedBodyText(f"sections/{fileName}", "html", bibList, bibDict)

    metadata["progressData"] = getProgressMetadata(f"sections/{fileName}", navData)

    if "typeSection" in metadata and metadata["title"] != "Summary": addMainSectionMetadata(f"sections/{fileName}", metadata, bibDict)

    if metadata["title"] == "Summary": metadata["summaryData"] = getSummaryMenuMetadata(fileName)

    writePage(siteDirRegular, f"sections/{fileName}", metadata["pageName"], metadata)
    if offlineAssetsExists: writePageOffline(siteDirOffline, siteDirOfflineLite, f"sections/{fileName}", metadata["pageName"], metadata)

# Render outlook page
metadata = getYAMLMetadata("outlook.md")
metadata["pageName"] = "outlook"
metadata["nav"] = navData["navList"]
metadata["navData"] = { "nav": True }
metadata["prevSection"] = getPageName(sectionFileNames[-1])
metadata["nextSection"] = "keep-looking"
metadata["typeChapter"] = True
metadata["body"] = getFormattedBodyText("outlook.md", "html", bibList, bibDict)
metadata["progressData"] = getProgressMetadata("outlook.md", navData)
writePage(siteDirRegular, "outlook.md", metadata["pageName"], metadata)
if offlineAssetsExists: writePageOffline(siteDirOffline, siteDirOfflineLite, "outlook.md", metadata["pageName"], metadata)

# Render keep looking page
metadata = getYAMLMetadata("keep-looking.md")
metadata["pageName"] = "keep-looking"
metadata["nav"] = navData["navList"]
metadata["navData"] = { "nav": True }
metadata["prevSection"] = "outlook"
metadata["nextSection"] = "A-feature-index"
metadata["typeSection"] = True
metadata["body"] = getFormattedBodyText("keep-looking.md", "html", bibList, bibDict)
metadata["progressData"] = getProgressMetadata("keep-looking.md", navData)
addMainSectionMetadata("keep-looking.md", metadata, bibDict)
writePage(siteDirRegular, "keep-looking.md", metadata["pageName"], metadata)
if offlineAssetsExists: writePageOffline(siteDirOffline, siteDirOfflineLite, "keep-looking.md", metadata["pageName"], metadata)

# Render appendix pages
for i, fileName in enumerate(appendixFileNames):
    metadata = getYAMLMetadata(f"appendix/{fileName}")
    metadata["pageName"] = os.path.splitext(fileName)[0]
    metadata["chapter"] = fileName.split("-")[0]
    metadata["nav"] = navData["navList"]
    metadata["navData"] = { "nav": True }
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
        metadata["features"] = {}
        metadata["features"]["entries"] = [{**entry, "template": {"feature": True}} for entry in sorted(featureIndex.values(), key=lambda entry: entry["title"].lower())]
    elif fileName == "B-scientist-profiles.md":
        metadata["appendixTypeProfiles"] = True
        metadata["profiles"] = {}
        metadata["profiles"]["entries"] = [{**profile, "template": {"profile": True}} for profile in profileData.values()]
    elif fileName == "C-phylogenetic-tree.md":
        metadata["appendixTypeTree"] = True
        metadata["speciesList"] = [speciesEntry for speciesEntry in speciesData.values()]
        metadata["treeData"] = { "id": "treeViewer", "speciesList": metadata["speciesList"] }
        metadata["treeViewerFsConfirmData"] = { "id": "treeViewerFsConfirm", "treeViewerFsConfirm": True }
    elif fileName == "D-references.md":
        metadata["appendixTypeReferences"] = True

    if fileName == "D-references.md":
        with open("bib.json", "w", encoding='utf-8') as f: json.dump(bibList, f)
        with open("metadata.json", "w", encoding='utf-8') as f: json.dump(metadata, f)
        subprocess.run(["pandoc", "--from=csljson", "--citeproc", "--csl=springer-socpsych-brackets.csl", "--to=html", f"--output={siteDirRegular}/{metadata['pageName']}.html", "--template=templates/page.html", "--metadata-file=metadata.json", "bib.json"])
        if offlineAssetsExists: subprocess.run(["pandoc", "--from=csljson", "--citeproc", "--csl=springer-socpsych-brackets.csl", "--metadata=offline", "--to=html", f"--output={siteDirOffline}/{metadata['pageName']}.html", "--template=templates/page.html", "--metadata-file=metadata.json", "bib.json"])
        if offlineAssetsExists: subprocess.run(["pandoc", "--from=csljson", "--citeproc", "--csl=springer-socpsych-brackets.csl", "--metadata=offline", "--to=html", f"--output={siteDirOfflineLite}/{metadata['pageName']}.html", "--template=templates/page.html", "--metadata-file=metadata.json", "bib.json"])
        os.remove("metadata.json")
        os.remove("bib.json")
    else:
        writePage(siteDirRegular, f"appendix/{fileName}", metadata["pageName"], metadata)
        if offlineAssetsExists: writePageOffline(siteDirOffline, siteDirOfflineLite, f"appendix/{fileName}", metadata["pageName"], metadata)

# Render about page
metadata = getYAMLMetadata("about.md")
metadata["pageName"] = "about"
metadata["nav"] = navData["navList"]
metadata["navData"] = { "nav": True }
metadata["typeAppendix"] = True
metadata["appendixTypeAbout"] = True
metadata["feedbackData"] = { "id": "feedback", "feedback": True }
metadata["content"] = {}
metadata["content"]["entries"] = []
with open("about.md", 'r', encoding='utf-8') as f:
    lines = f.readlines()
    contentStartIndex = [i for i, line in enumerate(lines) if line.strip() == "---"][1] + 1
    for line in lines[contentStartIndex:]:
        if re.search(r"##", line):
            entry = {}
            entry["title"] = line.split("##")[1].strip()
            entry["content"] = ""
            entry["id"] = re.sub(r"[^\w\s]", "", entry["title"].replace(" ", "-"))
            entry["template"] = { "about": True }
            metadata["content"]["entries"].append(entry)
        else:
            metadata["content"]["entries"][-1]["content"] += line    
writePage(siteDirRegular, "about.md", metadata["pageName"], metadata)
if offlineAssetsExists: writePageOffline(siteDirOffline, siteDirOfflineLite, "about.md", metadata["pageName"], metadata)

# Render download page
metadata = getYAMLMetadata("download.md")
metadata["pageName"] = "download"
metadata["nav"] = navData["navList"]
metadata["navData"] = { "nav": True }
metadata["typeAppendix"] = True
metadata["appendixTypeDownload"] = True
writePage(siteDirRegular, "download.md", metadata["pageName"], metadata)