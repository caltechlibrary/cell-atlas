import os, json, csv, glob

from datetime import datetime
from datacite import DataCiteMDSClient,schema40
from caltechdata_api import caltechdata_edit, get_metadata

filename = "dois.csv"

# Get access token from TIND sed as environment variable with source token.bash
token = os.environ["TINDTOK"]

production = True
today = datetime.today().date().isoformat()

with open(filename, encoding="utf-8-sig") as csvfile:
    filename_to_id = {}
    reader = csv.DictReader(csvfile)
    for row in reader:
        doi = row['DOI']
        idv = doi.split('D1.')[1]
        fname = row['movie']
        fpath = ('cellatlas-videos/'+fname)
        metadata = get_metadata(idv)
        for date in metadata['dates']:
            if date['dateType'] == 'Updated':
                date['date'] = today
        metadata['relatedIdentifiers'] =\
        [{'relationType':'IsSupplementTo','relatedIdentifier':'https://cellstructureatlas.org','relatedIdentifierType':'URL'}]
        if 'ETDB' in row:
            etdb = row['ETDB']
            metadata['relatedIdentifiers'].append({'relationType':'IsDerivedFrom','relatedIdentifier':etdb,'relatedIdentifierType':'URL'})
        cont = row['collector']
        metadata['contributors'] = [{'contributorName': cont,'contributorType': 'DataCollector'}]
        response = caltechdata_edit(token, idv, metadata, {fpath}, {'mp4'}, production)
        print(response)
