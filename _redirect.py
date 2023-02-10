import os
import shutil
import subprocess
import json


def getYAMLMetadata(fileName):
    return json.loads(
        subprocess.check_output(
            [
                "pandoc",
                "--from=markdown",
                "--to=plain",
                "--template=templates/metadata.txt",
                fileName,
            ]
        )
    )


def getPageName(fileName):
    pageName = os.path.basename(fileName)
    pageName = os.path.splitext(pageName)[0]
    pageName = pageName.replace("-0-", "-")
    return pageName


def getPageTitle(fileName):
    metadata = getYAMLMetadata(fileName)
    title = metadata["title"]
    if os.path.dirname(fileName) == "sections":
        sectionFileBaseName = os.path.basename(fileName)
        chapter = sectionFileBaseName.split("-")[0]
        section = sectionFileBaseName.split("-")[1]
        title = f"{chapter}.{section} {title}"
    if fileName != "index.md":
        title = f"{title} | Atlas of Bacterial and Archaeal Cell Structure"
    return title


def writeRedirectPage(redirectDir, fileName):
    pageName = getPageName(fileName)
    title = getPageTitle(fileName)
    subprocess.run(
        [
            "pandoc",
            "--from=markdown",
            "--to=html",
            f"--output={redirectDir}/{pageName}.html",
            "--template=templates/redirect.html",
            f"--metadata=title:{title}",
            f"--metadata=pageName:{pageName}",
            fileName,
        ]
    )


redirectDir = "redirects"
sectionFileNames = sorted(
    os.listdir("sections"), key=lambda s: (int(s.split("-")[0]), int(s.split("-")[1]))
)
appendixFileNames = os.listdir("appendix")

if os.path.isdir(redirectDir):
    shutil.rmtree(redirectDir)
os.mkdir(redirectDir)

# Create redirect pages for every page in book
writeRedirectPage(redirectDir, "index.md")
writeRedirectPage(redirectDir, "begin.md")
writeRedirectPage(redirectDir, "introduction.md")
for fileName in sectionFileNames:
    writeRedirectPage(redirectDir, f"sections/{fileName}")
writeRedirectPage(redirectDir, "outlook.md")
writeRedirectPage(redirectDir, "keep-looking.md")
for fileName in appendixFileNames:
    writeRedirectPage(redirectDir, f"appendix/{fileName}")
writeRedirectPage(redirectDir, "about.md")
writeRedirectPage(redirectDir, "download.md")
