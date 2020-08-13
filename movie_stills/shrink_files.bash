for file in *_*.png
do
    convert -resize 985x985 $file $file
done
