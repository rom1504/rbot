function init(_bot,_vec3,_achieve)
{
	bot=_bot;
	vec3=_vec3;
	achieve=_achieve;
	bot.on('blockUpdate',function(oldBlock,newBlock){if(isBlockEmpty(newBlock)){ bot.emit("pos_"+(newBlock.position)+"_empty");}});
	bot.navigate.on("stop",function(){bot.emit("stop");});
	directions=[new vec3(0,0,1),new vec3(0,0,-1),new vec3(1,0,0),new vec3(-1,0,0)];
	direction=directions[0];
}

function isEmpty(pos)
{
	return isBlockEmpty(bot.blockAt(pos));
}


function isBlockEmpty(b)
{
	return b!==null && b.boundingBox==="empty";
}


function canFall(pos)
{
	var b=bot.blockAt(pos);
	return b!=null && (b.type===13 || b.type===12);
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
	bot.on("pos_"+pos+"_empty",(function (pos,e) {return function()
	{
		if(canFall(pos.offset(0,1,0))) setTimeout(function(){bot.emit(e);},2000);
		else bot.emit(e);
	};})(pos,e)
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

// // to continue
// function build(s)
// {
// 	var blockPosition=pos;
// 	bot.placeBlock
// }


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
function stopMoveTo()
{
	bot.navigate.stop();
	return "stop";
}


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
function repeatAux(taskName,username)
{
	if(repeating)
	{
		var eventTaskName=unique(taskName);
		achieve(taskName,username,eventTaskName);
		bot.once(eventTaskName,function(){repeatAux(taskName,username);});
	}
}

function repeat(taskName,username)
{
	repeating=true;
	repeatAux(taskName,username);
	return "repeat";
}

function repeatAchieved(taskName)
{
	return null;
}

function stopRepeat(taskName)
{
	repeating=false;
	setTimeout(function(){bot.emit("stop repeat");bot.emit("repeat");},200);
	return "stop repeat";
}

function stopRepeatAchieved(taskName)
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

function lookForNearestMobAchieved(nameMob)
{
	return null;
}

function nearestEntity(entities)
{
	var r=entities.reduce(function(acc,entity)
	{
		var d=entity.position.distanceTo(bot.entity.position);
		if(d<acc[1])
		{
			acc[0]=entity;
			acc[1]=d;
		}
		return acc;
	},[null,1000000]);
	return r[0];
}

function emitAndReturn(event)
{
	setTimeout(function(){bot.emit(event);},100);
	return event;
}

function nearestMob(nameMob)
{
	var a=[];
	for(i in bot.entities) a.push(bot.entities[i]);
	var mobs=a.filter(function(entity) {return entity.type === 'mob' && (nameMob==="*" || entity.mobType ===nameMob);});
	return nearestEntity(mobs);
}

function lookForNearestMob(nameMob)
{
	var mob=nearestMob(nameMob);
	if(mob===null)
	{
		bot.chat("I can't find any "+(nameMob==="*" ? "mob" : nameMob)+".");
	}
	else
	{
		nameMob=mob.mobType;
		bot.chat("Nearest "+nameMob+" is in "+mob.position+" , it is at a distance of "+Math.round(mob.position.distanceTo(bot.entity.position))+" from my position");
	}
}

function equip(destination,itemName)
{
	var item = itemByName(itemName);
	if (item)
	{
		bot.equip(item.type, destination, function(err) 
		{
			if (err)
			{
				console.log("unable to equip " + item.name);
				console.log(err.stack);
			}
			else console.log("equipped " + item.name);
		});
	}
	else console.log("I have no " + itemName);
	setTimeout(function(){bot.emit("equipped");},100);
	return "equipped";
}

function equipAchieved()
{
	return null;
}

function toss(itemName)
{
	var item = itemByName(itemName);
	if (item)
	{
		bot.tossStack(item, function(err) {
			if (err)
			{
				console.log("unable to toss " + item.name);
				console.log(err.stack);
			} 
			else console.log("tossed " + item.name);			  
		});
	}
	else console.log("I have no " + itemName);
	setTimeout(function(){bot.emit("tossed");},100);
	return "tossed";
}

function tossAchieved()
{
	return null;
}

function listInventory()
{
	var output = "";
	bot.inventory.items().forEach(function(item) {
		output += item.name + ": " + item.count + ", ";
	});
	if (output) {
		bot.chat(output);
	} else {
		bot.chat("empty inventory");
	}
	setTimeout(function(){bot.emit("listed");},100);
	return "listed";
}

function listInventoryAchieved()
{
	return null;
}

function itemByName(name)
{
	var item, i;
	for (i = 0; i < bot.inventory.slots.length; ++i)
	{
		item = bot.inventory.slots[i];
		if (item && item.name === name) return item;
	}
	return null;
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

function achieveInList(taskNameList,i,username,eventTaskName)
{
	return function(){achieve(taskNameList[i],username,eventTaskName)};
}

function listAux(eIni,taskNameList,username)
{
	var e=eIni;
	var b;
	var eventTaskName;
	for(var i in taskNameList)
	{
		eventTaskName=unique(taskNameList[i]);
		bot.once(e,achieveInList(taskNameList,i,username,eventTaskName));
		e=eventTaskName;
	}
	return e;
}

function listAchieved(taskNameList)
{
	return null;
}

function list(taskNameList,username)
{
	var eIni=unique("startList");
	var e=listAux(eIni,taskNameList.split(" then "),username);
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
tasks=
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
		"look for mob (.+)":{action:{f:lookForNearestMob,c:lookForNearestMobAchieved}},
		"look for mob":{action:{f:lookForNearestMob,c:lookForNearestMobAchieved,p:["*"]}},
		"move to position":{action:{f:moveTo,c:moveToAchieved}},
		"stop move to position":{action:{f:stopMoveTo,c:stopMoveToAchieved}},
		"list":{action:{f:listInventory,c:listInventoryAchieved}},
		"toss (.+)":{action:{f:toss,c:tossAchieved}},
		"equip (.+?) (.+?)":{action:{f:equip,c:equipAchieved}},
// 		"attendre ([0-9]+)":{action:{f:attendre,c:conditionAttendre}}
// 		"avancer":{action:{f:avancer,c:conditionAvancer}},
// 		"dig forward2 position":{action:{f:avancer,c:moveAchieved},deps:["dig "]} // pour faire ça il va falloir faire comme l'alias paramétrable : fonction de génération des états// 	
		
//  		"do one spiral stairway step":{action:{f:dig,p:["r0,1,1"],c:digAchieved},deps:["dig r0,1,0","dig r0,2,0","dig r0,2,1"]}
};

generated_tasks=
{
	"dig forward position":function (s) 
	{
		p=stringToPosition(s);
		return {action:{f:move,c:moveAchieved,p:[s]},deps:["dig "+positionToString(p.offset(0,1,0)),"dig "+s]};
	}
};

// ou passer à du pur string ?
// tasks_parametre


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
// 		console.log(s);
// 		console.log(input);
// 		console.log(username);
		if(s==="me") return positionToString(bot.players[username].entity.position);
		var v;
		if((v=new RegExp("^nearest mob (.+)$").exec(s))!=null) {var mob=nearestMob(v[1]); if(mob!=null) return positionToString(mob.position);}
		if((v=new RegExp("^nearest mob$").exec(s))!=null) {var mob=nearestMob("*"); if(mob!=null) return positionToString(mob.position);}
		return s;
	},
	"rposition":function (s,input) 
	{
		p=stringToPosition(s);
		if(input.indexOf("repeat")>-1 || input.indexOf("then")>-1) return "r"+s;// deps ?
		return positionToString(bot.entity.position.plus(p));
	}
}

regex=
{
	"position":"(-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?|me|nearest mob .+|nearest mob)"
}

exports.tasks=tasks;
exports.generated_tasks=generated_tasks;
exports.alias=alias;
exports.parameterized_alias=parameterized_alias;
exports.regex=regex;
exports.unique=unique;
exports.init=init;