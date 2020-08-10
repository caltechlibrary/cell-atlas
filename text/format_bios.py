import csv, re

#Get dictionary of DOIs
dois = {}
doi_file = "../dois.csv"
with open(doi_file,'r') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        split = row['movie'].split('_')
        label = split[0]+'_'+split[1]
        dois[label] = row

filen = 'ScientistProfiles.txt'
fileo = '12_Profiles.Rmd'


infile =  open(filen,'r')
outfile = open(fileo,'w')
outfile.write('# Scientist Profiles \n')
for line in infile.readlines():
    if len(line) > 1:
        line = line[:-1]
        label = line.replace(' ','_').lower()
        outfile.write('#### '+line+' {#'+label+'}\n\n')
    else:
        outfile.write(line)
