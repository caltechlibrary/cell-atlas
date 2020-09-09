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
        filename_to_id[fname] = idv
    new_videos = glob.glob('videos/new_videos/*.mp4')
    for video in new_videos:
        fname = video.split('/')[-1]
        idv = filename_to_id[fname]
        metadata = get_metadata(idv)
        for date in metadata['dates']:
            if date['dateType'] == 'Updated':
                date['date'] = today
        response = caltechdata_edit(token, idv, metadata, {video}, {'mp4'}, production)
        print(response)
