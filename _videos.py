# Naive script to download all relevant doi videos

import urllib.request
import csv
import re

CALTECH_URL = "https://data.caltech.edu/records/"

#Get dictionary of DOIs
dois = {}
doi_file = "../dois.csv"
with open(doi_file,'r') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        split = row['movie'].split('_')
        label = split[0]+'_'+split[1]
        dois[label] = row

for section in dois:
    resource = dois[section]["DOI"].split(".")[2]
    with urllib.request.urlopen(CALTECH_URL + resource) as f:
        html = f.read().decode("utf-8")
        download_url = re.findall(r"https:\/\/data\.caltech\.edu\/tindfiles\/serve\/.*", html)[0][:-2]
        print("Downloading {}".format(dois[section]["movie"]))
        urllib.request.urlretrieve(download_url, "videos/{}".format(dois[section]["movie"]))