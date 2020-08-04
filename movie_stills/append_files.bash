for file in *_l.png
do
    FIRST=$(echo $file | cut -d'_' -f 1)
    SECOND=$(echo $file | cut -d'_' -f 2)
    convert +append $file ${FIRST}_${SECOND}_r.png ${FIRST}_${SECOND}.png
done
