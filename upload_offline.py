import os, json
from caltechdata_api import caltechdata_edit

# Get access token for CaltechDATA as environment variable with source token.bash
token = os.environ["RDMTOK"]

metaf = open("cd_metadata.json", "r")
metadata = json.load(metaf)

production = True
parent = "w6hhb-mc015"

response = caltechdata_edit(
    parent,
    metadata,
    token,
    ["cell_atlas_offline.zip", "cell_atlas_offline_lite.zip"],
    production,
    publish=True,
)
print(response)
