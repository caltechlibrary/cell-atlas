import os
import shutil
import subprocess

siteDir = "site"

# Create site directory with assets
if os.path.isdir(siteDir): shutil.rmtree(siteDir)
os.mkdir(siteDir)
shutil.copytree("img/", f"{siteDir}/img")
shutil.copytree("styles/", f"{siteDir}/styles")
shutil.copytree("js/", f"{siteDir}/js")

# Render landing page
subprocess.run(["pandoc", "--from=markdown", "--to=html", f"--output={siteDir}/index.html", "--template=templates/index.tmpl", "index.md"])