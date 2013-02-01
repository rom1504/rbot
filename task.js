var bot;
var vec3;
var achieve;
var achieveList;
var directions;
var direction;
var repeating;

function init(_bot,_vec3,_achieve,_achieveList)
{
	bot=_bot;
	vec3=_vec3;
	achieve=_achieve;
	achieveList=_achieveList;
	bot.on('blockUpdate',function(oldBlock,newBlock){
		if(newBlock!=null)
		{
			if(isBlockEmpty(newBlock)) bot.emit("pos_"+(newBlock.position)+"_empty");
			else bot.emit("pos_"+(newBlock.position)+"_not_empty");
		}
	});
	bot.navigate.on("stop",function(){bot.emit("stop");});
	directions=[new vec3(0,0,1),new vec3(0,0,-1),new vec3(1,0,0),new vec3(-1,0,0)];
	direction=directions[0];
	repeating=false; // in init() rather
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

function dig(s,u,done)
{
	var pos=(stringToPosition(s,u)).floored();
	if(isEmpty(pos))
	{
		done();
		return;
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
	bot.once("pos_"+pos+"_empty",(function (pos,done) {return function()
	{
		if(canFall(pos.offset(0,1,0))) bot.once("pos_"+pos+"_not_empty",function(){done(false);});
		else done();
	};})(pos,done)
	);// because a block can take some time to fall (maybe 2000ms can be reduced)
}


function scalarProduct(v1,v2)
{
	return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
}

function norm(v)
{
	return Math.sqrt(scalarProduct(v,v));
}


// // to continue
// function build(s)
// {
// 	var blockPosition=pos;
// 	bot.placeBlock
// }


function move(s,u,done)
{
	var goalPosition=stringToPosition(s,u);
	
	bot.lookAt(goalPosition.offset(0,bot.entity.height,0));
	bot.setControlState('forward', true);
	var arrive=setInterval((function(goalPosition,done){return function()
	{
		if(/*scalarProduct(goalPosition.minus(bot.entity.position),d)<0 || */goalPosition.distanceTo(bot.entity.position)<0.3 || !isFree(goalPosition)/*(norm(bot.entity.velocity)<0.01)*/)
		{
			bot.setControlState('forward', false);
			clearInterval(arrive);
			done();// maybe signal an error if the goal position isn't free (same thing for move to)
		}
	}})(goalPosition,done),50);
}


function moveTo(s,u,done)
{
	var goalPosition=stringToPosition(s,u);
	bot.navigate.to(goalPosition);
	bot.navigate.once("arrived",done);
}

function stopMoveTo(u,done)
{
	bot.navigate.stop();
	done();
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

function repeatAux(taskName,username,done)
{
	if(repeating) achieve(taskName,username,(function(taskName,username,done){return function() {setTimeout(repeatAux,100,taskName,username,done);}})(taskName,username,done));
	else done();
}

function repeat(taskName,username,done)
{
	repeating=true;
	repeatAux(taskName,username,done);
}

function stopRepeat(taskName,u,done)
{
	repeating=false;
	done();
}



function pos(player,u,done)
{
	if(bot.players[player].entity!=undefined) bot.chat(player+" is in "+bot.players[player].entity.position);
	else bot.chat(player+" is too far.");
	done();
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

function nearestMob(nameMob)
{
	var a=[];
	for(i in bot.entities) a.push(bot.entities[i]);
	var mobs=a.filter(function(entity) {return entity.type === 'mob' && (nameMob==="*" || entity.mobType ===nameMob);});
	return nearestEntity(mobs);
}

function lookForNearestMob(nameMob,u,done)
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
	done();
}

function equip(destination,itemName,u,done)
{
	var item = itemByName(itemName);
	if (item)
	{
		bot.equip(item, destination, function(err) 
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
	done();
}

function toss(itemName,u,done)
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
	done();
}

function attack(s,u,done)
{
	var ent=stringToEntity(s,u);
	bot.attack(ent);
	setTimeout(done,500);
}


function listInventory(u,done)
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
	done();
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


function list(taskNameList,username,done)
{
	achieveList(taskNameList.split(" then "),username,done);
}

function stringToEntity(s,u)
{
	if(s==="me") return bot.players[u].entity;
	var v;
	if((v=new RegExp("^nearest mob (.+)$").exec(s))!=null) {var mob=nearestMob(v[1]); if(mob!=null) return mob}
	if((v=new RegExp("^nearest mob$").exec(s))!=null) {var mob=nearestMob("*"); if(mob!=null) return mob}
	return null;
}

function stringToPosition(s,u)
{
	var ent=stringToEntity(s,u);
	if(ent!=null) return ent.position;
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
		"repeat (.+)":{action:{f:repeat}},//priorité avec then
		"stop repeat (.+)":{action:{f:stopRepeat}},
		"(.+ then .+)":{action:{f:list}},
		"dig (.+)":{action:{f:dig}},
		"move to (.+)":{action:{f:moveTo}},
		"move (.+)":{action:{f:move}},
		"pos (.+)":{action:{f:pos}},
		"look for mob (.+)":{action:{f:lookForNearestMob}},
		"look for mob":{action:{f:lookForNearestMob,p:["*"]}},
		"stop move to (.+)":{action:{f:stopMoveTo}},
		"list":{action:{f:listInventory}},
		"toss (.+)":{action:{f:toss}},
		"equip (.+?) (.+?)":{action:{f:equip}},
// 		"attendre ([0-9]+)":{action:{f:attendre,c:conditionAttendre}}
// 		"avancer":{action:{f:avancer,c:conditionAvancer}},
};

generated_tasks=
{
	"dig forward (.+)":function (s,u) 
	{
		var p=stringToPosition(s,u);
		return {action:{f:move},deps:["dig "+positionToString(p.offset(0,1,0)),"dig "+s]};
	},
	"attack (.+)":function (s,u)
	{
		return {action:{f:attack},deps:["move to "+s]};
	}
};

// ou passer à du pur string ?

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
	"r(-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?)":function (s,u,input) 
	{
		p=stringToPosition(s,u);
		if(input.indexOf("repeat")>-1 || input.indexOf("then")>-1) return "r"+s;// deps ?
		return positionToString(bot.entity.position.plus(p));
	}
}

regex=
{
	//"position":"(-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?|me|nearest mob .+|nearest mob)"
}

exports.tasks=tasks;
exports.generated_tasks=generated_tasks;
exports.alias=alias;
exports.parameterized_alias=parameterized_alias;
exports.regex=regex;
exports.init=init;
