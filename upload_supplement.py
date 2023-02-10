import os, json
from caltechdata_api import caltechdata_edit

# Get access token from CaltechDATA as environment variable with source token.bash
token = os.environ["RDMTOK"]

metaf = open("cd_supplemental_metadata.json", "r")
metadata = json.load(metaf)

production = True
parent = "w7gp3-h5740"

response = caltechdata_edit(
    parent,
    metadata,
    token,
    ["narration.zip", "stillimages.zip", "pdbs.zip"],
    production,
    publish=True,
)
print(response)
