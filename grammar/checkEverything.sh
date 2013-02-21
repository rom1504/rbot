for i in `ls test/*.test | cut -f1 -d'.' | cut -f2 -d'/'`;
do 
echo $i :
./check.sh $i ;
done

