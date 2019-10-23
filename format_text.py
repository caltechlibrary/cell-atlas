import argparse, os, re
import glob

def insert_figure(file_path,label,caption):
    return "```{R "+label+', fig.cap="'+caption+\
        '"}\nknitr::include_graphics("'+file_path+'")\n```\n'


parser = argparse.ArgumentParser(description=\
        "Transform text file chapters to Rmarkdown")
parser.add_argument('chapter_file', nargs='*', help=\
            'file name for text file')

args = parser.parse_args()

schema_mapping = {}
working_copy = []

for filen in args.chapter_file:
    split = filen.split('_')
    chapter_number = split[0]
    title = os.path.splitext(split[1])[0]
    infile =  open(filen,'r')
    oname = os.path.splitext(filen)[0]+'.Rmd'
    outfile = open(oname,'w')
    outfile.write('# '+title+'\n')
    for line in infile.readlines():
        # Section headings
        if re.search(r"^\[\d_" ,line):
            section = line.split('_')[1].replace(']','')
            working_copy.append('## '+section)
        # Subsection headings
        elif re.search(r"^\[\d" ,line):
            section = line.split('_')[1].replace(']','')
            working_copy.append('### '+section)
        # Schematics
        elif re.search(r"^\d_" ,line):
            split = line.split(' ')
            schema_num = split[0]
            split = line.split('Schematic:')
            schema_name = split[1].strip()
            file_path = glob.glob('img/'+chapter_number+'_schematic/'+schema_num+'*')
            schema_num = schema_num.replace('_','-')
            schema_mapping[schema_name] = schema_num
            if len(file_path)>1:
                print("Matched multiple files")
            else:
                working_copy.append(insert_figure(file_path[0],schema_num,schema_name))
        else:
            working_copy.append(line)
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
            line = line[:link_end]+'(#fig:'+link_value+')'+line[link_end:]
            offset = offset + 7 + len(link_value)
        outfile.write(line)

