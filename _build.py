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

def writeSection(siteDir, filen, pageName, metadata):
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
            "--template=templates/page.tmpl",
            filen
        ]
    )
    # remove temp metadata file once we are done using it
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
with open("metadata.json", "w") as f:
    json.dump(metadata, f)
subprocess.run(
    args= [
        "pandoc", 
        "--from=markdown", 
        "--to=html", 
        "--output={}/index.html".format(SITEDIR), 
        "--metadata-file=metadata.json", 
        "--template=templates/index.tmpl",
        "index.md"
    ]
)
    # remove temp metadata file once we are done using it
os.remove("metadata.json")

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
# Create temp markdown file with inserted ref links
with open("introQuote.md", "r") as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open("section.md", "w") as f:
            f.write(formattedContent)
writeSection(SITEDIR, "section.md", "begin", metadata)
os.remove("section.md")

# Render introduction page
metadata = {}
introFileMetaData = getMarkdownMetadata("introduction.md")
if introFileMetaData["collector"] in profileDict:
    metadata["collectorProfile"] = profileDict[introFileMetaData["collector"]]["name"]
    metadata["collectorId"] = profileDict[introFileMetaData["collector"]]["id"]
metadata["typeSection"] = True
metadata["nav"] = siteNav
metadata["prevSection"] = "begin"
metadata["nextSection"] = sectionFiles[0][:-3].split("-")[0] + "-" + "".join(sectionFiles[0][:-3].split("-")[2:])
metadata["subsectionsData"] = []
acknowledgements = getMarkdownMetadata("acknowledgements.md")
acknowledgements["id"] = "acknowledgements"
# Create temp markdown file with inserted ref links
with open("introduction.md", "r") as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open("section.md", "w") as f:
            f.write(formattedContent)
with open("acknowledgements.md", "r") as f:
    formattedContent = insertRefLinks(f.read())
    formattedContent = insertProfileLinks(formattedContent)
    with open("subsection.md", "w") as f:
        f.write(formattedContent)
# Store subsection content as html because this will be passed to pandoc as metadata
acknowledgements["html"] = markdownToHTML("subsection.md")
metadata["subsectionsData"].append(acknowledgements)
writeSection(SITEDIR, "section.md", "introduction", metadata)
os.remove("subsection.md") 
os.remove("section.md")

# Render section pages
for i in range(len(sectionFiles)):
    fileName = sectionFiles[i]
    sectionMetadata = getMarkdownMetadata("sections/{}".format(fileName))
    metadata = {} # metadata we will build in addition to metadata stored in markdown file
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

    # Insert any references/profile links and write it to temp file
    with open("sections/{}".format(fileName), "r") as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open("section.md", "w") as f:
            f.write(formattedContent)
    
    # Check if collector profile exist in in scientist profiles
    if "collector" in sectionMetadata:
        if sectionMetadata["collector"] in profileDict:
            metadata["collectorProfile"] = profileDict[sectionMetadata["collector"]]["name"]
            metadata["collectorId"] = profileDict[sectionMetadata["collector"]]["id"]
    
    # Process any subsections
    if "subsections" in sectionMetadata and sectionMetadata["subsections"]:
        # Aggregate "learn more" subsection content associated with this section
        metadata["subsectionsData"] = []
        for subsection in sectionMetadata["subsections"]:
            currSubsection = getMarkdownMetadata("subsections/{}.md".format(subsection))
            currSubsection["id"] = subsection
            currSubsection["collectorProfile"] = False
            # Check if collector profile exist in in scientist profiles
            if "collector" in currSubsection:
                if currSubsection["collector"] in profileDict:
                    currSubsection["collectorProfile"] = profileDict[currSubsection["collector"]]["name"]
                    currSubsection["collectorId"] = profileDict[currSubsection["collector"]]["id"]
            elif "source" in currSubsection:
                if currSubsection["source"] in profileDict:
                    currSubsection["collectorProfile"] = profileDict[currSubsection["source"]]["name"]
                    currSubsection["collectorId"] = profileDict[currSubsection["source"]]["id"]
            # Create temp markdown file with inserted ref links
            with open("subsections/{}.md".format(subsection), "r") as f:
                formattedContent = insertRefLinks(f.read())
                formattedContent = insertProfileLinks(formattedContent)
                with open("subsection.md", "w") as f:
                    f.write(formattedContent)
            # Format any references in the metadata (right now, I'm just going to hard code it to the source fields of schematics)
            if("source" in currSubsection): currSubsection["source"] = insertRefLinks(currSubsection["source"], isSchematic=True)
            # Store subsection content as html because this will be passed to pandoc as metadata
            currSubsection["html"] = markdownToHTML("subsection.md")
            os.remove("subsection.md") 
            metadata["subsectionsData"].append(currSubsection)
    
    pageName = fileName[:-3] if metadata["section"] != "0" else metadata["chapter"] + "-" + "".join(title)[:-3]
    template = None
    if metadata["section"] != "0":
        metadata["typeSection"] = True
    else:
        metadata["typeChapter"] = True
        del metadata["section"] # We don't want to register "0" as a section
    writeSection(SITEDIR, "section.md", pageName, metadata)
    os.remove("section.md")

# Render opening quote page for "Keep Looking"
metadata = {}
metadata["nav"] = siteNav
metadata["prevSection"] = sectionFiles[-1][:-3]
metadata["nextSection"] = "keep-looking"
metadata["typeChapter"] = True
# Create temp markdown file with inserted ref links
with open("outlook.md", "r") as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open("section.md", "w") as f:
            f.write(formattedContent)
writeSection(SITEDIR, "section.md", "outlook", metadata)
os.remove("section.md")

# Render keep looking page
metadata = {}
keepLookingFileMetaData = getMarkdownMetadata("keepLooking.md")
if keepLookingFileMetaData["collector"] in profileDict:
    metadata["collectorProfile"] = profileDict[keepLookingFileMetaData["collector"]]["name"]
    metadata["collectorId"] = profileDict[keepLookingFileMetaData["collector"]]["id"]
metadata["typeSection"] = True
metadata["nav"] = siteNav
metadata["prevSection"] = "outlook"
metadata["nextSection"] = "A-feature-index"
metadata["subsectionsData"] = []
# Create temp markdown file with inserted ref links
with open("keepLooking.md", "r") as f:
        formattedContent = insertRefLinks(f.read())
        formattedContent = insertProfileLinks(formattedContent)
        with open("section.md", "w") as f:
            f.write(formattedContent)
# Store subsection content as html because this will be passed to pandoc as metadata
writeSection(SITEDIR, "section.md", "keep-looking", metadata)
os.remove("section.md")

# Render feature index page
featureIndex = None
with open("features.json", "r") as f:
    featureIndex = json.load(f)
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeFeatures"] = True
metadata["chapter"] = "A"
metadata["title"] = "Feature Index"
metadata["nav"] = siteNav
metadata["featureIndex"] = [{"name": key, "refs": featureIndex[key]} for key in featureIndex]
metadata["nextSection"] = "B-scientist-profiles"
metadata["prevSection"] = "keep-looking"
with open("metadata.json", "w") as f:
    json.dump(metadata, f)
subprocess.run(
    args= [
        "pandoc",
        "--template=templates/page.tmpl",
        "--metadata-file=metadata.json",
        "--output={}/A-feature-index.html".format(SITEDIR),
        "features.md" 
    ]
)
os.remove("metadata.json")

# Render profiles page
profilesDir = "profiles"
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeProfiles"] = True
metadata["chapter"] = "B"
metadata["title"] = "Scientist Profiles"
metadata["nav"] = siteNav
metadata["profiles"] = profiles
metadata["nextSection"] = "C-phylogenetic-tree"
metadata["prevSection"] = "A-feature-index"
with open("metadata.json", "w") as f:
    json.dump(metadata, f)
subprocess.run(
    args= [
        "pandoc",
        "--template=templates/page.tmpl",
        "--metadata-file=metadata.json",
        "--output={}/B-scientist-profiles.html".format(SITEDIR),
        "profiles.md" 
    ]
)
os.remove("metadata.json")

# Render phylogenetic tree page
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeTree"] = True
metadata["chapter"] = "C"
metadata["title"] = "Phylogenetic Tree"
metadata["nav"] = siteNav
metadata["nextSection"] = "D-references"
metadata["prevSection"] = "B-scientist-profiles"
with open("metadata.json", "w") as f:
    json.dump(metadata, f)
subprocess.run(
    args= [
        "pandoc",
        "--template=templates/page.tmpl",
        "--metadata-file=metadata.json",
        "--output={}/C-phylogenetic-tree.html".format(SITEDIR),
        "phylogenetics.md" 
    ]
)
os.remove("metadata.json")

# Render bibliography
metadata = {}
metadata["typeAppendix"] = True
metadata["appendixTypeReferences"] = True
metadata["chapter"] = "D"
metadata["title"] = "References"
metadata["nav"] = siteNav
metadata["prevSection"] = "C-phylogenetic-tree"
with open("metadata.json", "w") as f:
    json.dump(metadata, f)
with open("bib.json", "w") as f:
    json.dump(usedBibs, f)
subprocess.run(
    args= [
        "pandoc",
        "--from=csljson",
        "--template=templates/page.tmpl",
        "--metadata-file=metadata.json",
        "--output={}/D-references.html".format(SITEDIR),
        "--citeproc",
        "--csl=springer-socpsych-brackets.csl",
        "bib.json"
    ]
)
os.remove("bib.json")
os.remove("metadata.json")

# Render about page
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
metadata = {}
metadata["aboutEntries"] = aboutEntries
metadata["typeAppendix"] = True
metadata["appendixTypeAbout"] = True
metadata["nav"] = siteNav
with open("metadata.json", "w") as f:
    json.dump(metadata, f)
subprocess.run(
    args= [
        "pandoc",
        "--template=templates/page.tmpl",
        "--metadata-file=metadata.json",
        "--output={}/about.html".format(SITEDIR),
        "about.md" 
    ]
)
os.remove("metadata.json")