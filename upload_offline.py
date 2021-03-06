import os, json
from caltechdata_api import caltechdata_write

#Get access token from TIND sed as environment variable with source token.bash
token = os.environ['TINDTOK']

metaf = open('cd_metadata.json', 'r')
metadata = json.load(metaf)

production = True

response = caltechdata_write(metadata, token, [], production)
print(response)

