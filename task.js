var bot,vec3,achieve,achieveList,directions,direction,repeating,blocks,mf;

function init(_bot,_vec3,_achieve,_achieveList,_mf)
{
	mf=_mf;
	bot=_bot;
	require('./blockFinder').inject(bot);
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
	bot.navigate.on("cannotFind",function(){bot.emit("stop");});
	directions=[new vec3(0,0,1),new vec3(0,0,-1),new vec3(1,0,0),new vec3(-1,0,0)];
	direction=directions[0];
	repeating=false;
	var block;
	blocks={};
	for(i in mf.blocks)
	{
		block=mf.blocks[i];
		blocks[block.name]=block;
	}
}

function blockNameToBlockType(blockName)
{
	return blocks[blockName].id;
}

function isEmpty(pos)
{
	return isBlockEmpty(bot.blockAt(pos));
}

function isBlockEmpty(b)
{
	return b!==null && b.boundingBox==="empty";
}

function isNotEmpty(pos)
{
	return isBlockNotEmpty(bot.blockAt(pos));
}

function isBlockNotEmpty(b)
{
	return b!==null && b.boundingBox!=="empty";
}


function canFall(pos)
{
	var b=bot.blockAt(pos);
	return b!=null && (b.type===13 || b.type===12);
}

function dig(s,u,done)
{
	var pos=stringToPosition(s).floored();
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
	bot.once("pos_"+pos+"_empty",(function (pos,done) {return function() {
		if(canFall(pos.offset(0,1,0))) bot.once("pos_"+pos+"_not_empty",function(){done(false);});
		else done();
	};})(pos,done));// because a block can fall
}


function scalarProduct(v1,v2)
{
	return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
}

function norm(v)
{
	return Math.sqrt(scalarProduct(v,v));
}

function build(s,u,done)
{
	var blockPosition=stringToPosition(s).floored();
	var x,y,z,p;
	var contiguousBlocks=[new vec3(1,0,0),new vec3(-1,0,0),new vec3(0,1,0),new vec3(0,-1,0),new vec3(0,0,-1),new vec3(0,0,1)];
	for(i in contiguousBlocks)
	{
		p=blockPosition.plus(contiguousBlocks[i]);
		if(isNotEmpty(p))
		{
			bot.placeBlock({position:p},(new vec3(0,0,0)).minus(contiguousBlocks[i]));
			done();
			return;
		}
	}
}

function lookAt(s,u,done)
{
	var goalPosition=stringToPosition(s);
	if(goalPosition!=null) bot.lookAt(goalPosition.offset(0,bot.entity.height,0));
	done();
}

function move(s,u,done)
{
	var goalPosition=stringToPosition(s);
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
	var goalPosition=stringToPosition(s);
	if(goalPosition!=null && isFree(goalPosition))
	{
		if(goalPosition.distanceTo(bot.entity.position)>=1)
		{
			bot.navigate.to(goalPosition);//use callback here ?
			bot.once("stop",done);
		}
		else done();
	} else done();
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

function remove(a,e)
{
	return a.filter(function(v) { return v == e ? false : true;});
}

function positionReachable(pos,params)
{
	return bot.navigate.findPathSync(pos,params).status === 'success';
}

function nearestReachableEntity(entities)
{
	var ent;
	while(1) // see if a too long computation couldn't cause problem (fork ?)
	{
		ent=nearestEntity(entities);
		if(!positionReachable(ent.position))
		{
			if(entities.length>1) entities=remove(entities,ent); // to change ?
			else return null;
		}
		else return ent;
	}
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

function nearestBlock_(blockName)
{
	if(blockName==='*') blockType=-1;
	else blockType=blockNameToBlockType(blockName);
	var dmax=new vec3(64,64,64),block,dmin=100000000,bmin=null,d;
	var x,y,z;
	for(x=-dmax.x;x<dmax.x;x++)
	{
		for(y=-dmax.y;y<dmax.y;y++)
		{
			for(z=-dmax.z;z<dmax.z;z++)
			{
				d=x*x+y*y+z*z;
				if(d<dmin)
				{
					block=bot.blockAt(bot.entity.position.offset(x,y,z));
					if(block!==null && (blockType===-1 || block.type===blockType))
					{
							bmin=block;
							dmin=d;
						
					}
				}
			}
		}
	}
	return bmin;
}

function nearestBlock(blockName)
{
	if(blockName==='*') blockType=-1;
	else blockType=blockNameToBlockType(blockName);
	var p=bot.findBlock(bot.entity.position,blockType,64);
	var pos=new vec3(p[0],p[1],p[2]);
	pos=pos.floored();
	return bot.blockAt(pos);
}


function nearestReachablePosition(pos)
{
// 	var dmax=new vec3(5,10,5),dmin=100000000,d,pmin=null,p,b;
// 	var x,y,z;
// 	for(x=-dmax.x;x<dmax.x;x++)
// 	{
// 		for(y=-dmax.y;y<dmax.y;y++)
// 		{
// 			for(z=-dmax.z;z<dmax.z;z++)
// 			{
// 				d=x*x+y*y+z*z;
// 				if(d<dmin)
// 				{
// 					p=pos.offset(x,y,z);
// 					if(isFree(p))
// 					{
// 						dmin=d;
// 						pmin=p;
// 					}
// 				}
// 			}
// 		}
// 	}
	var a=bot.navigate.findPathSync(pos,{timeout:2000});
	return a.path[a.path.length-1];
}


function entitiesToArray()
{
	var a=[];
	for(i in bot.entities) a.push(bot.entities[i]);
	return a;
}

function objects(name)
{
	return entitiesToArray().filter(function(entity) {return entity.type === 'object' && (name==="*" || entity.objectType === name);});
}

function mobs(name)
{
	return entitiesToArray().filter(function(entity) {return entity.type === 'mob' && (name==="*" || entity.mobType ===name);});
}

function lookForEntity(s,u,done)
{
	var ent=stringToEntity(s);
	if(ent===null) bot.chat("I can't find "+s);
	else bot.chat(s+" is in "+ent.position+(ent.type === 'mob' ? ". It's a "+ent.mobType : (ent.type === 'object' ? ". It's a "+ent.objectType : "")));
	done();
}

function lookForBlock(s,u,done)
{
	var block=stringToBlock(s);
	if(block===null) bot.chat("I can't find "+s);
	else bot.chat(s+" is in "+block.position+". It's a "+block.name);
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
	var ent=stringToEntity(s);
	if(ent!=null) bot.attack(ent);
	done();
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


function wait(s,u,done)
{
	var time=parseInt(s);
	setTimeout(done,time);
}


function list(taskNameList,username,done)
{
	achieveList(taskNameList.split(" then "),username,done);
}

function stringToBlock(s)
{
	if((v=new RegExp("^nearest block (.+)$").exec(s))!=null) return nearestBlock(v[1]);
	if((v=new RegExp("^nearest block$").exec(s))!=null) return nearestBlock("*");
	return null;
}

function stringToEntity(s)
{
	var v;
	if((v=new RegExp("^player (.+)$").exec(s))!=null)
	{
	  if(bot.players[v[1]]===undefined) return null;
	  return bot.players[v[1]].entity;
	}
	if((v=new RegExp("^nearest mob (.+)$").exec(s))!=null) return nearestEntity(mobs(v[1]));
	if((v=new RegExp("^nearest mob$").exec(s))!=null) return nearestEntity(mobs("*"));
	if((v=new RegExp("^nearest object (.+)$").exec(s))!=null) return nearestEntity(objects(v[1]));
	if((v=new RegExp("^nearest object$").exec(s))!=null) return nearestEntity(objects("*"));
	if((v=new RegExp("^nearest reachable mob (.+)$").exec(s))!=null) return nearestReachableEntity(mobs(v[1]));
	if((v=new RegExp("^nearest reachable mob$").exec(s))!=null) return nearestReachableEntity(mobs("*"));
	if((v=new RegExp("^nearest reachable object (.+)$").exec(s))!=null) return nearestReachableEntity(objects(v[1]));
	if((v=new RegExp("^nearest reachable object$").exec(s))!=null) return nearestReachableEntity(objects("*"));
	return null;
}

function stringToPosition(s)
{
// 	var v;
// 	if((v=new RegExp("^adapted (.+)$").exec(s))!=null)
// 	{
// 		var entity=stringToEntity(v[1]);
// 		var distance = bot.entity.position.distanceTo(entity.position);
// 		var heightAdjust = entity.height * 0.8 + (distance * 0.05); wrong formula ?
// 		return entity.position.offset(0, heightAdjust, 0);
// 	}
	// could be used, maybe (0.8 not 1.8 ...)
	var v;
	if((v=new RegExp("^nearest reachable position (.+)$").exec(s))!=null) return nearestReachablePosition(stringToPosition(v[1]));
	var block=stringToBlock(s);
	if(block!=null) return block.position;
	var ent=stringToEntity(s);
	if(ent!=null) return ent.position;
	return simpleStringToPosition(s);
}

function simpleStringToPosition(s)
{
	var c=s.split(",");
	return new vec3(parseFloat(c[0]),parseFloat(c[1]),parseFloat(c[2]));
}

function positionToString(p)
{
	return p.x+","+p.y+","+p.z;
}

function say(s,u,done)
{
	bot.chat(s);
	done();
}

function activateItem(u,done)
{
	bot.activateItem();
	done();
}

function deactivateItem(u,done)
{
	bot.deactivateItem();
	done();
}

tasks=
{
		// va y avoir un pb ici : pas de end list et repeat...
		"repeat (.+)":{action:{f:repeat}},//priorité avec then
		"stop repeat (.+)":{action:{f:stopRepeat}},
		"(.+ then .+)":{action:{f:list}},
		"dig (.+)":{action:{f:dig}},
		"move to (.+)":{action:{f:moveTo}},
		"move (.+)":{action:{f:move}},
		"pos (.+)":{action:{f:pos}},
 		"look for block (.+)":{action:{f:lookForBlock}},
		"look for entity (.+)":{action:{f:lookForEntity}},
		"stop move to":{action:{f:stopMoveTo}},
		"list":{action:{f:listInventory}},
		"toss (.+)":{action:{f:toss}},
		"equip (.+?) (.+?)":{action:{f:equip}},
		"look at (.+)":{action:{f:lookAt}},
		"say (.+)":{action:{f:say}},
		"wait ([0-9]+)":{action:{f:wait}},
		"activate item":{action:{f:activateItem}},
		"deactivate item":{action:{f:deactivateItem}},
		"build (.+)":{action:{f:build}}
// 		"avancer":{action:{f:avancer,c:conditionAvancer}},
};

generated_tasks=
{
	"dig forward (.+)":function (s,u) 
	{
		var p=stringToPosition(s);
		return {action:{f:move},deps:["dig "+positionToString(p.offset(0,1,0)),"dig "+s]};
	},
	"attack (.+)":function (s,u)
	{
		return {action:{f:attack},deps:["move to "+s]};
	}
};

// ou passer à du pur string ? (what ?)

alias=
{
	"x+":"move r1,0,0",
	"x-":"move r-1,0,0",
	"y+":"move r0,1,0",
	"y-":"move r0,-1,0",
	"z+":"move r0,0,1",
	"z-":"move r0,0,-1",
	"spiral up":"dig r0,2,0 then dig r0,1,1 then dig r0,2,1 then move to r0,1,1 then dig r0,2,0 then dig r-1,1,0 then dig r-1,2,0 then move to r-1,1,0 then dig r0,2,0 then dig r0,1,-1 then dig r0,2,-1 then move to r0,1,-1 then dig r0,2,0 then dig r1,1,0 then dig r1,2,0 then move to r1,1,0",
	"spiral down":"dig r1,1,0 then dig r1,0,0 then dig r1,-1,0 then move to r1,-1,0 then dig r0,0,1 then dig r0,1,1 then dig r0,-1,1 then move to r0,-1,1 then dig r-1,1,0 then dig r-1,0,0 then dig r-1,-1,0 then move to r-1,-1,0 then dig r0,1,-1 then dig r0,0,-1 then dig r0,-1,-1 then move to r0,-1,-1",
	"raise chicken":"move to nearest reachable object then equip hand egg then activate item",
	"build shelter":"build r-1,0,0 then build r0,0,-1 then build r1,0,0 then build r0,0,1 then build r1,0,1 then build r-1,0,-1 then build r-1,0,1 then build r1,0,-1 then build r-1,1,0 then build r0,1,-1 then build r1,1,0 then build r0,1,1 then build r1,1,1 then build r-1,1,-1 then build r-1,1,1 then build r1,1,-1 then build r-1,2,0 then build r0,2,-1 then build r1,2,0 then build r0,2,1 then build r1,2,1 then build r-1,2,-1 then build r-1,2,1 then build r1,2,-1 then build r0,2,0",
	"destroy shelter":"dig r-1,0,0 then dig r0,0,-1 then dig r1,0,0 then dig r0,0,1 then dig r1,0,1 then dig r-1,0,-1 then dig r-1,0,1 then dig r1,0,-1 then dig r-1,1,0 then dig r0,1,-1 then dig r1,1,0 then dig r0,1,1 then dig r1,1,1 then dig r-1,1,-1 then dig r-1,1,1 then dig r1,1,-1 then dig r-1,2,0 then dig r0,2,-1 then dig r1,2,0 then dig r0,2,1 then dig r1,2,1 then dig r-1,2,-1 then dig r-1,2,1 then dig r1,2,-1 then dig r0,2,0"
}

parameterized_alias=
{ 
	// put this in stringToPosition
	"r(-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?,-?[0-9]+(?:\\.[0-9]+)?)":function (s,u,input) 
	{
		p=simpleStringToPosition(s);
		if(input.indexOf("repeat")>-1 || input.indexOf("then")>-1) return "r"+s;// deps ?
		return positionToString(bot.entity.position.plus(p));
	},
	//put this in stringToEntity
	" me":function(u)
	{
		return " player "+u;
	},
	"shoot (.+)":function(s,u)
	{
		return "look at "+s+" then activate item then wait 1000 then deactivate item"
	},
	"get (.+)":function(s,u)
	{
		return "move to nearest reachable position nearest block "+s+" then dig nearest block "+s;//add+" then move to nearest reachable object" when improved
	},
	"follow (.+)":function(s,u)
	{
		return "repeat move to "+s+" then wait 2000"// can make it follow with some distance maybe ?
	}
}

// remove this ?
regex=
{
	
}

exports.tasks=tasks;
exports.generated_tasks=generated_tasks;
exports.alias=alias;
exports.parameterized_alias=parameterized_alias;
exports.regex=regex;
exports.init=init;
