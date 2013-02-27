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
"ssumove" return 'sumove';
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
	console.log(taskToString($1)); return $1;	
}
;

exp :
	'if' 'S' condition 'S' 'then' 'S' exp 'S' 'else' 'S' exp 'S' 'endif' {$$=['ifThenElse',[$3,$7,$11]];}
	| 'if' 'S' condition 'S' 'then' 'S' exp 'S' 'endif' {$$=['ifThen',[$3,$7]];}
	| 'repeat' 'S' exp 'S' 'until' 'S' condition 'S' 'done' {$$=['repeatUntil',[$3,$7]];}
	| 'repeat' 'S' exp 'S' 'done' {$$=['repeat',[$3]];}
	| 'stopRepeat' 'S' exp 'S' 'done' {$$=['stopRepeat',[$3]];}
	| 'do' 'S' listeE  {$$=['taskList',[$3]];}
	| task {$$=$1} // needs a separator...
;


task :
	'give' 'S' position 'S' int 'S' item {$$=['give',[$3,$5,$7]]} // would be possible to generalize ( an expression quantity : everything or 'int' 'S' item )
	| 'give' 'S' position 'S' 'everything' {$$=['giveEverything',[$3]]}
	|'tossEverything' {$$=['toss everything',[]]}
	| 'sdig' 'S' position  {$$=['sdig',[$3]];}
	| 'sbuild' 'S' position {$$=['sbuild',[$3]];}
	| 'cget' 'S' int 'S' simpleItem {$$=['cget',[$3,$5]]}
	| 'replicate' {$$=['replicate',[]]},
	| 'watch' {$$=['watch',[]]},
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
	| 'toss' 'S' int 'S' item {$$=['toss',[$3,$5]];}
	| 'equip' 'S' destination 'S' item {$$=['equip',[$3,$5]];}
	| 'unequip' 'S' item {$$=['unequip',[$3]];}
	| 'lookAt' 'S' position {$$=['look at',[$3]];}
	| 'say' 'S' message {$$=['say',[$3]];}
	| 'wait' 'S' int {$$=['wait',[$3]];}
	| 'activateItem' {$$=['activate item',[]];}
	| 'deactivateItem' {$$=['deactivate item',[]];}
	| 'build' 'S' position {$$=['build',[$3]];}
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
	'N' {$$=$1}
;


// do list better with something like https://github.com/zaach/jison/blob/master/examples/json.js ?

message :
	'T' '.' {$$=$1}
	| 'T' 'S' message {$$=$1+' '+$3}
;

destination :
	 'T' {$$=$1}
;

simpleItem :
 'T' {$$=$1}
;
 
item :
	 simpleItem {$$=$1}
	| 'toolToBreak' 'S' simpleBlock {$$=$1+' '+$3}
	| 'itemToBuild' {$$=$1}
;

simplePlayer :
	 'T' {$$=$1}
;

entity :
	 'me' {$$=$1}
	| 'bot' {$$=$1}
	| 'player' 'S' simplePlayer {$$=$1+' '+$3}
	| 'nearestMob' 'S' mob {$$=$1+' '+$3;}
	| 'nearestObject' 'S' object {$$=$1+' '+$3;}
	| 'nearestVisibleMob' 'S' mob  {$$=$1+' '+$3;}
	| 'nearestReachableMob' 'S' mob  {$$=$1+' '+$3;}
	| 'nearestReachableObject' 'S' object  {$$=$1+' '+$3;}
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
	| 'adapted' 'S' entity {$$=$1+' '+$3;}
	| entity {$$=$1}
	| block {$$=$1}
	| 'simplePosition'  {$$=$1}
;

position :
	absolutePosition {$$=$1}
	| 'rsimplePosition'  {$$=$1}
	| 'rsimplePosition' '+' absolutePosition {$$=$1+$2+$3}
	| 'nearestReachablePosition' 'S' position {$$=$1+' '+$3}
;

simpleBlock :
	blockName {$$=$1;}
	| '*' {$$=$1}
;

blockName :
	 'T' {$$=$1;}
;

block :
	 'nearestBlock' 'S' simpleBlock {$$=$1+' '+$3;}
;

listeE :
	exp 'S' 'then' 'S' listeE	{$5.unshift($1);$$=$5}
	| exp 'S' 'done' {$$=[$1];}
;

condition :
	'isEmpty' 'S' position {$$=$1+' '+$3}
	| 'isNotEmpty' 'S' position {$$=$1+' '+$3}
	| 'closeOf' 'S' blockName {$$=$1+' '+$3}
	| 'have' 'S' int 'S' simpleItem {$$=$1+' '+$3+' '+$5}
	| 'at' 'S' position {$$=$1+' '+$3}
	|'T' {$$=$1}
;
