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


bot.on('blockUpdate',function(pos){if(isEmpty(pos)){ bot.emit("pos_"+pos+"_empty");}});

bot.on('spawn', function() {
  console.log("game", bot.game);
});
bot.on('death', function() {
  bot.chat("I died x.x");
});


function isEmpty(pos)
{
	var b=bot.blockAt(pos);
	return b!=null && b.type===0;
}

function canFall(pos)
{
	var b=bot.blockAt(pos);
	return b!=null && b.type===13;
}

function digAchieved(s)
{
	var pos=(stringToPosition(s)).floored();
	return isEmpty(pos);
}

function dig(s)
{
	var pos=(stringToPosition(s)).floored();
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
	bot.on("pos_"+pos+"_empty",function()
	{
		if(canFall(pos.offset(0,1,0))) setTimeout(function(){bot.emit(e);},2000);
		else bot.emit(e);
	}
	);// because a block can take some time to fall (maybe 2000ms can be reduced)
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

function moveAchieved(s)
{
	var goalPosition=stringToPosition(s);
// 	console.log(goalPosition.distanceTo(bot.entity.position));
	return goalPosition.distanceTo(bot.entity.position)<0.3 || !isFree(goalPosition);
}


function move(s)
{
	var goalPosition=stringToPosition(s);
	
	bot.lookAt(goalPosition);
	bot.setControlState('forward', true);
	var eA=unique("move");
	var arrive=setInterval(function()
	{
		if(/*scalarProduct(goalPosition.minus(bot.entity.position),d)<0 || */goalPosition.distanceTo(bot.entity.position)<0.3 || !isFree(goalPosition)/*(norm(bot.entity.velocity)<0.01)*/)
		{
			bot.setControlState('forward', false);
			bot.emit(eA);
		}
	},50);
	bot.once(eA,function(){clearInterval(arrive);});
	return eA;
}

function moveToAchieved(s)
{
	var goalPosition=stringToPosition(s);
	return goalPosition.distanceTo(bot.entity.position)<1 || !isFree(goalPosition);
}

function moveTo(s)
{
	var goalPosition=stringToPosition(s);
	bot.navigate.to(goalPosition);
	var e=unique("arrived");
	bot.navigate.once("arrived",(function(e,goalPosition) {return function(){if(goalPosition.distanceTo(bot.entity.position)<1 || !isFree(goalPosition)) bot.emit(e);}})(e,goalPosition));
	return e;
}

function stopMoveToAchieved(s)
{
	return null;
}
bot.navigate.on("stop",function(){bot.emit("stop");});
function stopMoveTo()
{
	bot.navigate.stop();
	return "stop";
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
var repeating=false;
function repeatAux(stateName,username)
{
	if(repeating)
	{
		var eventStateName=unique(stateName);
		achieve(stateName,username,eventStateName);
 		bot.once(eventStateName,function(){repeatAux(stateName,username);});
	}
}

function repeat(stateName,username)
{
	repeating=true;
	repeatAux(stateName,username);
	return "repeat";
}

function repeatAchieved(stateName)
{
	return null;
}

function stopRepeat(stateName)
{
	repeating=false;
	setTimeout(function(){bot.emit("stop repeat");bot.emit("repeat");},200);
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

function achieveInList(stateNameList,i,username,eventStateName)
{
	return function(){achieve(stateNameList[i],username,eventStateName)};
}

function listAux(eIni,stateNameList,username)
{
	var e=eIni;
	var b;
	var eventStateName;
	for(var i in stateNameList)
	{
		eventStateName=unique(stateNameList[i]);
		bot.once(e,achieveInList(stateNameList,i,username,eventStateName));
		e=eventStateName;
	}
	return e;
}

function listAchieved(stateNameList)
{
	return null;
}

function list(stateNameList,username)
{
	var eIni=unique("startList");
 	var e=listAux(eIni,stateNameList.split(" then "),username);
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
		"move to position":{action:{f:moveTo,c:moveToAchieved}},
		"stop move to position":{action:{f:stopMoveTo,c:stopMoveToAchieved}},
// 		"attendre ([0-9]+)":{action:{f:attendre,c:conditionAttendre}}
// 		"avancer":{action:{f:avancer,c:conditionAvancer}},
// 		"dig forward2 position":{action:{f:avancer,c:moveAchieved},deps:["dig "]} // pour faire ça il va falloir faire comme l'alias paramétrable : fonction de génération des états// 	
		
//  		"do one spiral stairway step":{action:{f:dig,p:["r0,1,1"],c:digAchieved},deps:["dig r0,1,0","dig r0,2,0","dig r0,2,1"]}
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
	"spiral up":"dig r0,2,0 then dig r0,1,1 then dig r0,2,1 then move to r0,1,1 then dig r0,2,0 then dig r-1,1,0 then dig r-1,2,0 then move to r-1,1,0 then dig r0,2,0 then dig r0,1,-1 then dig r0,2,-1 then move to r0,1,-1 then dig r0,2,0 then dig r1,1,0 then dig r1,2,0 then move to r1,1,0",
	"spiral down":"dig r1,1,0 then dig r1,0,0 then dig r1,-1,0 then move to r1,-1,0 then dig r0,0,1 then dig r0,1,1 then dig r0,-1,1 then move to r0,-1,1 then dig r-1,1,0 then dig r-1,0,0 then dig r-1,-1,0 then move to r-1,-1,0 then dig r0,1,-1 then dig r0,0,-1 then dig r0,-1,-1 then move to r0,-1,-1"
}

parameterized_alias=
{
// 	"dig forward position":function (x,y,z) {x=parseFloat(x);y=parseFloat(y);z=parseFloat(z);return "dig "+x+","+(y+1)+","+z+" then dig "+x+","+y+","+z+" then move "+x+","+y+","+z;}
	"position":function(s,input,username)
	{
		if(s==="me") return positionToString(bot.players[username].entity.position);
		else return s;
	},
	"rposition":function (s,input) 
	{
		p=stringToPosition(s);
		if(input.indexOf("repeat")>-1 || input.indexOf("then")>-1) return "r"+s;
		return positionToString(bot.entity.position.plus(p));
	}
}

regex=
{
	"position":"(-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?|me)"
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

function reportEndOfState(stateName,eventStateName)
{
	return function()
	{
		console.log("I achieved state "+stateName);
		bot.emit(eventStateName);
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

function applyAction(state,stateName,eventStateName)
{
		return function()
		{
			var b;
			if((b=achieved(state))!=null && b)
			{
					(reportEndOfState(stateName,eventStateName))();
			}
			else
			{
				var actione=state.action.f.apply(this,state.action.p);
				bot.once(actione,achieved(state)===null ? reportEndOfState(stateName,eventStateName) : applyAction(state,stateName,eventStateName));
			}
			// comportement différent mais peut etre interessant :
// 			var actione=state.action.f.apply(this,state.action.p);
// 			bot.once(actione,reportEndOfState(stateName));
		}
}

function nameToState(stateName,username)
{
	stateName=replaceAlias(stateName,username);
	var v;
	var state;
	for(rstateName in states)
	{
		if((v=(new RegExp("^"+rstateName+"$")).exec(stateName))!=null)
		{
// 			v.push(v.input);
			v.push(username);
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
			v.push(username);
			v.shift();
			state=generated_states[rstateName].apply(this,v);
			state.action.p=state.action.p != undefined ? state.action.p.concat(v) : v
			break;
		}
	}
	return state;
}

function achieve(stateName,username,eventStateName)
{
	var state=nameToState(stateName,username);
//  	stateName=replaceAlias(stateName,username);//utile ? // bien ?
	console.log("I'm going to achieve state "+stateName);
	var eIni=unique("demarrerAchieve");
	var eEnd=unique("endAchieve");
	var stateNameList=state.deps!=undefined ? state.deps : [];
	var lstates=[];
	for(var i in stateNameList)
	{
		lstates[i]=nameToState(stateNameList[i],username);
	}
 	achieveDependencies(eIni,stateNameList,lstates,eEnd,username);
	bot.once(eEnd,applyAction(state,stateName,eventStateName));
	bot.emit(eIni);
}

function achieveInAchieveDependencies(stateNameList,i,username,eventStateName)
{
	return function(){achieve(stateNameList[i],username,eventStateName)};
}

function achieveDependencies(eIni,stateNameList,lstates,eEnd,username)
{
	var e=eIni;
	var b;
	var toContinue=false;
	var eventStateName;
	for(var i in stateNameList)
	{
		b=achieved(lstates[i]);// on suppose ici que les dépendances ne modifie pas l'état : les paramètres font références à l'état initial
		if(b===null || !b)
		{
			eventStateName=unique(stateNameList[i]);
			bot.once(e,achieveInAchieveDependencies(stateNameList,i,username,eventStateName));// unique eventStateName
			e=eventStateName;
			if(b===null) lstates[i].c=function() {return true;};
			toContinue=true;
		}
	}
	if(toContinue)
	{
		bot.once(e,function(eIni,stateNameList,lstates,eEnd) {return function(){var s=unique("achieveDependencies");achieveDependencies(s,stateNameList,lstates,eEnd,username);bot.emit(s);};} (eIni,stateNameList,lstates,eEnd));
	}
	else
	{
		bot.once(e,(function(eEnd){return function() {bot.emit(eEnd);};})(eEnd));
	}
}

//reecriture (systeme suppose confluent et fortement terminal)
function replaceAlias(message,username)
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
				continue; // sure ?
			}
		}
		var v;
		for(var aliap in parameterized_alias)
		{
			if((v=(new RegExp(aliap)).exec(message))!=null)
			{
				v.push(v.input);
				v.push(username);
				var toReplace=v.shift();
				newM=message.replace(toReplace,parameterized_alias[aliap].apply(this,v));
				if(newM!=message)
				{
					message=newM;
					changed=1;
					continue;
				}
			}
		}
	}
	return message;
}


bot.on('chat', function(username, message) {
	message=replaceAlias(message,username);
// 	console.log(message);
	for(stateName in states)
	{
		if((new RegExp("^"+stateName+"$")).test(message))
		{
			achieve(message,username,unique(message));
			return;
		}		
	}
	for(stateName in generated_states)
	{
		if((new RegExp("^"+stateName+"$")).test(message))
		{
			achieve(message,username,unique(message));
			return;
		}		
	}
});



// bot.navigate.on('pathFound', function (path) {
//   bot.chat("found path. I can get there in " + path.length + " moves.");
// });
bot.navigate.on('cannotEndd', function () {
  bot.chat("unable to endd path");
});

bot.on('health', function() {
  console.log("I have " + bot.health + " health and " + bot.food + " food");
});

bot.on('playerJoined', function(player) {
  console.log("hello, " + player.username + "! welmove to the server.");
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