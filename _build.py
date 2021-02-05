# This script is a bit unorganized currently. Will be rewritten soon.

import subprocess
import json
import os
import shutil
import re 

SITEDIR = "site"

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

def writePage(siteDir, sourceFile, template, pageName, metadata):
    # Check if collector profile exist in in scientist profiles
    if "collector" in metadata:
        if metadata["collector"] in profileDict:
            metadata["collectorProfile"] = profileDict[metadata["collector"]]["name"]
            metadata["collectorId"] = profileDict[metadata["collector"]]["id"]
    # create temp file with inserted references/profiles
    with open(sourceFile, "r") as srcF:
        formattedContent = insertRefLinks(srcF.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open("section.md", "w") as f:
            f.write(formattedContent)
    # create temp metadata file to pass to pandoc
    with open("metadata.json", "w") as f:
        json.dump(metadata, f)
    subprocess.run(
        args= [
            "pandoc", 
            "--from=markdown", 
            "--to=html", 
            "--output={}/{}.html".format(siteDir, pageName), 
            "--metadata-file=metadata.json", 
            "--template=templates/{}.tmpl".format(template),
            "section.md"
        ]
    )
    # remove temp metadata and source file file once we are done using it
    os.remove("metadata.json")
    os.remove("section.md")

def processSubsection(subsectionFile):
    metadata = getMarkdownMetadata(subsectionFile)
    metadata["id"] = subsectionFile.split("/")[-1][:-3]
    
    metadata["collectorProfile"] = False
    # Check if collector profile exist in in scientist profiles
    if "collector" in metadata:
        if metadata["collector"] in profileDict:
            metadata["collectorProfile"] = profileDict[metadata["collector"]]["name"]
            metadata["collectorId"] = profileDict[metadata["collector"]]["id"]
    elif "source" in metadata:
        if metadata["source"] in profileDict:
            metadata["collectorProfile"] = profileDict[metadata["source"]]["name"]
            metadata["collectorId"] = profileDict[metadata["source"]]["id"]
    # Format any references in the metadata (right now, I'm just going to hard code it to the source fields of schematics)
    if("source" in metadata): metadata["source"] = insertRefLinks(metadata["source"], isSchematic=True)
    
    with open(subsectionFile, "r") as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open("subsection.md", "w") as f:
            f.write(formattedContent)
    # Return subsection content as html because this will be passed to pandoc as metadata
    metadata["html"] = markdownToHTML("subsection.md")
    os.remove("subsection.md")
    return metadata

def writeAppendixPage(metadata, sourceFile, outFile):
    with open("metadata.json", "w") as f:
        json.dump(metadata, f)
    pandocArgs = [ "pandoc", "--template=templates/page.tmpl", "--metadata-file=metadata.json", "--output={}/{}.html".format(SITEDIR, outFile)]
    if("appendixTypeReferences" in metadata):
        pandocArgs = pandocArgs + ["--from=csljson", "--citeproc", "--csl=springer-socpsych-brackets.csl"]
    pandocArgs.append(sourceFile)
    subprocess.run(pandocArgs)
    os.remove("metadata.json")

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

def getMarkdownMetadata(file):
    process = subprocess.run(
        args=[
            "pandoc", 
            "--template=templates/metadata.tmpl", 
            file], 
            stdout=subprocess.PIPE
    )
    return json.loads(process.stdout) # metadata included in the `section` file

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

# function to create directory that will contain compiled content
# this function will delete `siteDir` argument if the directory already exists. So be careful
def createSiteDirectory(siteDir):
    if os.path.isdir(siteDir):
        shutil.rmtree(siteDir)
    os.mkdir(siteDir)
    shutil.copytree("styles/", "{}/styles/".format(siteDir))
    shutil.copytree("js/", "{}/js/".format(siteDir))
    shutil.copytree("img/", "{}/img/".format(siteDir))
    if os.path.isdir("videos/"): shutil.copytree("videos/", "{}/videos/".format(siteDir))

createSiteDirectory(SITEDIR)
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
usedBibs = []

sectionFiles = sorted(os.listdir("sections"), key=lambda s: (int(s.split("-")[0]), int(s.split("-")[1])))

siteNav = createNavData()

# Render landing page
metadata = {}
metadata["firstPage"] = "begin"
writePage(SITEDIR, "index.md", "index","index", metadata)

# Create profiles data to use in section pages
profilesDir = "profiles"
profiles = []
profileDict = {}
profileFiles = sorted(os.listdir(profilesDir), key=lambda s: s.split("-")[-1])
for profileFile in profileFiles:
    profile = {}
    profileMetadata = getMarkdownMetadata("{}/{}".format(profilesDir, profileFile))
    profile["name"] = profileMetadata["title"]
    profile["img"] = profileMetadata["img"]
    profile["id"] = profile["name"].replace(" ", "")

    # Insert any possible reference links
    with open("{}/{}".format(profilesDir, profileFile), "r") as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open("profile.md", "w") as p:
            p.write(formattedContent)
    profile["html"] = markdownToHTML("profile.md")
    os.remove("profile.md")
    profiles.append(profile)
    profileDict[profile["name"]] = profile

# Render opening quote page for introduction
metadata = {}
metadata["nav"] = siteNav
metadata["nextSection"] = "introduction"
metadata["typeChapter"] = True
writePage(SITEDIR, "introQuote.md", "page", "begin", metadata)

# Render introduction page
introFileMetaData = getMarkdownMetadata("introduction.md")
introFileMetaData["typeSection"] = True
introFileMetaData["nav"] = siteNav
introFileMetaData["prevSection"] = "begin"
introFileMetaData["nextSection"] = sectionFiles[0][:-3].split("-")[0] + "-" + "".join(sectionFiles[0][:-3].split("-")[2:])
introFileMetaData["subsectionsData"] = []
introFileMetaData["subsectionsData"].append(processSubsection("acknowledgements.md"))
writePage(SITEDIR, "introduction.md", "page", "introduction", introFileMetaData)

# Render section pages
for i in range(len(sectionFiles)):
    fileName = sectionFiles[i]
    metadata = getMarkdownMetadata("sections/{}".format(fileName))
    metadata["chapter"], metadata["section"], *title = fileName.split("-")
    metadata["collectorProfile"] = False
    metadata["nav"] = siteNav
    metadata["prevSection"] = None
    metadata["nextSection"] = None
    
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
    
    # Process any subsections
    if "subsections" in metadata and metadata["subsections"]:
        # Aggregate "learn more" subsection content associated with this section
        metadata["subsectionsData"] = []
        for subsection in metadata["subsections"]:
            metadata["subsectionsData"].append(processSubsection("subsections/{}.md".format(subsection)))

    pageName = fileName[:-3] if metadata["section"] != "0" else metadata["chapter"] + "-" + "".join(title)[:-3]
    template = None
    if metadata["section"] != "0":
        metadata["typeSection"] = True
    else:
        metadata["typeChapter"] = True
        del metadata["section"] # We don't want to register "0" as a section
    writePage(SITEDIR, "sections/{}".format(fileName), "page", pageName, metadata)

# Render opening quote page for "Keep Looking"
metadata = {}
metadata["nav"] = siteNav
metadata["prevSection"] = sectionFiles[-1][:-3]
metadata["nextSection"] = "keep-looking"
metadata["typeChapter"] = True
writePage(SITEDIR, "outlook.md", "page", "outlook", metadata)

# Render keep looking page
metadata = {}
keepLookingFileMetaData = getMarkdownMetadata("keepLooking.md")
metadata["typeSection"] = True
metadata["nav"] = siteNav
metadata["prevSection"] = "outlook"
metadata["nextSection"] = "A-feature-index"
metadata["subsectionsData"] = []
writePage(SITEDIR, "keepLooking.md", "page", "keep-looking", metadata)

# Render feature index page
metadata = {}
metadata["nav"] = siteNav
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
writeAppendixPage(metadata, "features.md", "A-feature-index")

# Render profiles page
metadata = {}
metadata["nav"] = siteNav
metadata["typeAppendix"] = True
metadata["appendixTypeProfiles"] = True
metadata["chapter"] = "B"
metadata["title"] = "Scientist Profiles"
metadata["prevSection"] = "A-feature-index"
metadata["nextSection"] = "C-phylogenetic-tree"
metadata["profiles"] = profiles
writeAppendixPage(metadata, "profiles.md", "B-scientist-profiles")

# Render phylogenetic tree page
metadata = {}
metadata["nav"] = siteNav
metadata["typeAppendix"] = True
metadata["appendixTypeTree"] = True
metadata["chapter"] = "C"
metadata["title"] = "Phylogenetic Tree"
metadata["prevSection"] = "B-scientist-profiles"
metadata["nextSection"] = "D-references"
writeAppendixPage(metadata, "phylogenetics.md", "C-phylogenetic-tree")

# Render bibliography page 
metadata = {}
metadata["nav"] = siteNav
metadata["typeAppendix"] = True
metadata["appendixTypeReferences"] = True
metadata["chapter"] = "D"
metadata["title"] = "References"
metadata["prevSection"] = "C-phylogenetic-tree"
with open("bib.json", "w") as f:
    json.dump(usedBibs, f)
writeAppendixPage(metadata, "bib.json", "D-references")
os.remove("bib.json")

# Render about page
metadata = {}
metadata["nav"] = siteNav
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
writeAppendixPage(metadata, "about.md", "about")