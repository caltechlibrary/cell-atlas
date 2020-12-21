# Build reference dictionary through source .txt files and parse 11_Features.Rmd for Feature Index Data

import argparse 
import re 
import json

parser = argparse.ArgumentParser(description=\
        "Transform text file chapters to Rmarkdown")
parser.add_argument('chapter_file', nargs='*', help=\
            'file name for text file')

args = parser.parse_args()
referenceDict = {}
featureIndex = {}

# Hardcoded chapter 4 map, unfortunately
fourDict = {
    "1": {
        "title": "4.1 Stalk Bands",
        "link": "4-1-stalk-bands"
    },
    "2" : {
        "title": "4.2 Nanowires",
        "link": "4-2-nanowires"
    }, 
    "3": {
        "title": "4.3 Intracytoplasmic Membrane",
        "link": "4-3-intracytoplasmic-membrane"
    },
    "4": {
        "title": "4.4 Enzyme Filaments",
        "link": "4-4-enzyme-filaments"
    }, 
    "5": {
        "title": "4.5 Microcompartments",
        "link": "4-5-microcompartments" 
    },
    "6": {
        "title": "4.6 Carboxysomes",
        "link": "4-6-carboxysomes"
    },
    "7": {
        "title": "4.7 Bacterial Storage Granules",
        "link": "4-7-bacterial-storage-granules"
    },
    "8": {
        "title": "4.8 Storage Granule Variety",
        "link": "4-8-storage-granule-variety"
    },
    "9": {
        "title": "4.9 Archaeal Storage Granules",
        "link": "4-9-archaeal-storage-granules"
    }
}

# Loop through lines in txt file and create json form of chapter
for filen in args.chapter_file:
    infile =  open(filen,'r')
    filen = filen[3:] # Remove "../" path from file name
    split = filen.split('_')
    chapter = split[0].lstrip("0")
    currSection = ""
    sectionTitle = ""
    for line in infile.readlines():
        # Section
        if re.search(r"^\[\d+_", line):
            split = line.split('_')
            number = split[1]
            currSection = line.split(']')[1].strip().lower().replace(" ", "-")
            section = "{}-{}-{}".format(chapter, number, currSection)
            sectionTitle = line.split("] ")[1]
            label = "{}.{} {}".format(chapter, number, sectionTitle)
            if(chapter == "4" and int(number) >= 5):
                section = fourDict[str(int(number) - 1)]["link"]
                label = fourDict[str(int(number) - 1)]["title"]
            referenceDict["{}-{}".format(chapter, number)] = {
                "section": section,
                "label": label.strip()
            }
        # More
        elif re.search(r"^\[\d", line): 
            split = line.split('_')
            number = split[0].lstrip("[")
            sectionNumber = number[:-1]
            section = "{}-{}-{}".format(chapter, sectionNumber, currSection)
            subsectionTitle = line.split("More: ")[1]
            title = split[1].split("More:")[1].lstrip().lower().replace(" ", "-").strip()
            label = "{}.{} {}: {}".format(chapter, sectionNumber, sectionTitle.strip(), subsectionTitle)         
            if(chapter == "4" and int(sectionNumber) >= 5):
                section = fourDict[str(int(sectionNumber) - 1)]["link"]
                label = fourDict[str(int(sectionNumber) - 1)]["title"] + ": " + subsectionTitle
            referenceDict["{}-{}".format(chapter, number)] = {
                "section": section,
                "subsection": "{}".format(title),
                "label": label.strip()
            }
        elif re.search(r"^\d_", line):
            numbers = line.split(" ")[0]
            chapter = numbers.split("_")[0]
            sectionNumber = numbers.split("_")[1]
            section = "{}-{}-{}".format(chapter, sectionNumber, currSection)
            subsectionTitle = line.split("Schematic: ")[1]
            title = line.split("Schematic: ")[1].lstrip().lower().replace(" ", "-").strip()
            label = "{}.{} {}: {}".format(chapter, sectionNumber, sectionTitle.strip(), subsectionTitle)
            if(chapter == "4" and int(sectionNumber) >= 5):
                section = fourDict[str(int(sectionNumber) - 1)]["link"]
                label = fourDict[str(int(sectionNumber) - 1)]["title"] + ": " + subsectionTitle
            referenceDict["{}-{}".format(chapter, number)] = {
                "section": section,
                "subsection": "{}".format(title),
                "label": label.strip()
            }


filen = '../11_Features.Rmd'
refsNotFound = []

with open(filen, "r") as f:
    feature = {}
    feature["name"] = ""
    feature["refs"] = []
    for line in f.readlines():
        if re.search(r"##", line):
            if feature["name"] != "":
                featureIndex[feature["name"]] = feature["refs"]
                feature = {}
                feature["name"] = ""
                feature["refs"] = []
            feature["name"] = line[3:-4].strip()
        elif re.search(r"\\@ref", line):
            ref = line.split("fig:")[-1].rstrip()[:-1]
            species = line.split("\@ref")[0].strip()
            if ref in referenceDict:
                feature["refs"].append({
                    "species": species, 
                    "ref": referenceDict[ref]
                })
            else:
                refsNotFound.append(line)

# Save feature index to json file
with open("features.json", "w") as f:
        json.dump(featureIndex, f)