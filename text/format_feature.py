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

filen = 'FeatureIndex.txt'
fileo = '12_Features.Rmd'


infile =  open(filen,'r')
outfile = open(fileo,'w')
outfile.write('# Feature Index \n')
for line in infile.readlines():
    if re.search(r"^#" ,line):
        new = line.split('## ')[1]
        outfile.write(f'**{new[:-1]}**\n\n')
    elif len(line) > 1:
        split = line.split(' ')
        movie = split[-1]
        l_split = movie.split('_')
        label = l_split[0]+'-'+l_split[1]
        #movie_info = dois[label]
        name = ' '.join(split[:-1])
        outfile.write(f'{name} \@ref(fig:{label})\n\n')
    else:
        outfile.write(line)
