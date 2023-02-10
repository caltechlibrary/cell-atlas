import sys
import os
import shutil
import subprocess


def convertSubDirToWebp(path, dirName):
    for entry in os.scandir(path):
        subprocess.run(
            f"cwebp {entry.path} -m 6 -q 90 -o {outDir}/{dirName}/{entry.name.split('.')[0]}.webp"
        )


inDir = sys.argv[1]
outDir = "webp"
if os.path.exists(outDir):
    shutil.rmtree(outDir)
os.mkdir(outDir)

for entry in os.scandir(inDir):
    if entry.is_dir():
        os.mkdir(f"{outDir}/{entry.name}")
        convertSubDirToWebp(entry.path, entry.name)
    else:
        subprocess.run(
            f"cwebp {entry.path} -m 6 -q 90 -o {outDir}/{entry.name.split('.')[0]}.webp"
        )
