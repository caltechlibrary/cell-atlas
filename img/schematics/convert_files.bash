for file in *.gif
do
    FIRST=$(echo $file | cut -d'.' -f 1)
    convert ${file}[0] ${FIRST}.png
done
