node grammar.js test/$1.test > test/$1.temp
diff test/$1.expected test/$1.temp
rm test/$1.temp