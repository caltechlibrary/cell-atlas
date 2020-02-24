import argparse, os, re, csv
import glob

def insert_figure(file_path,label,caption):
    return "### "+caption+" {#"+label+"}\n```{R}\nknitr::include_graphics('"+\
            file_path+"')\n```\n\n"

def insert_movie(doi):
    #DOI object has DOI, movie, and collector values
    doiv = doi['DOI']
    collector = doi['collector']
    filev = doi['movie']
    title = doi['title']
    image_path = 'img/'+filev.split('.mp4')[0]+'.jpg'
    return "```{R echo=FALSE, screenshot.alt='"+\
            image_path+"' , fig.cap= '"+title+" Collected by: "+collector+\
            " ["+doiv+"](https://doi.org/"+doiv+\
            ")'}\nlibrary(doivideo)\ndoivideo('"+\
            doiv+"',0)\n```\n\n"

parser = argparse.ArgumentParser(description=\
        "Transform text file chapters to Rmarkdown")
parser.add_argument('chapter_file', nargs='*', help=\
            'file name for text file')

args = parser.parse_args()

schema_mapping = {}
subsection_mapping = {}
working_copy = []

#Get dictionary of DOIs
dois = {}
doi_file = "dois.csv"
with open(doi_file,'r') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        split = row['movie'].split('_')
        label = split[0]+'_'+split[1]
        dois[label] = row


for filen in args.chapter_file:
    split = filen.split('_')
    chapter_number = split[0]
    title = os.path.splitext(split[1])[0]
    infile =  open(filen,'r')
    oname = os.path.splitext(filen)[0]+'.Rmd'
    outfile = open(oname,'w')
    outfile.write('# '+title+'\n')
    doi = ''
    print(filen)
    for line in infile.readlines():
        # Section headings
        if re.search(r"^\[\d+_" ,line):
            #Put in movie from last section
            if doi != '':
                working_copy.append(insert_movie(doi))
            split = line.split('_')
            number = split[0].split('[')[1]
            section = split[1].replace(']','')
            working_copy.append('## '+section)
            movie_label = chapter_number.lstrip("0")+'_'+number
            if movie_label in dois:
                doi = dois[movie_label]
        # Subsection headings
        elif re.search(r"^\[\d" ,line):
            #Put in movie from last section
            if doi != '':
                working_copy.append(insert_movie(doi))
            split = line.split('_')
            number = split[0].split('[')[1]
            cleaned = split[1].replace(']','')
            split = cleaned.split('More:')
            section = split[0]
            link = split[1].strip()
            short_link = link.replace(' ','_').replace("'","")
            working_copy.append('### '+section+'{#'+short_link+'}')
            subsection_mapping[link]=short_link
            movie_label = chapter_number.lstrip("0")+'_'+number
            if movie_label in dois:
                doi = dois[movie_label]
        # Schematics
        elif re.search(r"^\d_" ,line):
            #Put in movie from last section
            if doi != '':
                working_copy.append(insert_movie(doi))
            doi = ''
            split = line.split(' ')
            schema_num = split[0]
            split = line.split('Schematic:')
            schema_name = split[1].strip()
            file_path = glob.glob('img/'+chapter_number+'_schematic/'+schema_num+'*')
            short_name = schema_name.replace(' ','_').replace("'","")
            schema_mapping[schema_name] = short_name
            if len(file_path)>1:
                print("Matched multiple files")
            else:
                working_copy.append(insert_figure(file_path[0],short_name,schema_name))
        else:
            working_copy.append(line)
    #Put in movie from last section
    if doi != '':
        working_copy.append(insert_movie(doi))
    doi = ''
    infile.close()
    #Now go over text again to add links
    for line in working_copy:
        r = re.compile(r"\[Schematic – .*?]")
        offset = 0
        for match in re.finditer(r,line):
            link_value  = ''
            for key, value in schema_mapping.items():
                title = match.group().split('Schematic –')[1].strip(" ]")
                if title in key:
                    link_value = value
            link_end = match.span()[1]+offset
            line = line[:link_end]+'(#'+link_value+')'+line[link_end:]
            offset = offset + 3 + len(link_value)
        r = re.compile(r"\[More: .*?]")
        offset = 0
        for match in re.finditer(r,line):
            link_value = ''
            for key, value in subsection_mapping.items():
                title = match.group().split('More:')[1].strip(" ]")
                if title in key:
                    link_value = value
            link_end = match.span()[1]+offset
            line = line[:link_end]+'(#'+link_value+')'+line[link_end:]
            offset = offset + 3 + len(link_value)
        outfile.write(line)
    
    schema_mapping = {}
    subsection_mapping = {}
    working_copy = []

