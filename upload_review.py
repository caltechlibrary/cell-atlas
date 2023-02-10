import os, json
from caltechdata_api import caltechdata_edit, caltechdata_write

# Get access token from as environment variable with source token.bash
token = os.environ["RDMTOK"]

metaf = open("cd_review.json", "r")
metadata = json.load(metaf)

production = True
# parent = 'eyh31-0eh80'

response = caltechdata_write(
    metadata, token, ["ReviewPack.pdf"], production, publish=True
)
print(response)
