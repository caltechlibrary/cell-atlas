import os, json, csv, datetime

# from datacite import DataCiteMDSClient,schema40
from caltechdata_api import caltechdata_write

filename = "02_Metadata.csv"

# Get access token from TIND sed as environment variable with source token.bash
token = os.environ["TINDTOK"]

production = True

doi_file = "dois.csv"
existing = []
if os.path.isfile(doi_file):
    with open(doi_file,'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            existing.append(row['movie'])
else:
    with open(doi_file,'w') as csvfile:
        fieldnames = ['DOI', 'movie', 'collector', 'title']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

with open(filename, encoding="utf-8-sig") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row["Filename"] not in existing:
            fnames = ["videos/" + row["Filename"]]

            metadata = {}

            # authors
            names = row["Author names"].split(";")
            affiliations = row["Author Affiliations"].split(";")
            identifiers = row["Author Identifiers"].split(";")
            creators = []
            for count in range(len(names)):
                creator = {}
                creator["affiliations"] = affiliations[count].split(",")
                creator["creatorName"] = names[count]
                split = names[count].split(" ")
                creator["familyName"] = split[-1]
                creator["givenName"] = " ".join(split[0:-1])
                creator["nameIdentifiers"] = [
                    {
                        "nameIdentifier": identifiers[count],
                        "nameIdentifierScheme": "ORCID",
                        "schemeURI": "https://orcid.org/",
                        }
                    ]
                creators.append(creator)
            metadata["creators"] = creators

            # contributors
            contributor_string = ''
            names = row["Contributor Name"].split(";")
            roles = row["Contributor Role"].split(";")
            contributors = []
            for count in range(len(names)):
                contributor = {}
                contributor["contributorName"] = names[count]
                split = names[count].split(" ")
                contributor["familyName"] = split[-1]
                contributor["givenName"] = " ".join(split[0:-1])
                contributor["contributorType"] = roles[count]
                contributors.append(contributor)
                if roles[count] == 'Data Collector':
                    contributor_string = contributor_string + names[count]
            metadata["contributors"] = contributors

            # title
            title = row["Title"]
            metadata["titles"] = [{"title": title}]

            # keywords
            keywords = row["Keywords"].split(";")
            subjects = []
            for key in keywords:
                subjects.append({"subject": key})
            metadata["subjects"] = subjects

            # Static
            metadata["language"] = "en"
            metadata["formats"] = [".mp4"]
            metadata["resourceType"] = {"resourceTypeGeneral": "Audiovisual"}
            metadata["rightsList"] = [
                {
                    "rights": "cc-by-nc",
                    "rightsURI": "https://creativecommons.org/licenses/by-nc/4.0/",
                    }
                ]
            metadata["fundingReferences"] = [
                {"funderName": "NIH"},
                {"funderName": "HHMI"},
                {"funderName": "Beckman Institute"},
                {"funderName": "Gordon and Betty Moore Foundation"},
                {"funderName": "Agouron Institute"},
                {"funderName": "John Templeton Foundation"},
                ]
            metadata["embargo_date"] = "2020-12-31"

            # description
            metadata["descriptions"] = [
                {
                    "description": row["Description"],
                    "descriptionType": row["Description Type"],
                    }
                ]

            # dates
            metadata["dates"] = [
                {"date": datetime.date.today().isoformat(), "dateType": "Submitted"}
                ]

            response = caltechdata_write(metadata, token, fnames, production)
            if 'Successfully' not in response:
                print(response)
                exit()
            else:
                rec_id = response.split('/')[-1].split('.')[0]
                with open(doi_file,'a') as csvfile:
                    writer = csv.writer(csvfile)
                    writer.writerow(['10.22002/D1.'+rec_id,row["Filename"],contributor_string,title])
