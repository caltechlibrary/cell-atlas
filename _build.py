# This script is a bit unorganized currently. Will be rewritten soon.

import subprocess
import json
import os
import shutil
import re 
import csv
import copy

SITEDIR = "site"
ZIPDIR_LARGE = "cell_atlas_offline"
ZIPDIR_SMALL = "cell_atlas_offline_lite"

def markdownToHTML(filen):
    process = subprocess.run(
        args=[
            "pandoc", 
            "--from=markdown", 
            "--to=html", 
            filen], 
            stdout=subprocess.PIPE
    )
    return (process.stdout).decode("utf-8")

def getMarkdownMetadata(file):
    process = subprocess.run(
        args=[
            "pandoc", 
            "--template=templates/metadata.tmpl", 
            file], 
            stdout=subprocess.PIPE
    )
    return json.loads(process.stdout)

def writePage(siteDir, sourceFile, template, pageName, metadata):
    # Add site navigation to metadata
    metadata["nav"] = siteNav
    metadata["navData"] = { "nav": True }
    # Add ID for the video player if there is one
    if "doi" in metadata or "video" in metadata: 
        metadata["vidMetadata"] = {}
        metadata["vidMetadata"]["isSection"] = True
        metadata["vidMetadata"]["video"] = metadata["video"]
        metadata["vidMetadata"]["vidName"] = metadata["video"].split(".")[0]
        metadata["vidMetadata"]["thumbnail"] = metadata["thumbnail"]
        metadata["vidMetadata"]["vid"] = True
        if "sliderImgName" in metadata:  
            metadata["vidMetadata"]["sliderImgName"] = metadata["sliderImgName"]
            metadata["vidMetadata"]["img"] = True
            metadata["vidMetadata"]["hasTabMenu"] = True
        else:
            metadata["vidMetadata"]["hasTabMenu"] = False
        if "doi" in metadata:
            metadata["vidMetadata"]["species"] = metadata["videoTitle"]
            if "/" in metadata["videoTitle"]:
                metadata["vidMetadata"]["speciesId"] = metadata["videoTitle"].split("/")[0].strip().replace(" ", "-")
            else:
                metadata["vidMetadata"]["speciesId"] = metadata["videoTitle"].replace(" ", "-")
            metadata["vidMetadata"]["doi"] = metadata["doi"]
            metadata["vidMetadata"]["collector"] = metadata["collector"]

        if "sections/" in sourceFile:
            metadata["playerId"] = "player-" +  sourceFile[sourceFile.index("/")+1 : sourceFile.index(".")]
            metadata["vidMetadata"]["playerId"] = "player-" +  sourceFile[sourceFile.index("/")+1 : sourceFile.index(".")]
        else:
            metadata["playerId"] = "player-" +  sourceFile[:sourceFile.index(".")]
            metadata["vidMetadata"]["playerId"] = "player-" +  sourceFile[:sourceFile.index(".")]
    
    # Check if collector profile exist in scientist profiles
    addCollectorData(metadata, "collector")
    # create temp file with inserted references/profiles
    sourceFormatted = insertLinks(sourceFile, "section.md")
    if "subsections" in metadata and metadata["subsections"]:
        # Aggregate "learn more" subsection content associated with this section
        metadata["subsectionsData"] = []
        for subsection in metadata["subsections"]:
            metadata["subsectionsData"].append(processSubsection("subsections/{}.md".format(subsection), pageName, metadata))
    # create temp metadata file to pass to pandoc
    with open("metadata.json", "w", encoding='utf-8') as f:
        json.dump(metadata, f)

    if("appendixTypeDownload" not in metadata):
        writePageOffline(sourceFormatted, template, pageName, metadata, ZIPDIR_SMALL)
        writePageOffline(sourceFormatted, template, pageName, metadata, ZIPDIR_LARGE)

    subprocess.run([
        "pandoc", 
        "--from=markdown", 
        "--to=plain", 
        "--output=sectionPlain.txt",
        sourceFormatted.name
    ])
    with open("sectionPlain.txt", "r", encoding="utf-8") as f:
        document = {}
        document["id"] = pageName
        if "title" in metadata: 
            document["title"] = metadata["title"]
            if "chapter" in metadata:
                if "section" in metadata:
                    document["titlePrefix"] = "{}.{}".format(metadata["chapter"], metadata["section"])
                else:
                    document["titlePrefix"] = metadata["chapter"]
        document["content"] = f.read()
        if "videoTitle" in metadata: document["species"] = metadata["videoTitle"]
        if "collector" in metadata: document["collector"] = metadata["collector"]
        searchData[document["id"]] = document
    os.remove("sectionPlain.txt")

    if "subsectionsData" in metadata:
        for subsectionData in metadata["subsectionsData"]:
            with open("subsectionHTML.html", "w", encoding="utf-8") as f:
                f.write(subsectionData["html"])
            subprocess.run([
                "pandoc", 
                "--from=html", 
                "--to=plain", 
                "--output=subsectionPlain.txt",
                "subsectionHTML.html"
            ])
            os.remove("subsectionHTML.html")
            with open("subsectionPlain.txt", "r", encoding="utf-8") as f:
                document = {}
                document["id"] = "{}#{}".format(pageName, subsectionData["id"])
                if "title" in subsectionData: 
                    document["title"] = subsectionData["title"]
                    if "chapter" in metadata:
                        document["titlePrefix"] = "{}.{} {}:".format(metadata["chapter"], metadata["section"], metadata["title"])
                if "structures" in subsectionData:
                    document["structure"] = ""
                    for structure in subsectionData["structures"]:
                        document["structure"] = document["structure"] + structure["text"]
                document["content"] = f.read()
                if "species" in subsectionData: document["species"] = subsectionData["species"]
                if "collector" in subsectionData: document["collector"] = subsectionData["collector"]
                searchData[document["id"]] = document
            os.remove("subsectionPlain.txt")

    pandocArgs = [
        "pandoc", 
        "--from=markdown", 
        "--to=html", 
        "--output={}/{}.html".format(siteDir, pageName), 
        "--metadata-file=metadata.json", 
        "--template=templates/{}.tmpl".format(template)
    ]
    if("appendixTypeReferences" in metadata):
        pandocArgs = pandocArgs + [
            "--from=csljson", 
            "--citeproc", 
            "--csl=springer-socpsych-brackets.csl"
        ]
    pandocArgs.append(sourceFormatted.name)
    subprocess.run(pandocArgs)
    # remove temp metadata and source file file once we are done using it
    os.remove("metadata.json")
    os.remove(sourceFormatted.name)

def writePageOffline(sourceFormatted, template, pageName, metadata, outDir):
    offlineMetadata = copy.deepcopy(metadata)
    pandocArgs = [
        "pandoc", 
        "--from=markdown", 
        "--to=html", 
        "--output={}/{}.html".format(outDir, pageName), 
        "--metadata-file=metadataOffline.json", 
        "--metadata=offline",
        "--template=templates/{}.tmpl".format(template)
    ]

    if(outDir == ZIPDIR_SMALL):
        if("doi" in offlineMetadata or "video" in offlineMetadata):
            videoName = None
            if("doi" in offlineMetadata):
                videoName = movieDict[offlineMetadata["doi"]]
            elif("video" in offlineMetadata):
                videoName = offlineMetadata["video"]
            smallVideoName = videoName.split(".")[0] + "_480p." + videoName.split(".")[1]
            offlineMetadata["vidMetadata"]["video"] = smallVideoName
    else:
        if("doi" in offlineMetadata):
            offlineMetadata["vidMetadata"]["video"] = movieDict[offlineMetadata["doi"]]

    if "subsectionsData" in offlineMetadata and offlineMetadata["subsectionsData"]:
        for i in range(len(offlineMetadata["subsectionsData"])):
            if(outDir == ZIPDIR_SMALL):
                if("doi" in offlineMetadata["subsectionsData"][i] or "video" in offlineMetadata["subsectionsData"][i]):
                    subVideoName = None
                    if("doi" in offlineMetadata["subsectionsData"][i]):
                        subVideoName = movieDict[offlineMetadata["subsectionsData"][i]["doi"]]
                    elif("video" in offlineMetadata["subsectionsData"][i]):
                        subVideoName = offlineMetadata["subsectionsData"][i]["video"]
                    offlineMetadata["subsectionsData"][i]["video"] = subVideoName.split(".")[0] + "_480p." + subVideoName.split(".")[1]
            else:
                if("doi" in offlineMetadata["subsectionsData"][i]):
                    offlineMetadata["subsectionsData"][i]["video"] = movieDict[offlineMetadata["subsectionsData"][i]["doi"]]
    
    with open("metadataOffline.json", "w", encoding='utf-8') as f:
        json.dump(offlineMetadata, f)
    if("appendixTypeReferences" in offlineMetadata):
        pandocArgs = pandocArgs + [
            "--from=csljson", 
            "--citeproc", 
            "--csl=springer-socpsych-brackets.csl"
        ]
    pandocArgs.append(sourceFormatted.name)
    subprocess.run(pandocArgs)
    os.remove("metadataOffline.json")

def processSubsection(subsectionFile, pageName, parentData):
    metadata = getMarkdownMetadata(subsectionFile)
    metadata["id"] = subsectionFile.split("/")[-1][:-3]
    metadata["collectorProfile"] = False
    metadata["isSubsection"] = True
    if "video" in metadata:
        metadata["vidName"] = metadata["video"].split(".")[0]
        currVideoName = metadata["video"].split(".")[0]
        subsectionName = currVideoName.split("_")[-1]
        if subsectionName.isnumeric():
            metadata["thumbnail"] = "{}_thumbnail".format(currVideoName)
        else:
            metadata["thumbnail"] = "{}_thumbnail".format("_".join(currVideoName.split(".")[0].split("_")[:-1]))
        addSliderData(metadata, currVideoName)
    if("doi" in metadata):
        metadata["video"] = movieDict[metadata["doi"]]
        metadata["vidName"] = metadata["video"].split(".")[0]
        addSliderData(metadata, metadata["video"])
    if("species" in metadata): 
        if "+" in metadata["species"]:
            addSpeciesToDict(metadata["species"].split("+")[0].strip(), "{}.html#{}".format(pageName, metadata["id"]), parentData["chapter"], parentData["section"], "{}: {}".format(parentData["title"], metadata["title"]))
            metadata["speciesId"] = metadata["species"].split("+")[0].strip().replace(" ", "-")
        else:
            addSpeciesToDict(metadata["species"], "{}.html#{}".format(pageName, metadata["id"]), parentData["chapter"], parentData["section"], "{}: {}".format(parentData["title"], metadata["title"]))
            metadata["speciesId"] = metadata["species"].replace(" ", "-")

    # Check if collector profile exist in in scientist profiles
    addCollectorData(metadata, "collector")
    addCollectorData(metadata, "source")
    # Format any references in the metadata (right now, I'm just going to hard code it to the source fields of schematics)
    if("source" in metadata): 
        sourceFormatted = insertRefLinks(metadata["source"], isSchematic=True)
        metadata["sources"] = []
        
        if "[" not in sourceFormatted or "]" not in sourceFormatted:
            metadata["sources"].append({ "text": sourceFormatted, "link": "B-scientist-profiles.html#{}".format(sourceFormatted.replace(" ", "")) })
        else:
            pare = re.compile(r"\(([^\)]+)\)")
            bracket = re.compile(r"\[(.*?)\]")
            for match in re.finditer(pare, sourceFormatted):
                matchString = match.group()
                if "D-references" in matchString:
                    metadata["sources"].append({ "link": matchString[1:len(matchString)-1] })
            i = 0
            for match in re.finditer(bracket, sourceFormatted):
                matchString = match.group()
                metadata["sources"][i]["text"] = matchString[1:len(matchString)-1]
                i = i + 1
        if(len(metadata["sources"]) >= 1): metadata["sources"][-1]["last"] = True
    # Add player id for videos
    if "doi" in metadata or "video" in metadata: 
        metadata["playerId"] = "player-" + subsectionFile[subsectionFile.index("/")+1 : subsectionFile.index(".")]
        metadata["vid"] = True
        if "sliderImgName" in metadata:
            metadata["img"] = True
            metadata["hasTabMenu"] = True
    # Deconstruct preformatted structure data
    if "structure" in metadata: 
        metadata["structures"] = []
        textR = re.compile(r"\>(.*?)\<")
        link = re.compile(r"\"(.*?)\"")
        for match in re.finditer(link, metadata["structure"]):
            matchString = match.group()
            metadata["structures"].append({ "link": matchString[1:len(matchString)-1] })
        i = 0
        for match in re.finditer(textR, metadata["structure"]):
                matchString = match.group()
                if matchString != ">, <": 
                    metadata["structures"][i]["text"] = matchString[1:len(matchString)-1]
                    if "-" not in metadata["structures"][i]["text"]:
                        pdbNumber = metadata["structures"][i]["text"].split(" ")[1].lower()
                        if(pdbNumber != "6s8h"):
                            metadata["structures"][i]["viewerId"] = pdbNumber
                            metadata["viewer"] = {
                                "id": metadata["id"],
                                "pdb": pdbNumber
                            }
                            if(pdbNumber == "3jc8" or pdbNumber == "3dkt" or pdbNumber == "3j31" or pdbNumber == "5tcr" or pdbNumber == "5u3c" or pdbNumber == "6kgx" or pdbNumber == "6o9j"):
                                metadata["viewer"]["modified"] = True
                    i = i + 1
        if(len(metadata["structures"]) >= 1): metadata["structures"][-1]["last"] = True

    if("species" in metadata or "sources" in metadata):
        metadata["citationAttached"] = True

    if("vid" in metadata or "img" in metadata or "graphic" in metadata):
        metadata["hasMainMediaViewer"] = True

    sourceFormatted = insertLinks(subsectionFile, "subsection.md")
    # Return subsection content as html because this will be passed to pandoc as metadata
    metadata["html"] = markdownToHTML(sourceFormatted.name)
    os.remove(sourceFormatted.name)
    return metadata

def createNavData():
    navData = []
    navData.append({
        "title": "Introduction",
        "page": "introduction"
    })
    pageNum = 1
    for sectionFile in sectionFiles:
        pageNum = pageNum + 1
        sectionMetadata = getMarkdownMetadata("sections/{}".format(sectionFile))
        chapter, navSection, *title = sectionFile[:-3].split("-")
        if navSection == "0":
            navChapter = {}
            navChapter["sections"] = []
            navChapter["chapter"] = chapter
            navChapter["title"] = sectionMetadata["title"]
            navChapter["page"] = chapter + "-" + "-".join(title)
            navChapter["isChapter"] = "true"
            navChapter["progressData"] = {
                "pageNum": pageNum,
                "progPercent": ((pageNum) / (totalPages)) * 100
            }
            navData.append(navChapter)
        else:
            sectionEntry = {}
            sectionEntry["chapter"] = chapter
            sectionEntry["section"] = navSection
            sectionEntry["title"] = sectionMetadata["title"]
            sectionEntry["page"] = sectionFile[:-3]
            navData[-1]["sections"].append(sectionEntry)
    navData.append({
        "title": "Outlook",
        "page": "outlook",
        "isChapter": "true",
        "progressData": {
            "pageNum": pageNum + 1,
            "progPercent": ((pageNum + 1) / (totalPages)) * 100
        },
        "sections": [{
            "title": "Keep Looking",
            "page": "keep-looking"
        }]
    })
    # Add appendix data
    navData.append({
        "chapter": "Appendix",
        "isAppendix": True
    })
    navData.append({
        "chapter": "A",
        "title": "Feature Index",
        "page": "A-feature-index"
    })
    navData.append({
        "chapter": "B",
        "title": "Scientist Profiles",
        "page": "B-scientist-profiles"
    })
    navData.append({
        "chapter": "C",
        "title": "Phylogenetic Tree",
        "page": "C-phylogenetic-tree"
    })
    navData.append({
        "chapter": "D",
        "title": "References",
        "page": "D-references"
    })
    return navData

def insertLinks(sourceFile, outFile):
    with open(sourceFile, "r", encoding='utf-8') as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open(outFile, "w", encoding='utf-8') as f:
            f.write(formattedContent)
            return f

def insertRefLinks(content, isSchematic=False):
    r = re.compile(r"\[@.*?]")
    offset = 0
    for match in re.finditer(r, content):
        linkStart = match.span()[0]+offset
        linkEnd = match.span()[1]+offset
        id = match.group().split("[@")[1].strip(" ]")
        if id not in bibDict:
            print("Bib ID {} not found in bibliography data".format(id))
            continue
        if bibDict[id] not in usedBibs: usedBibs.append(bibDict[id])
        link = "D-references.html#ref-{}".format(id)
        if isSchematic:
            name = bibDict[id]["author"][0]["family"]
            etAl = "et al." if len(bibDict[id]["author"]) > 1 else ""
            year = bibDict[id]["issued"]["date-parts"][0][0]
            citation = " ".join([name, etAl, "(" + str(year) + ")"])
            content = content[:linkStart] + "[{}]({})".format(citation, link) + content[linkEnd:]
            offset = offset + 1 + + len(citation) + len(link) - len(id)
        else:
            refNum = str(len(usedBibs)) if bibDict[id] not in usedBibs else str(usedBibs.index(bibDict[id])+1)
            content = content[:linkStart]+'[['+refNum+']('+link+')]'+content[linkEnd:]
            offset = offset + 3 + len(refNum) + len(link) - len(id)
    return content

def insertProfileLinks(content):
    r = re.compile(r"\[[^\[\]]*\]\(#[^\[\]]*?\)")
    for match in re.finditer(r, content):
        linkStart = match.span()[0]
        linkEnd = match.span()[1]
        name = match.group().split("]")[0].lstrip("[")
        if name in profileDict:
            link = "B-scientist-profiles.html#{}".format(profileDict[name]["id"])
            anchor = match.group().split("(")[1].rstrip(")")
            content = content.replace(anchor, link, 1)
    return content

def addCollectorData(metadata, identifier):
    if identifier in metadata:
        if metadata[identifier] in profileDict:
            metadata["collectorProfile"] = profileDict[metadata[identifier]]["name"]
            metadata["collectorId"] = profileDict[metadata[identifier]]["id"]

            if "vidMetadata" in metadata:
                metadata["vidMetadata"]["collectorProfile"] = metadata["collectorProfile"]
                metadata["vidMetadata"]["collectorId"] = metadata["collectorId"]
            
def addSliderData(metadata, videoName):
    if "noSlider" in metadata: return
    videoTitle = videoName.split(".")[0]
    metadata["sliderImgName"] = videoTitle

def addSpeciesToDict(species, pageName, chapter, section, title):
    speciesObj = {}
    if(chapter != ""): speciesObj["chapter"] = chapter
    if(section != ""): speciesObj["section"] = section
    speciesObj["title"] = title
    speciesObj["page"] = pageName
    if(species in speciesDict):
        speciesDict[species]["speciesObjs"].append(speciesObj)
    else:
        speciesDict[species] = {}
        speciesDict[species]["species"] = species
        speciesDict[species]["speciesObjs"] = [ speciesObj ]
        speciesDict[species]["id"] = species.replace(" ", "-")

# function to create directory that will contain compiled content
# this function will delete `siteDir` argument if the directory already exists. So be careful
def createSiteDirectory(siteDir, zipDirSmall, zipDirLarge):
    if os.path.isdir(siteDir):
        shutil.rmtree(siteDir)
    os.mkdir(siteDir)
    shutil.copytree("styles/", "{}/styles/".format(siteDir))
    shutil.copytree("js/", "{}/js/".format(siteDir))
    shutil.copytree("img/", "{}/img/".format(siteDir))
    shutil.copyfile("sitemap.xml", "{}/sitemap.xml".format(siteDir))

    if os.path.isdir(zipDirSmall):
        shutil.rmtree(zipDirSmall)
    shutil.copytree(siteDir, zipDirSmall)
    os.mkdir("{}/videos".format(zipDirSmall))
    if os.path.isdir(zipDirLarge):
        shutil.rmtree(zipDirLarge)
    shutil.copytree(siteDir, zipDirLarge)
    os.mkdir("{}/videos".format(zipDirLarge))

# Create rendered site directory
createSiteDirectory(SITEDIR, ZIPDIR_SMALL, ZIPDIR_LARGE)
# Create dict of references
process = subprocess.run(
    args= [
        "pandoc", 
        "--to=csljson", 
        "AtlasBibTeX.bib"
    ],
    stdout=subprocess.PIPE
)
bibData = json.loads(process.stdout)
bibDict = {entry["id"]: entry for entry in bibData}
# Create array of references that will be built as book is built
usedBibs = []
# Get all section files
sectionFiles = sorted(os.listdir("sections"), key=lambda s: (int(s.split("-")[0]), int(s.split("-")[1])))
# Create nav menu data
totalExtraPages = 3
totalPages = len(sectionFiles) + totalExtraPages
siteNav = createNavData()
chapterPageValues = [ siteNav[i]["progressData"] for i in range(len(siteNav)) if "isChapter" in siteNav[i] ]
# Create profiles data to use in section pages
profiles = []
profileDict = {}
profilesDir = "profiles"
profileFiles = sorted(os.listdir(profilesDir), key=lambda s: s.split("-")[-1])
for profileFile in profileFiles:
    profile = {}
    profileMetadata = getMarkdownMetadata("{}/{}".format(profilesDir, profileFile))
    profile["name"] = profileMetadata["title"]
    profile["img"] = profileMetadata["img"]
    profile["id"] = profile["name"].replace(" ", "")

    # Insert any possible reference links
    profileFormatted = insertLinks("{}/{}".format(profilesDir, profileFile), "profile.md")
    profile["html"] = markdownToHTML(profileFormatted.name)
    os.remove(profileFormatted.name)
    profiles.append(profile)
    profileDict[profile["name"]] = profile
# Create dictionary of DOIs to video file names
movieDict = {}
with open("dois.csv", "r", encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        doi = row["DOI"]
        movie = row["movie"]
        movieDict[doi] = movie
# Create a dictionary that maps species to sections
speciesDict = {}
# Create dictionary for search data
searchData = {}

# Render landing page
metadata = getMarkdownMetadata("index.md")
metadata["firstPage"] = "begin"
metadata["index"] = True
writePage(SITEDIR, "index.md", "index","index", metadata)

# Render opening quote page for introduction
metadata = getMarkdownMetadata("introQuote.md")
metadata["nextSection"] = "introduction"
metadata["typeChapter"] = True
writePage(SITEDIR, "introQuote.md", "page", "begin", metadata)

# Render introduction page
introFileMetaData = getMarkdownMetadata("introduction.md")
introFileMetaData["typeSection"] = True
introFileMetaData["prevSection"] = "begin"
introFileMetaData["nextSection"] = sectionFiles[0][:-3].split("-")[0] + "-" + "".join(sectionFiles[0][:-3].split("-")[2:])
introFileMetaData["subsectionsData"] = []
introFileMetaData["thumbnail"] = "0_1_thumbnail"
introFileMetaData["totalPages"] = totalPages
introFileMetaData["currentPageNum"] = 1
introFileMetaData["chapterPageNums"] = chapterPageValues
introFileMetaData["progPercent"] = (introFileMetaData["currentPageNum"] / introFileMetaData["totalPages"]) * 100
introFileMetaData["displayPercent"] = round(introFileMetaData["progPercent"])
addSliderData(introFileMetaData, movieDict[introFileMetaData["doi"]])
addSpeciesToDict(introFileMetaData["videoTitle"], "introduction.html", "", "", "Introduction")
writePage(SITEDIR, "introduction.md", "section-refactor", "introduction", introFileMetaData)

# Render section pages
for i in range(len(sectionFiles)):
    fileName = sectionFiles[i]
    metadata = getMarkdownMetadata("sections/{}".format(fileName))
    metadata["chapter"], metadata["section"], *title = fileName.split("-")
    metadata["collectorProfile"] = False
    metadata["prevSection"] = None
    metadata["nextSection"] = None
    metadata["totalPages"] = totalPages
    metadata["currentPageNum"] = i + 2
    metadata["chapterPageNums"] = chapterPageValues
    metadata["progPercent"] = (metadata["currentPageNum"] / metadata["totalPages"]) * 100
    metadata["displayPercent"] = round(metadata["progPercent"])
    if("doi" in metadata or "video" in metadata):
        if "doi" in metadata and metadata["doi"] in movieDict:
            addSliderData(metadata, movieDict[metadata["doi"]])
        elif "video" in metadata:
            addSliderData(metadata, metadata["video"])
        else:
            print("{} section file does not have DOI field".format(fileName)) 
    if(title[0] == "summary.md"):
        metadata["summaryData"] = {
            "isSummary": True,
            "isSection": True,
            "chapter{}".format(metadata["chapter"]): True 
        }
        metadata["vidMetadata"] = { "isSection": True }
    elif("video" in metadata):
        metadata["thumbnail"] = "{}_thumbnail".format("_".join(metadata["video"].split("_")[:2]))
    
    # Add links to next and prev pages
    # If we are not at the last file, then there is a next section
    if i != len(sectionFiles) - 1:
        nextFileName = sectionFiles[i+1][:-3]
        # If the next section is the start of a chapter, need to drop the "0" on the link
        if sectionFiles[i+1].split("-")[1] != "0":
            metadata["nextSection"] = nextFileName
        else:
            nextChapter, nextSection, *title = nextFileName.split("-")
            metadata["nextSection"] = nextChapter + "-" + "".join(title)
    else:
        metadata["nextSection"] = "outlook"
    # If we are not at the beggining, then there is a previous section
    if i != 0:
        prevFileName = sectionFiles[i-1][:-3]
        # If the previous section is the start of a chapter, need to drop the "0" on the link
        if metadata["section"] != "1":
            metadata["prevSection"] = prevFileName
        else:
            prevChapter, prevSection, *title = prevFileName.split("-")
            metadata["prevSection"] = prevChapter + "-" + "".join(title)
    else:
        metadata["prevSection"] = "introduction"

    pageName = fileName[:-3] if metadata["section"] != "0" else metadata["chapter"] + "-" + "".join(title)[:-3]

    if(pageName == "1-10-putting-it-all-together"): metadata["noindex"] = True

    if("videoTitle" in metadata): 
        if "/" in metadata["videoTitle"]:
            addSpeciesToDict(metadata["videoTitle"].split("/")[0].strip(), "{}.html".format(pageName), metadata["chapter"], metadata["section"], metadata["title"])
        else:
            addSpeciesToDict(metadata["videoTitle"], "{}.html".format(pageName), metadata["chapter"], metadata["section"], metadata["title"])

    template = "page"
    if metadata["section"] != "0":
        metadata["typeSection"] = True
        template = "section-refactor"
    else:
        metadata["typeChapter"] = True
        del metadata["section"] # We don't want to register "0" as a section
    writePage(SITEDIR, "sections/{}".format(fileName), template, pageName, metadata)

# Render opening quote page for "Keep Looking"
metadata = getMarkdownMetadata("outlook.md")
metadata["prevSection"] = sectionFiles[-1][:-3]
metadata["nextSection"] = "keep-looking"
metadata["typeChapter"] = True
metadata["totalPages"] = totalPages
metadata["currentPageNum"] = len(sectionFiles) + 2
metadata["chapterPageNums"] = chapterPageValues
metadata["progPercent"] = (metadata["currentPageNum"] / metadata["totalPages"]) * 100
metadata["displayPercent"] = round(metadata["progPercent"])
writePage(SITEDIR, "outlook.md", "page", "outlook", metadata)

# Render keep looking page
keepLookingFileMetaData = {}
keepLookingFileMetaData = getMarkdownMetadata("keepLooking.md")
keepLookingFileMetaData["typeSection"] = True
keepLookingFileMetaData["prevSection"] = "outlook"
keepLookingFileMetaData["nextSection"] = "A-feature-index"
keepLookingFileMetaData["subsectionsData"] = []
keepLookingFileMetaData["thumbnail"] = "11_1_thumbnail"
keepLookingFileMetaData["totalPages"] = totalPages
keepLookingFileMetaData["currentPageNum"] = totalPages
keepLookingFileMetaData["chapterPageNums"] = chapterPageValues
keepLookingFileMetaData["progPercent"] = (keepLookingFileMetaData["currentPageNum"] / keepLookingFileMetaData["totalPages"]) * 100
keepLookingFileMetaData["displayPercent"] = round(keepLookingFileMetaData["progPercent"])
addSliderData(keepLookingFileMetaData, movieDict[keepLookingFileMetaData["doi"]])
addSpeciesToDict(keepLookingFileMetaData["videoTitle"], "keep-looking.html", "", "", "Keep Looking")
writePage(SITEDIR, "keepLooking.md", "section-refactor", "keep-looking", keepLookingFileMetaData)

# Render feature index page
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeFeatures"] = True
metadata["chapter"] = "A"
metadata["title"] = "Feature Index"
metadata["prevSection"] = "keep-looking"
metadata["nextSection"] = "B-scientist-profiles"
featureIndex = None
with open("features.json", "r", encoding='utf-8') as f:
    featureIndex = json.load(f)
metadata["featureIndex"] = [{"name": key, "refs": featureIndex[key]} for key in featureIndex]
writePage(SITEDIR, "features.md", "page", "A-feature-index", metadata)

# Render profiles page
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeProfiles"] = True
metadata["chapter"] = "B"
metadata["title"] = "Scientist Profiles"
metadata["prevSection"] = "A-feature-index"
metadata["nextSection"] = "C-phylogenetic-tree"
metadata["profiles"] = profiles
writePage(SITEDIR, "profiles.md", "page", "B-scientist-profiles", metadata)

# Render phylogenetic tree page
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeTree"] = True
metadata["chapter"] = "C"
metadata["title"] = "Phylogenetic Tree"
metadata["prevSection"] = "B-scientist-profiles"
metadata["nextSection"] = "D-references"
speciesList = []
for species in speciesDict:
    speciesObj = {}
    speciesObj["species"] = speciesDict[species]["species"]
    speciesObj["speciesObjs"] = speciesDict[species]["speciesObjs"]
    speciesObj["id"] = speciesDict[species]["id"]
    speciesList.append(speciesObj)
metadata["speciesList"] = speciesList 
writePage(SITEDIR, "phylogenetics.md", "page", "C-phylogenetic-tree", metadata)

# Render bibliography page 
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeReferences"] = True
metadata["chapter"] = "D"
metadata["title"] = "References"
metadata["prevSection"] = "C-phylogenetic-tree"
with open("bib.json", "w", encoding='utf-8') as f:
    json.dump(usedBibs, f)
writePage(SITEDIR, "bib.json", "page", "D-references", metadata)
os.remove("bib.json")

# Render about page
metadata = getMarkdownMetadata("about.md")
metadata["typeAppendix"] = True
metadata["appendixTypeAbout"] = True
aboutEntries = []
with open("about.md", 'r', encoding='utf-8') as f:
    for line in f.readlines():
        if re.search(r"##", line):
            entry = {}
            entry["name"] = line.split("##")[1].strip()
            entry["content"] = ""
            entry["id"] = re.sub(r"[^\w\s]", "", entry["name"].replace(" ", "-"))
            aboutEntries.append(entry)
        elif not re.search(r"---", line) and not re.search("title: About this Book", line):
            aboutEntries[-1]["content"] = aboutEntries[-1]["content"] + line    
metadata["aboutEntries"] = aboutEntries
writePage(SITEDIR, "about.md", "page", "about", metadata)

# Render download page
metadata = getMarkdownMetadata("download.md")
metadata["typeAppendix"] = True
metadata["appendixTypeDownload"] = True
writePage(SITEDIR, "download.md", "page", "download", metadata)

# Render data dict for search index
with open("{}/searchData.json".format(SITEDIR), "w", encoding="utf-8") as f:
    json.dump(searchData, f, indent="\t")

# Render search test page
metadata = {}
metadata["title"] = "Search Test"
writePage(SITEDIR, "search-test.md", "search-test", "search-test", metadata)