# Convert existing txt files to markdown files that can be conveniently maintained and passed to pandoc

import argparse 
import os 
import re 
import csv 
import glob
import json
import shutil

parser = argparse.ArgumentParser(description=\
        "Transform text file chapters to Rmarkdown")
parser.add_argument('chapter_file', nargs='*', help=\
            'file name for text file')

args = parser.parse_args()

book_chapters = []

#Get dictionary of DOIs
dois = {}
doi_file = "../dois.csv"
with open(doi_file,'r') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        split = row['movie'].split('_')
        label = split[0]+'_'+split[1]
        dois[label] = row

# Loop through lines in txt file and create json form of chapter
for filen in args.chapter_file:
    chapter_map = {}
    infile =  open(filen,'r')
    filen = filen[3:] # Remove "../" path from file name
    split = filen.split('_')
    chapter_number = split[0].lstrip("0")
    title = os.path.splitext(split[1])[0].replace('-',' ')
    chapter_map["title"] = title
    chapter_map["chapter_number"] = chapter_number
    chapter_map["sections"] = []
    chapter_map["content"] = ""
    chapter_map["summary"] = {}

    section_map = {}
    section_map["more"] = []
    section_map["schematics"] = []
    section_map["content"] = ""
    curr_type = "chapter" # Keep track of what content we are currently reading
    for line in infile.readlines():
        # New section metadata of chapter
        if re.search(r"^\[\d+_" ,line):
            # If section_map is nonempty, append section to chapter and reset section_map
            if section_map:
                if section_map["content"]:
                    chapter_map["sections"].append(section_map)
                section_map = {}
                section_map["more"] = []
                section_map["schematics"] = []
                section_map["content"] = ""
            split = line.split('_')
            number = split[1]
            section = line.split(']')[1].strip()
            movie_label = chapter_number+'_'+number
            doi = dois[movie_label]
            
            section_map["number"] = number
            section_map["title"] = section
            section_map["doi"] = doi["DOI"]
            section_map["movie_title"] = doi["title"]
            section_map["movie"] = doi["movie"]
            section_map["movie_alt"] = movie_label + ".png"
            section_map["collector"] = doi["collector"]
            section_map["doi_title"] = doi["title"]

            curr_type = "section"
        # "More" section metadata
        elif re.search(r"^\[\d" ,line):
            split = line.split('_')
            number = split[0].replace('[','')
            cleaned = split[1].replace(']','')
            if 'More:' in cleaned:
                split = cleaned.split('More:')
            elif 'More-' in cleaned:
                split = cleaned.split('More-')
            else:
                print(f'missing line: {cleaned}')
                exit()
            section = split[0]
            link = split[1].strip()
            short_link = link.replace(' ','_').replace("'","")
            movie_label = chapter_number+'_'+number
            doi = dois[movie_label]
            
            section_map["more"].append({
                "section": section,
                "link": link,
                "short_link": short_link,
                "movie_label": movie_label,
                "doi": doi["DOI"],
                "movie": doi["movie"],
                "movie_alt": movie_label + ".png",
                "collector": doi["collector"],
                "doi_title": doi["title"],
                "content": ""
            })

            curr_type = "more"
        # "Schematic" section metadata
        elif line[0].isdigit():
            split = line.split(' ')
            schema_num = split[0]
            if 'Schematic:' in line:
                split = line.split('Schematic:')
            else:
                print(f'missing schematic {line}')
                exit()
            schema_name = split[1].strip()
            file_path = glob.glob('../img/schematics/'+schema_num+'*')
            short_name = schema_name.replace(' ','_').replace("'","")

            if len(file_path)>1:
                # Use gif version
                file_path = schema_num+'.gif'
            elif len(file_path) == 1:
                # Use whatever format was given
                file_path = file_path[0][19:] # Remove "../img/schematics/"
            else:
                print("Matched no files")
            
            section_map["schematics"].append({
                "schema_name": schema_name,
                "short_name": short_name,
                "file_path": file_path,
                "content": ""
            })

            curr_type = "schematic"
        # The special sections at the end
        elif re.search(r"^#" ,line):
            # Since we are in the special sections, we just passed the last section/more/schematic of the chapter
            if section_map:
                if section_map["content"]:
                    chapter_map["sections"].append(section_map)
                section_map = {}
                section_map["more"] = []
                section_map["schematics"] = []
                section_map["content"] = ""

            split = line.split(" ", 1)
            header = split[1][:-5]
            if len(split[0]) <= 2:
                chapter_map["summary"]["content"] = ""
                chapter_map["summary"]["video"] = ""
                curr_type = "summary"
            else:
                chapter_map["summary"]["content"] = chapter_map["summary"]["content"] + line[1:-4]
        elif re.search(r"knitr", line):
            chapter_map["summary"]["video"] = line.split("'")[1]
        # Quote at beginning
        elif line[0] == "“":
            line = "> " + line
            chapter_map["content"] = chapter_map["content"] + line
            curr_type = "chapter"
        # If none of the above, must be content (not metadata)
        else:
            if curr_type == "section":
                section_map["content"] = section_map["content"] + line
            elif curr_type == "more":
                section_map["more"][-1]["content"] = section_map["more"][-1]["content"] + line
            elif curr_type == "schematic":
                section_map["schematics"][-1]["content"] = section_map["schematics"][-1]["content"] + line
            elif curr_type == "chapter":
                chapter_map["content"] = chapter_map["content"] + line
            elif curr_type == "summary":
                if not re.search(r"```", line):
                    if re.search(r"•", line) or line == "\n":
                        chapter_map["summary"]["content"] = chapter_map["summary"]["content"] + line.replace("•", "-")
                    else:
                        chapter_map["summary"]["content"] = chapter_map["summary"]["content"] + "- " + line
    book_chapters.append(chapter_map)

# Add any possible links to content section of sections/subsections
for chapter in book_chapters:
    for section in chapter["sections"]:
        r = re.compile(r"\[Schematic:.*?]")
        offset = 0
        for match in re.finditer(r, section["content"]):
            title = match.group().split('Schematic:')[1].strip(" ]").title().replace(" ", "")
            id = title[0].lower() + title[1:]
            link_end = match.span()[1]+offset
            section["content"] = section["content"][:link_end]+'(#'+id+')'+section["content"][link_end:]
            offset = offset + 3 + len(id)
        r = re.compile(r"\[More: .*?]")
        offset = 0
        for match in re.finditer(r, section["content"]):
            title = match.group().split('More:')[1].strip(" ]").title().replace(" ", "")
            id = title[0].lower() + title[1:]
            link_end = match.span()[1]+offset
            section["content"] = section["content"][:link_end]+'(#'+id+')'+section["content"][link_end:]
            offset = offset + 3 + len(id)

# Create markdown files from chapter_map
sections_dir = "sections"
subsections_dir = "subsections"
if os.path.isdir(sections_dir):
        shutil.rmtree(sections_dir)
os.mkdir(sections_dir)
if os.path.isdir(subsections_dir):
        shutil.rmtree(subsections_dir)
os.mkdir(subsections_dir)

for chapter in book_chapters:
    chapter_file = "{}/{}-0-{}.md".format(sections_dir, chapter["chapter_number"], chapter["title"].lower())
    with open(chapter_file, "w") as f:
        f.write("---\n")
        f.write("title: {}\n".format(chapter["title"]))
        f.write("chapterNumber: {}\n".format(chapter["chapter_number"]))
        f.write("---\n")
        f.write(chapter["content"])
    summary_file = "{}/{}-{}-summary.md".format(sections_dir, chapter["chapter_number"], len(chapter["sections"])+1)
    with open(summary_file, "w") as f:
        f.write("---\n")
        f.write("title: Summary\n")
        f.write("media: {}\n".format(chapter["summary"]["video"]))
        f.write("---\n")
        f.write(chapter["summary"]["content"])
    for section in chapter["sections"]:
        # Create section markdown file
        section_file = "{}/{}-{}-{}.md".format(sections_dir, chapter["chapter_number"], section["number"], section["title"].lower().replace(" ", "-"))
        with open(section_file, "w") as f:
            f.write("---\n")
            f.write("title: {}\n".format(section["title"]))
            f.write("doi: {}\n".format(section["doi"]))
            f.write("videoTitle: {}\n".format(section["movie_title"]))
            f.write("video: {}\n".format(section["movie"]))
            f.write("videoAlt: {}\n".format(section["movie_alt"]))
            f.write("collector: {}\n".format(section["collector"]))
            f.write("subsections: {}\n".format(
                [more["link"].lower().replace(" ", "-") for more in section["more"]] + 
                [schematic["schema_name"].lower().replace(" ", "-").replace("'", "") for schematic in section["schematics"]]
            ))
            f.write("---\n")
            f.write(section["content"])
        # Create subsecitons files ("More" and "Schematic" content types)
        for subsection in section["more"]:
            subsection_file = "{}/{}.md".format(subsections_dir, subsection["link"].lower().replace(" ", "-"))
            with open(subsection_file, "w") as f:
                f.write("---\n")
                f.write("title: {}\n".format(subsection["link"]))
                f.write("species: {}\n".format(subsection["section"]))
                f.write("doi: {}\n".format(subsection["doi"]))
                f.write("video: {}\n".format(subsection["movie"]))
                f.write("videoAlt: {}\n".format(subsection["movie_alt"]))
                f.write("collector: {}\n".format(subsection["collector"]))
                f.write("---\n")
                f.write(subsection["content"])
        for subsection in section["schematics"]:
            subsection_file = "{}/{}.md".format(subsections_dir, subsection["schema_name"].lower().replace(" ", "-").replace("'", ""))
            with open(subsection_file, "w") as f:
                f.write("---\n")
                f.write("title: {}\n".format(subsection["schema_name"]))
                f.write("graphic: {}\n".format(subsection["file_path"]))
                f.write("---\n")
                f.write(subsection["content"])