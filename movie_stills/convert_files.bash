for file in *.png
do
    FIRST=$(echo $file | cut -d'_' -f 1)
    SECOND=$(echo $file | cut -d'.' -f 1| cut -d'_' -f 2)
    convert ${FIRST}_${SECOND}.png -alpha remove ${FIRST}_${SECOND}.jpg
done
