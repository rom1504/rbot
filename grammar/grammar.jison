%lex

%%
"if" return 'if';
"do" return 'do';
"else" return 'else';
"endif" return 'endif';
"repeat" return 'repeat';
"done" return 'done';
"stop repeat" return 'stopRepeat';
"then" return 'then';
"give" return 'give';
"ssdig" return 'ssdig';
"toss everything" return 'tossEverything';
"everything" return 'everything';
"is empty" return 'isEmpty';
"is not empty" return 'isNotEmpty';
"sbuild" return 'sbuild';
"sdig" return 'sdig';
"until" return 'until';
"close of" return 'closeOf';
"dig forward" return 'digForward';
"dig" return 'dig';
"cget" return 'cget';
"have" return 'have';
"stop watch" return 'stopWatch';
"replicate" return 'replicate';
"watch" return 'watch';
"achieve" return 'achieve';
"ssumove" return 'ssumove';
"sumove" return 'sumove';
"smove" return 'smove';
"move to" return 'moveTo';
"move" return 'move';
"pos" return 'pos';
"tool to break" return 'toolToBreak';
"item to build" return 'itemToBuild';
"look for" return 'lookFor';
"stop move to" return 'stopMoveTo';
"bot" return 'bot';
"adapted" return 'adapted';
"list" return 'list';
"toss" return 'toss';
"equip" return 'equip';
"immure" return 'immure';
"unequip" return 'unequip';
"look at" return 'lookAt';
"tcc" return 'tcc';
//"scraft" return 'scraft';
"say" return 'say';
"wait" return 'wait';
"activate item" return 'activateItem';
"deactivate item" return 'deactivateItem';
"build" return 'build';
"nothing" return 'nothing';
"craft" return 'craft';
"jump" return 'jump';
"attack" return 'attack';
"shoot" return 'shoot';
"sget" return 'sget';
"get" return 'get';
"follow" return 'follow';
"+" return '+';
"player" return 'player';
"nearest reachable position" return 'nearestReachablePosition';
"nearest block" return 'nearestBlock';
"nearest mob" return 'nearestMob';
"nearest object" return 'nearestObject';
"nearest visible mob" return 'nearestVisibleMob';
"nearest reachable mob" return 'nearestReachableMob';
"nearest reachable object" return 'nearestReachableObject';
"me" return 'me';
"*" return '*';
";" return ';';
"at" return 'at';
"up" return 'up';
"r""-"?[0-9]+(?:"."[0-9]+)?",""-"?[0-9]+(?:"."[0-9]+)?",""-"?[0-9]+(?:"."[0-9]+)? return 'rsimplePosition';
"-"?[0-9]+(?:"."[0-9]+)?",""-"?[0-9]+(?:"."[0-9]+)?",""-"?[0-9]+(?:"."[0-9]+)? return 'simplePosition';
"." return '.';
[0-9]+ return 'N'
[A-Za-z0-9,]+ return 'T';
\s+ return 'S';
<<EOF>> return 'EOF';
/lex


%start expressions

%left 'T' position
// %left 'S'

%%

expressions : exp EOF
{
	function arrayToString(a)
	{
		return "["+a.map(taskToString).join()+"]";
	}
	function taskToString(t)
	{
		if(t.constructor == Array) return arrayToString(t);
		if(t.constructor == String) return '"'+t+'"';
	}
	console.log(taskToString($1[1])); return $1[1];	
}
;

exp :
	'if' 'S' condition 'S' 'then' 'S' exp 'S' 'else' 'S' exp 'S' 'endif' {$$=['exp',['ifThenElse',[$3,$7,$11]]];}
	| 'if' 'S' condition 'S' 'then' 'S' exp 'S' 'endif' {$$=['exp',['ifThen',[$3,$7]]];}
	| 'repeat' 'S' exp 'S' 'until' 'S' condition 'S' 'done' {$$=['exp',['repeatUntil',[$3,$7]]];}
	| 'repeat' 'S' exp 'S' 'done' {$$=['exp',['repeat',[$3]]];}
	| 'stopRepeat' 'S' exp 'S' 'done' {$$=['exp',['stopRepeat',[$3]]];}
	| 'do' 'S' listeE  {$$=['exp',['taskList',[['taskList',$3]]]];}
	| task {$$=['exp',$1]} // needs a separator...
;


task :
	'achieve' 'S' condition {$$=['achieve',[$3]]}
	| 'tcc'  {$$=['tcc',[]];}
	| 'give' 'S' position 'S' int 'S' item {$$=['give',[$3,$5,$7]]} // would be possible to generalize ( an expression quantity : everything or 'int' 'S' item )
	| 'give' 'S' position 'S' 'everything' {$$=['giveEverything',[$3]]}
	|'tossEverything' {$$=['toss everything',[]]}
	| 'sdig' 'S' position  {$$=['sdig',[$3]];}
	| 'sbuild' 'S' position {$$=['sbuild',[$3]];}
	| 'cget' 'S' int 'S' simpleItem {$$=['cget',[$3,$5]]}
	| 'replicate' {$$=['replicate',[]]},
	| 'watch' 'S' entity {$$=['watch',[$3]]},
	| 'stopWatch' {$$=['stop watch',[]]},
	| 'ssdig' 'S' position  {$$=['ssdig',[$3]];}
	| 'dig' 'S' position  {$$=['dig',[$3]];}
	| 'ssumove' 'S' position {$$=['ssumove',[$3]];}
	| 'sumove' 'S' position {$$=['sumove',[$3]];}
	| 'smove' 'S' position {$$=['smove',[$3]];}
	| 'moveTo' 'S' position {$$=['move to',[$3]];}
	| 'move' 'S' position {$$=['move',[$3]];}
	| 'pos' 'S' simplePlayer {$$=['pos',[$3]];}
	| 'lookFor' 'S' block {$$=['look for block',[$3]];}
	| 'lookFor' 'S' entity {$$=['look for entity',[$3]];}
	| 'stopMoveTo' {$$=['stop move to',[]];}
	| 'list' {$$=['list',[]];}
	| 'toss' 'S' int 'S' simpleItem {$$=['toss',[$3,$5]];}
	| 'equip' 'S' destination 'S' item {$$=['equip',[$3,$5]];}
	| 'unequip' 'S' item {$$=['unequip',[$3]];}
	| 'lookAt' 'S' position {$$=['look at',[$3]];}
	| 'say' 'S' message {$$=['say',[['message',$3]]];}
	| 'wait' 'S' int {$$=['wait',[$3]];}
	| 'activateItem' {$$=['activate item',[]];}
	| 'deactivateItem' {$$=['deactivate item',[]];}
	| 'build' 'S' position {$$=['build',[$3]];}
	//| 'scraft' 'S' int 'S' simpleItem {$$=['scraft',[$3,$5]];}
	| 'craft' 'S' int 'S' simpleItem {$$=['craft',[$3,$5]];}
	| 'jump' {$$=['jump',[]];}
	| 'digForward' 'S' position  {$$=['dig forward',[$3]];}
	| 'immure' 'S' position  {$$=['immure',[$3]];}
	| 'attack' 'S' entity {$$=['attack',[$3]];}
	| 'shoot' 'S' entity {$$=['shoot',[$3]];}
	| 'get' 'S' simpleBlock {$$=['get',[$3]];}
	| 'sget' 'S' simpleBlock {$$=['sget',[$3]];}
	| 'follow' 'S' position {$$=['follow',[$3]];}
	| 'up' {$$=['up',[]]}
	| 'nothing' {$$=['nothing',[]]}
 	| 'T' {$$=[$1,[]];}
 	//| 'T' 'S' int {$$=[$1,[$2]];} // can't work...
;



int:
	'N' {$$=['int',$1]}
;


// do list better with something like https://github.com/zaach/jison/blob/master/examples/json.js ?

message :
	'T' '.' {$$=$1}
	| 'T' 'S' message {$$=$1+' '+$3}
;

destination :
	 'T' {$$=['destination',$1]}
;

simpleItem :
 'T' {$$=['simpleItem',$1]}
;
 
item :
	 simpleItem {$$=['item',$1[1]]}
	| 'toolToBreak' 'S' simpleBlock {$$=['item',$1+' '+$3[1]]}
	| 'itemToBuild' {$$=['item',$1]}
;

simplePlayer :
	 'T' {$$=['simplePlayer',$1]}
;

entity :
	 'me' {$$=['entity',$1]}
	| 'bot' {$$=['entity',$1]}
	| 'player' 'S' simplePlayer {$$=['entity',$1+' '+$3[1]]}
	| 'nearestMob' 'S' mob {$$=['entity',$1+' '+$3]}
	| 'nearestObject' 'S' object {$$=['entity',$1+' '+$3]}
	| 'nearestVisibleMob' 'S' mob  {$$=['entity',$1+' '+$3]}
	| 'nearestReachableMob' 'S' mob  {$$=['entity',$1+' '+$3]}
	| 'nearestReachableObject' 'S' object  {$$=['entity',$1+' '+$3]}
;

mob :
	'T' {$$=$1}
	| '*' {$$=$1}
;

object :
	 'T' {$$=$1}
	| '*' {$$=$1}
;

absolutePosition :
	| 'adapted' 'S' entity {$$=$1+' '+$3[1];}
	| entity {$$=$1[1]}
	| block {$$=$1[1]}
	| 'simplePosition'  {$$=$1}
;

position :
	absolutePosition {$$=['position',$1]}
	| 'rsimplePosition'  {$$=['position',$1]}
	| 'rsimplePosition' '+' absolutePosition {$$=['position',$1+$2+$3]}
	| 'nearestReachablePosition' 'S' position {$$=['position',$1+' '+$3[1]]}
;

simpleBlock :
	blockName {$$=['simpleBlock',$1[1]]}
	| '*' {$$=['simpleBlock',$1]}
;

blockName :
	 'T' {$$=['blockName',$1]}
;

block :
	 'nearestBlock' 'S' simpleBlock {$$=['block',$1+' '+$3[1]]}
;

listeE :
	exp 'S' 'then' 'S' listeE	{$5.unshift($1);$$=$5}
	| exp 'S' 'done' {$$=[$1]}
;

condition :
	'isEmpty' 'S' position {$$=['condition',[$1,[$3]]]}
	| 'isNotEmpty' 'S' position {$$=['condition',[$1,[$3]]]}
	| 'closeOf' 'S' blockName {$$=['condition',[$1,[$3]]]}
	| 'have' 'S' int 'S' simpleItem {$$=['condition',[$1,[$3,$5]]]}
	| 'at' 'S' position {$$=['condition',[$1,[$3]]]}
	|'T' {$$=['condition',[$1,[]]]}
;
