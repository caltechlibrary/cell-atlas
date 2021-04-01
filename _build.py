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
    # Add ID for the video player if there is one
    if "doi" in metadata or "video" in metadata: 
        metadata["vidMetadata"] = {}
        metadata["vidMetadata"]["video"] = metadata["video"]
        metadata["vidMetadata"]["thumbnail"] = metadata["thumbnail"]
        if "doi" in metadata:
            metadata["vidMetadata"]["species"] = metadata["videoTitle"]
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
            metadata["subsectionsData"].append(processSubsection("subsections/{}.md".format(subsection)))
    # create temp metadata file to pass to pandoc
    with open("metadata.json", "w") as f:
        json.dump(metadata, f)

    if("appendixTypeDownload" not in metadata):
        writePageOffline(sourceFormatted, template, pageName, metadata, ZIPDIR_SMALL)
        writePageOffline(sourceFormatted, template, pageName, metadata, ZIPDIR_LARGE)

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
            pandocArgs.append("--metadata=video:{}".format(smallVideoName))
    else:
        if("doi" in offlineMetadata):
            pandocArgs.append("--metadata=video:{}".format(movieDict[offlineMetadata["doi"]]))

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
    
    with open("metadataOffline.json", "w") as f:
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

def processSubsection(subsectionFile):
    metadata = getMarkdownMetadata(subsectionFile)
    metadata["id"] = subsectionFile.split("/")[-1][:-3]
    metadata["collectorProfile"] = False
    if "video" in metadata:
        currVideoName = metadata["video"].split(".")[0]
        subsectionName = currVideoName.split("_")[-1]
        if subsectionName.isnumeric():
            metadata["thumbnail"] = "{}_thumbnail".format(currVideoName)
        else:
            metadata["thumbnail"] = "{}_thumbnail".format("_".join(currVideoName.split(".")[0].split("_")[:-1]))
    if("doi" in metadata):
        metadata["video"] = movieDict[metadata["doi"]]
    # Check if collector profile exist in in scientist profiles
    addCollectorData(metadata, "collector")
    addCollectorData(metadata, "source")
    # Format any references in the metadata (right now, I'm just going to hard code it to the source fields of schematics)
    if("source" in metadata): 
        metadata["source"] = insertRefLinks(metadata["source"], isSchematic=True)
        metadata["collector"] = metadata["source"]
    # Add player id for videos
    if "doi" in metadata or "video" in metadata: 
        metadata["playerId"] = "player-" + subsectionFile[subsectionFile.index("/")+1 : subsectionFile.index(".")]
    
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
    for sectionFile in sectionFiles:
        sectionMetadata = getMarkdownMetadata("sections/{}".format(sectionFile))
        chapter, navSection, *title = sectionFile[:-3].split("-")
        if navSection == "0":
            navChapter = {}
            navChapter["sections"] = []
            navChapter["chapter"] = chapter
            navChapter["title"] = sectionMetadata["title"]
            navChapter["page"] = chapter + "-" + "-".join(title)
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
    with open(sourceFile, "r") as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open(outFile, "w") as f:
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
            

# function to create directory that will contain compiled content
# this function will delete `siteDir` argument if the directory already exists. So be careful
def createSiteDirectory(siteDir, zipDirSmall, zipDirLarge):
    if os.path.isdir(siteDir):
        shutil.rmtree(siteDir)
    os.mkdir(siteDir)
    shutil.copytree("styles/", "{}/styles/".format(siteDir))
    shutil.copytree("js/", "{}/js/".format(siteDir))
    shutil.copytree("img/", "{}/img/".format(siteDir))

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
siteNav = createNavData()
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
with open("dois.csv", "r") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        doi = row["DOI"]
        movie = row["movie"]
        movieDict[doi] = movie

# Render landing page
metadata = {}
metadata["firstPage"] = "begin"
writePage(SITEDIR, "index.md", "index","index", metadata)

# Render opening quote page for introduction
metadata = {}
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
writePage(SITEDIR, "introduction.md", "page", "introduction", introFileMetaData)

# Render section pages
for i in range(len(sectionFiles)):
    fileName = sectionFiles[i]
    metadata = getMarkdownMetadata("sections/{}".format(fileName))
    metadata["chapter"], metadata["section"], *title = fileName.split("-")
    metadata["collectorProfile"] = False
    metadata["prevSection"] = None
    metadata["nextSection"] = None
    if(title[0] == "summary.md"):
        metadata["thumbnail"] = "{}_thumbnail".format(metadata["video"].split(".")[0])
    else:
        metadata["thumbnail"] = "{}_{}_thumbnail".format(metadata["chapter"], metadata["section"])
    
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
    if metadata["section"] != "0":
        metadata["typeSection"] = True
    else:
        metadata["typeChapter"] = True
        del metadata["section"] # We don't want to register "0" as a section
    writePage(SITEDIR, "sections/{}".format(fileName), "page", pageName, metadata)

# Render opening quote page for "Keep Looking"
metadata = {}
metadata["prevSection"] = sectionFiles[-1][:-3]
metadata["nextSection"] = "keep-looking"
metadata["typeChapter"] = True
writePage(SITEDIR, "outlook.md", "page", "outlook", metadata)

# Render keep looking page
keepLookingFileMetaData = {}
keepLookingFileMetaData = getMarkdownMetadata("keepLooking.md")
keepLookingFileMetaData["typeSection"] = True
keepLookingFileMetaData["prevSection"] = "outlook"
keepLookingFileMetaData["nextSection"] = "A-feature-index"
keepLookingFileMetaData["subsectionsData"] = []
keepLookingFileMetaData["thumbnail"] = "11_1_thumbnail"
writePage(SITEDIR, "keepLooking.md", "page", "keep-looking", keepLookingFileMetaData)

# Render feature index page
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeFeatures"] = True
metadata["chapter"] = "A"
metadata["title"] = "Feature Index"
metadata["prevSection"] = "keep-looking"
metadata["nextSection"] = "B-scientist-profiles"
featureIndex = None
with open("features.json", "r") as f:
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
writePage(SITEDIR, "phylogenetics.md", "page", "C-phylogenetic-tree", metadata)

# Render bibliography page 
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeReferences"] = True
metadata["chapter"] = "D"
metadata["title"] = "References"
metadata["prevSection"] = "C-phylogenetic-tree"
with open("bib.json", "w") as f:
    json.dump(usedBibs, f)
writePage(SITEDIR, "bib.json", "page", "D-references", metadata)
os.remove("bib.json")

# Render about page
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeAbout"] = True
aboutEntries = []
with open("about.md", 'r') as f:
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
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeDownload"] = True
writePage(SITEDIR, "download.md", "page", "download", metadata)