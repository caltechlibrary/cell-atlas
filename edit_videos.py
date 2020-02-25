import os, json, csv, datetime

from datacite import DataCiteMDSClient,schema40
from caltechdata_api import caltechdata_edit, caltechdata_unembargo

filename = "02_Metadata.csv"

# Get access token from TIND sed as environment variable with source token.bash
token = os.environ["TINDTOK"]

production = True

counter = 1350

with open(filename, encoding="utf-8-sig") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row["Filename"] != '2_1_Mgenitalium.mp4':
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
                contributor["contributorName"] = names[count].strip()
                split = names[count].split(" ")
                contributor["familyName"] = split[-1]
                contributor["givenName"] = " ".join(split[0:-1])
                role = roles[count].strip()
                if role == 'Data Collector':
                    contributor["contributorType"] = 'DataCollector'
                    contributor_string = contributor_string + names[count].strip()
                if role == 'Data Curator':
                    contributor["contributorType"] = 'DataCurator'
                contributors.append(contributor)
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
                    "rights": "cc-by-nc-4.0",
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

            # description
            metadata["descriptions"] = [
                {
                    "description": row["Description"],
                    "descriptionType": "SeriesInformation",
                    }
                ]

            # dates
            metadata["dates"] = [
                {"date": datetime.date.today().isoformat(), "dateType": "Updated"}
                ]

            #response = caltechdata_unembargo(token,counter,production)
            #print(response)
            #response = caltechdata_edit(token, counter, metadata, fnames, {'mp4'}, production)
            #print(response)
            valid =  schema40.validate(metadata)
            #Debugging if verification fails
            #if valid == False:
            #    v = schema40.validator.validate(metadata)
            #    errors = sorted(v.iter_errors(instance), key=lambda e: e.path)
            #    for error in errors:
            #        print(error.message)
            #    exit()

            metadata["final_actions"] = [
            {"type": "create_doi", "parameters": {"type": "records", "field": "doi"}}
            ]
            response = caltechdata_edit(token, counter, metadata, {}, {}, production)
            print(response)
            counter = counter + 1
