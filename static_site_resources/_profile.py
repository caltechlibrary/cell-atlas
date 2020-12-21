# Convert 12_Profiles.Rmd to individual markdown files describing scientist profiles 

import re

filen = '../12_Profiles.Rmd'
diro = 'profiles'

with open(filen, "r") as f:
    profile = {}
    profile["name"] = ""
    profile["image"] = ""
    profile["blurb"] = ""
    for line in f.readlines():
        if re.search(r"##", line):
            if profile["name"] != "":
                profileFile = "{}/{}.md".format(diro, profile["name"].replace(" ", "-").lower())
                with open(profileFile, "w") as pf:
                    pf.write("---\n")
                    pf.write("title: {}\n".format(profile["name"]))
                    pf.write("img: {}\n".format(profile["image"]))
                    pf.write("---\n")
                    pf.write(profile["blurb"])
            profile = {}
            profile["name"] = line.split("# ")[1].split("{")[0].strip()
            profile["image"] = ""
            profile["blurb"] = ""
        elif re.search(r"knitr", line):
            profile["image"] = line.split("'")[1].split("/")[2]
        elif not re.search("```", line):
            profile["blurb"] = profile["blurb"] + line