var mineflayer = require('mineflayer');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var ce = require('cloneextend');
var vec3 = mineflayer.vec3;
var bot = mineflayer.createBot({
	username: process.argv[4],
	verbose: true,
	port:parseInt(process.argv[3]),
	host:process.argv[2]});

navigatePlugin(bot);

bot.on('login', function() {
  console.log("I logged in.");
  bot.chat("/login "+process.argv[5]);
  console.log("settings", bot.settings);
});

function monitor()
{
	for(dx=-1;dx<=1;dx++)
	{
		for(dy=-1;dy<=2;dy++)
		{
			for(dz=-1;dz<=1;dz++)
			{
				var dp=new vec3(dx,dy,dz);
				var p=bot.entity.position.plus(dp).floored();
				if(isEmpty(p)) bot.emit("pos_"+p+"_empty");
			}
		}
	}
}

function slowLoop()
{
	monitor();
}

bot.on('spawn', function() {
//   bot.chat("I have spawned");
  console.log("game", bot.game);
//   maj=setInterval(fastLoop, 50);
  maj2=setInterval(slowLoop, 500);
});
bot.on('death', function() {
  bot.chat("I died x.x");
//   clearInterval(maj);
  clearInterval(maj2);
});

// bot.on('chunkUpdate',function()
// {
// 	monitor();
// });

function isEmpty(pos)
{
// 	console.log(pos);
	var b=bot.blockAt(pos);
	return b!=null && b.type===0;
}

function digAchieved(s)
{
	var pos=(stringToPosition(s)).floored();
	return isEmpty(pos);
}

function dig(s)
{
	var pos=(stringToPosition(s)).floored();
	if(isEmpty(pos))
	{
		console.log("it is empty !");
		return "pos_"+pos+"_empty";
	}
	var rpos=pos.minus(bot.entity.position);
	var face=-1;
	if(rpos.x>0) {face=4;}
	else if(rpos.x<0) {face=5;}
	else if(rpos.z>0) {face=2;}
	else if(rpos.z<0) {face=3;}
	else if(rpos.y>0) {face=0;}
	else if(rpos.y<0) {face=1;}
	bot.client.write(0x0e, {status: 0,x:pos.x,y:pos.y,z:pos.z,face:face});
	bot.client.write(0x0e, {status: 2,x:pos.x,y:pos.y,z:pos.z,face:face});
	console.log("I dig position "+pos);
	var e=unique("endDig");
	bot.on("pos_"+pos+"_empty",function(){setTimeout(function(){bot.emit(e);},500);});// because a block can take some time to fall (maybe 500ms can be reduced)
	return e;
}


function scalarProduct(v1,v2)
{
	return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
}

function norm(v)
{
	return Math.sqrt(scalarProduct(v,v));
}

numbers={};
function unique(name)
{
	if(numbers[name]==undefined) numbers[name]=0;
	numbers[name]++;
	return name+numbers[name];
}
var goalPosition=new vec3(0,0,0);
function moveAchieved(s)
{
	var goalPosition=stringToPosition(s);
// 	console.log(!isFree(goalPosition));
// 	console.log(goalPosition+" "+bot.entity.position);
// 	console.log(goalPosition.distanceTo(bot.entity.position));
// 	console.log(goalPosition.distanceTo(bot.entity.position)<0.1);
	return goalPosition.distanceTo(bot.entity.position)<0.1 || !isFree(goalPosition);
}


function move(s)
{
	var goalPosition=stringToPosition(s);
	
	bot.lookAt(goalPosition);
	bot.setControlState('forward', true);
	var eA=unique("move");
	var arrive=setInterval(function()
	{
		if(/*scalarProduct(goalPosition.minus(bot.entity.position),d)<0 || */goalPosition.distanceTo(bot.entity.position)<0.1 || !isFree(goalPosition)/*(norm(bot.entity.velocity)<0.01)*/)
		{
			clearInterval(arrive);
			bot.setControlState('forward', false);
			bot.emit(eA);
		}
	},50);
	return eA;
}

directions=[new vec3(0,0,1),new vec3(0,0,-1),new vec3(1,0,0),new vec3(-1,0,0)];
direction=directions[0];

function isFree(pos)
{
	return isEmpty(pos) && isEmpty(pos.offset(0,1,0));
}

// function chercherDirection()
// {
// 	var i;
// 	while(1)
// 	{
// 		i=Math.floor(Math.random()*4);
// 		if(isFree(i)) {return i;}
// 	}
// 	return directions[i];
// }
// 
// function conditionAvancer(dejaEssaye)
// {
// 	return false;
// }
// 
// function avancer()
// {
// 	if(!isFree(direction))
// 	{
// 		direction=chercherDirection();
// 	}
// 	e=move(direction.x,direction.y,direction.z);
// 	return e;
// }

function repeat(stateName)
{
	achieve(stateName);
// 	console.log("ogogofof"+stateName);
	bot.on(stateName,repetition=function(){achieve(stateName);});
	repeating=true;
	return "repeat";
}

function repeatAchieved(stateName)
{
	return null;
}

function stopRepeat(stateName)
{
	bot.removeListener(stateName,repetition); // modify to allow several simultaneous repetitions ?
	setTimeout(function(){repeating=false;bot.emit("stop repeat");bot.emit("repeat");},200);
	return "stop repeat";
}

function stopRepeatAchieved(stateName)
{
	return null;
}

// function marcheEscalierColimacon() // non : utiliser des états paramétrés
// {
// 	dig(new vec3(0,1,1));
// 	dig(new vec3(0,1,0));
// 	dig(new vec3(0,2,0));
// 	dig(new vec3(0,2,1));
// }

function posAchieved(player)
{
	return null;
}

function pos(player)
{
	if(bot.players[player].entity!=undefined) bot.chat(player+" is in "+bot.players[player].entity.position);
	else bot.chat(player+" is too far.");
	setTimeout(function(){bot.emit("pos");},100);
	return "pos";
}

function lookForMobAchieved(nameMob)
{
	return null;
}

function lookForMob(nameMob)
{
	setTimeout(function(){bot.emit("look for mob");},100);
	for(i in bot.entities)
	{
		entity=bot.entities[i];
		if(entity.type === 'mob' && entity.mobType ===nameMob)
		{
				bot.chat("There is a "+nameMob+" in "+entity.position);
				return "look for mob";
		}
	}
	bot.chat("I can't find any "+nameMob+".");
	return "look for mob";
}
/*
function conditionAttendre(temps)
{
	return null;
}

function attendre(temps)
{
	var temps=parseInt(temps);
	var f=unique("end");
	setTimeout(function(f){function(){bot.emit(f);}}(f),temps);
	return f;
}*/

function achieveInList(stateNameList,i)
{
	return function(){achieve(stateNameList[i])};
}

function listAux(eIni,stateNameList)
{
	var e=eIni;
// 	console.log(stateNameList);
	for(var i in stateNameList)
	{
// 		console.log(e+"-> achieve "+stateNameList[i]);
		bot.once(e,achieveInList(stateNameList,i));
		e=stateNameList[i];
	}
// 	console.log(e);
	return e;
}

function listAchieved(stateNameList)
{
	return null;
}

function list(stateNameList)
{
	var eIni=unique("startList");
 	var e=listAux(eIni,stateNameList.split(" then "));
// 	var l=stateNameList.split(" then ");
// 	console.log("j'émet "+eIni);
	bot.emit(eIni);
	return e;
}

function stringToPosition(s)
{
	var c=s.split(",");
	return new vec3(parseFloat(c[0]),parseFloat(c[1]),parseFloat(c[2]));
}

function positionToString(p)
{
	return p.x+","+p.y+","+p.z;
}

// (-?[0-9]+(?:\\.[0-9]+)?),(-?[0-9]+(?:\\.[0-9]+)?),(-?[0-9]+(?:\\.[0-9]+)?)
//remplacer par taches (ou cible ?) ?
states=
{
		// va y avoir un pb ici : pas de end list et repeat...
		// les conditions sont des post condition, pas pré
		// pré condition réalisé grace aux dépendances
		"repeat (.+)":{action:{f:repeat,c:repeatAchieved}},//priorité avec then
		"stop repeat (.+)":{action:{f:stopRepeat,c:stopRepeatAchieved}},
		"(.+ then .+)":{action:{f:list,c:listAchieved}},
		"dig position":{action:{f:dig,c:digAchieved}},
		"move position":{action:{f:move,c:moveAchieved}},
		"pos (.+)":{action:{f:pos,c:posAchieved}},
		"look for mob (.+)":{action:{f:lookForMob,c:lookForMobAchieved}},
// 		"move to position":{action:{f:moveTo,c:moveToAchieved}},
// 		"attendre ([0-9]+)":{action:{f:attendre,c:conditionAttendre}}
// 		"avancer":{action:{f:avancer,c:conditionAvancer}},
// 		"dig forward2 position":{action:{f:avancer,c:moveAchieved},deps:["dig "]} // pour faire ça il va falloir faire comme l'alias paramétrable : fonction de génération des états
// 		"monter une marche d'escalier en colimacon":{action:{f:marcheEscalierColimacon,p:[]},deps:[]}
};

generated_states=
{
	"dig forward position":function (s) 
	{
		p=stringToPosition(s);
		return {action:{f:move,c:moveAchieved,p:[s]},deps:["dig "+positionToString(p.offset(0,1,0)),"dig "+s]};
	}
};

// ou passer à du pur string ?
// states_parametre


//alias paramétrable ?
alias=
{
	"x+":"move r1,0,0",
	"x-":"move r-1,0,0",
	"y+":"move r0,1,0",
	"y-":"move r0,-1,0",
	"z+":"move r0,0,1",
	"z-":"move r0,0,-1",
}

parameterized_alias=
{
// 	"dig forward position":function (x,y,z) {x=parseFloat(x);y=parseFloat(y);z=parseFloat(z);return "dig "+x+","+(y+1)+","+z+" then dig "+x+","+y+","+z+" then move "+x+","+y+","+z;}
	"rposition":function (s,input) 
	{
		p=stringToPosition(s);
		if(input.indexOf("repeat")>-1 || input.indexOf("then")>-1) return "r"+s;
		return positionToString(bot.entity.position.plus(p));
	}
}

regex=
{
	"position":"(-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?)"
}

//possibilité (possiblement) de remplacer une fois au lancement seulement
function replaceRegex(text)
{
	for(var i in regex)
	{
		text=text.replace(i,regex[i]);
	}
	return text;
}

ngenerated_states={};
for(i in generated_states)
{
	ngenerated_states[replaceRegex(i)]=generated_states[i];
}
generated_states=ngenerated_states;

nstates={};
for(i in states)
{
	nstates[replaceRegex(i)]=states[i];
}
states=nstates;

nparameterized_alias={};
for(i in parameterized_alias)
{
	nparameterized_alias[replaceRegex(i)]=parameterized_alias[i];
}
parameterized_alias=nparameterized_alias;

function reportEndOfState(stateName)
{
	return function()
	{
		console.log("I achieved state "+stateName);
		bot.emit(stateName);
	};
}

// à faire plus tard si vraiment nécessaire/utile
// conditionsToMonitor={};
// 
// function monitor()
// {
// 	for(i in conditionsToMonitor)
// 	{
// 		if(conditionsToMonitor[i]())
// 		{
// 			emit(i);
// 		}
// 	}
// }

function achieved(state)
{
	return state.action.c.apply(this,state.action.p);
}

function applyAction(state,stateName)
{
		return function()
		{
			var b;
			if((b=achieved(state))!=null && b)
			{
//  					console.log("end:"+stateName);
					(reportEndOfState(stateName))();
			}
			else
			{
//  				console.log("action:"+stateName);
				var actione=state.action.f.apply(this,state.action.p);
				bot.once(actione,achieved(state)===null ? reportEndOfState(stateName) : applyAction(state,stateName));
			}
			// comportement différent mais peut etre interessant :
// 			var actione=state.action.f.apply(this,state.action.p);
// 			bot.once(actione,reportEndOfState(stateName));
		}
}

function nameToState(stateName)
{
	stateName=replaceAlias(stateName);
	var v;
	var state;
	for(rstateName in states)
	{
		if((v=(new RegExp("^"+rstateName+"$")).exec(stateName))!=null)
		{
// 			v.push(v.input);
			v.shift();
			state=ce.clone(states[rstateName]);
			state.action.p=state.action.p != undefined ? state.action.p.concat(v) : v
			break;
		}
	}
	for(rstateName in generated_states)
	{
		if((v=(new RegExp("^"+rstateName+"$")).exec(stateName))!=null)
		{
// 			v.push(v.input);
			v.shift();
			state=generated_states[rstateName].apply(this,v);
			state.action.p=state.action.p != undefined ? state.action.p.concat(v) : v
			break;
		}
	}
	return state;
}

function achieve(stateName)
{
	var state=nameToState(stateName);
// 	stateName=replaceAlias(stateName);//utile ?
	console.log("I'm going to achieve state "+stateName);
	var eIni=unique("demarrerAchieve");
	var eEnd=unique("endAchieve");
	var stateNameList=state.deps!=undefined ? state.deps : [];
	var lstates=[];
	for(var i in stateNameList)
	{
		lstates[i]=nameToState(stateNameList[i]);// est refait plusieurs fois, il vaudrait sans doute mieux le faire une fois pour toute qq part (peut etre meme que ca change le comportement dans certains cas)
	}
 	achieveDependencies(eIni,stateNameList,lstates,eEnd);
	bot.once(eEnd,applyAction(state,stateName));
// 	console.log("j'émet "+eIni);
	bot.emit(eIni);
	
}

function achieveInAchieveDependencies(stateNameList,i)
{
	return function(){achieve(stateNameList[i])};
}

function achieveDependencies(eIni,stateNameList,lstates,eEnd)
{
	var e=eIni;
	var b;
// 	console.log(stateNameList);
	var toContinue=false;
	for(var i in stateNameList)
	{
		b=achieved(lstates[i]);
		if(b===null || !b)
		{
	// 		console.log(e+"-> achieve "+stateNameList[i]);
			bot.once(e,achieveInAchieveDependencies(stateNameList,i));
			e=stateNameList[i];
			if(b===null) lstates[i].c=function() {return true;};// pb ?
			toContinue=true;
		}
	}
	if(toContinue)
	{
		bot.once(e,function(eIni,stateNameList,lstates,eEnd) {return function(){var s=unique("achieveDependencies");achieveDependencies(s,stateNameList,lstates,eEnd);bot.emit(s);};} (eIni,stateNameList,lstates,eEnd));
	}
	else
	{
		bot.once(e,(function(eEnd){return function() {bot.emit(eEnd);};})(eEnd));
	}
// 	console.log(e);
}

//reecriture (systeme suppose confluent et fortement terminal)
function replaceAlias(message)
{
	var changed=1;
	while(changed)
	{
		changed=0;
		for(var alia in alias)
		{
			var newM=message.replace(alia,alias[alia]);
			if(newM!=message)
			{
				message=newM;
				changed=1;
			}
		}
		var v;
		for(var aliap in parameterized_alias)
		{
			if((v=(new RegExp(aliap)).exec(message))!=null)
			{
				v.push(v.input);
				var toReplace=v.shift();
				newM=message.replace(toReplace,parameterized_alias[aliap].apply(this,v));
				if(newM!=message)
				{
					message=newM;
					changed=1;
				}
			}
		}
	}
	return message;
}


bot.on('chat', function(username, message) {
	message=replaceAlias(message);
	for(stateName in states)
	{
		if((new RegExp("^"+stateName+"$")).test(message))
		{
			achieve(message);
			return;
		}		
	}
	for(stateName in generated_states)
	{
		if((new RegExp("^"+stateName+"$")).test(message))
		{
			achieve(message);
			return;
		}		
	}
});



bot.navigate.on('pathFound', function (path) {
  bot.chat("found path. I can get there in " + path.length + " moves.");
});
bot.navigate.on('cannotEndd', function () {
  bot.chat("unable to endd path");
});

	
bot.on('chat', function(username, message) {
	var target = bot.players[username].entity;
	if (message === 'come') {
		bot.navigate.to(target.position);
	} else if (message === 'stop') {
		bot.navigate.stop();
	}
	else if (message === 'pos') {
	bot.chat("I am at " + bot.entity.position + ", you are at " + bot.players[username].entity.position);
	}
});



bot.on('health', function() {
  console.log("I have " + bot.health + " health and " + bot.food + " food");
});

bot.on('playerJoined', function(player) {
  console.log("hello, " + player.username + "! welcome to the server.");
});
bot.on('playerLeft', function(player) {
  console.log("bye " + player.username);
});
bot.on('kicked', function(reason) {
  console.log("I got kicked for", reason, "lol");
});


bot.on('nonSpokenChat', function(message) {
  console.log("non spoken chat", message);
});