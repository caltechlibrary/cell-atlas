import argparse, os, re
import glob

parser = argparse.ArgumentParser(description=\
        "Transform text file chapters to Rmarkdown")
parser.add_argument('chapter_file', nargs='*', help=\
            'file name for text file')

args = parser.parse_args()

for filen in args.chapter_file:
    chapter_number = filen.split('_')[0]
    infile =  open(filen,'r')
    oname = os.path.splitext(filen)[0]+'.Rmd'
    outfile = open(oname,'w')
    for line in infile.readlines():
        if re.search(r"\[\d_" ,line):
            section = line.split('_')[1].replace(']','')
            outfile.write('# '+section)
        elif re.search(r"\[\d" ,line):
            section = line.split('_')[1].replace(']','')
            outfile.write('## '+section)
        elif re.search(r"\d" ,line):
            split = line.split(' ')
            schema_num = split[0]
            schema_name = split[1]
            schema = glob.glob('img/'+chapter_number+'_schematic/'+schema_num+'*')
            print(chapter_number, schema_num)
            if len(schema)>1:
                print("TOO many schema")
            else:
                outfile.write('knitr::include_graphics('+schema[0]+')')
        else:
            outfile.write(line)

