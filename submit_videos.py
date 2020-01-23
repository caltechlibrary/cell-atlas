import os, json, csv, datetime

# from datacite import DataCiteMDSClient,schema40
from caltechdata_api import caltechdata_write

filename = "02_Metadata.csv"

# Get access token from TIND sed as environment variable with source token.bash
token = os.environ["TINDTOK"]

production = False

with open(filename, encoding="utf-8-sig") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
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
        metadata["contributors"] = contributors

        # title
        metadata["titles"] = [{"title": row["Title"]}]

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
        print(response)
        exit()
