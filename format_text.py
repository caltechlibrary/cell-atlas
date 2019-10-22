import argparse, os, re
import glob

def insert_figure(file_path):
    return "```{R}\nknitr::include_graphics('"+\
                file_path+"')\n```\n"


parser = argparse.ArgumentParser(description=\
        "Transform text file chapters to Rmarkdown")
parser.add_argument('chapter_file', nargs='*', help=\
            'file name for text file')

args = parser.parse_args()

for filen in args.chapter_file:
    split = filen.split('_')
    chapter_number = split[0]
    title = os.path.splitext(split[1])[0]
    infile =  open(filen,'r')
    oname = os.path.splitext(filen)[0]+'.Rmd'
    outfile = open(oname,'w')
    outfile.write('# '+title+'\n')
    for line in infile.readlines():
        if re.search(r"^\[\d_" ,line):
            section = line.split('_')[1].replace(']','')
            outfile.write('## '+section)
        elif re.search(r"^\[\d" ,line):
            section = line.split('_')[1].replace(']','')
            outfile.write('### '+section)
        elif re.search(r"^\d_" ,line):
            split = line.split(' ')
            schema_num = split[0]
            schema_name = split[1]
            file_path = glob.glob('img/'+chapter_number+'_schematic/'+schema_num+'*')
            if len(file_path)>1:
                print("Matched multiple files")
            else:
                outfile.write(insert_figure(file_path[0]))
        else:
            outfile.write(line)

