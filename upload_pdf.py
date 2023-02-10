import os, json
from caltechdata_api import caltechdata_edit

# Get access token from as environment variable with source token.bash
token = os.environ["RDMTOK"]

metaf = open("cd_pdf.json", "r")
metadata = json.load(metaf)

production = True
parent = "eyh31-0eh80"

response = caltechdata_edit(
    parent, metadata, token, ["AtlasEdition2.4.pdf"], production, publish=True
)
print(response)
