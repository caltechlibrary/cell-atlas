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
        metadata = get_metadata(idv,validate=False)
        for date in metadata['dates']:
            if date['dateType'] == 'Updated':
                date['date'] = today
        new_descr = []
        for description in metadata['descriptions']:
            if description['descriptionType'] == 'SeriesInformation':
                description['description'] = 'Atlas of Bacterial and Archaeal Cell Structure'
            if not description['description'].startswith("<br>Cite this record as:"):
                new_descr.append(description)
        metadata['descriptions'] = new_descr
        new_id = []
        for identifier in metadata['relatedIdentifiers']:
            if identifier['relatedIdentifier'] != None:
                new_id.append(identifier)
        metadata['relatedIdentifiers'] = new_id
        response = caltechdata_edit(token, idv, metadata, {fpath}, {'mp4'}, production)
        print(response)
