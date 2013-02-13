var bot,vec3,achieve,achieveList,directions,direction,repeating,blocks,mf,processMessage;

function init(_bot,_vec3,_achieve,_achieveList,_processMessage,_mf)
{
	processMessage=_processMessage;
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
	var item;
	items={};
	for(i in mf.items)
	{
		item=mf.items[i];
		items[item.name]=item;
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

function dig_(s,u,done)
{
	var pos=stringToPosition(s,u).floored();
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


function pround(p)
{
	return new vec3(round(p.x),round(p.y),round(p.z));
}

function dig(s,u,done)
{
	var pos=stringToPosition(s,u);
	console.log(pos);
	if(pos===null)
	{
		done();
		return;
	}
	pos=pos.floored();
	if(isEmpty(pos))
	{
		done();
		return;
	}
	console.log("I dig position "+pos);
	bot.dig({position:pos},20000,function(){done()});
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
	var blockPosition=stringToPosition(s,u).floored();
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


function findItemType(name)
{
	var id;
	if((id=items[name])!=undefined) return id;
	if((id=blocks[name])!=undefined) return id;
	return null;
}


function findCraftingTable()
{
	var cursor = new vec3();
	for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++)
	{
		for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++)
		{
			for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++)
			{
				var block = bot.blockAt(cursor);
				if (block.type === 58) return block;
			}
		}
	}
}

function craft(amount,name,u,done)
{
	amount=parseInt(amount);
	var item=findItemType(name);
	var craftingTable=findCraftingTable();
	var wbText = craftingTable ? "with a crafting table, " : "without a crafting table, ";
	if (item == null) bot.chat(wbText + "unknown item: " + name);
	else
	{
		var recipes = bot.recipesFor(item.id, null, 1, craftingTable);
		if (recipes.length)
		{
			bot.chat(wbText + "I can make " + item.name);
			bot.craft(recipes[0], amount, craftingTable, function(err)
			{
				if (err)
				{
					bot.chat("error making " + item.name);
					console.error(err.stack);
				}
				else bot.chat("made " + amount + " " + item.name);
				done();
			});
		}
		else bot.chat(wbText + "I can't make " + item.name);
	}
	done();
}

function unequip(s,u,done)
{
	bot.unequip(s);
	done();
}

function lookAt(s,u,done)
{
	var goalPosition=stringToPosition(s,u);
	if(goalPosition!=null) bot.lookAt(goalPosition.offset(0,bot.entity.height,0));
	done();
}

function center(p)
{
	return p.floored().offset(0.5,0,0.5);
}

function move(s,u,done)
{
	var goalPosition=stringToPosition(s,u);
	goalPosition=center(goalPosition);
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

function repeatAux(taskName,over,username,done)
{
	if(!over()) achieve(taskName,username,(function(taskName,over,username,done){return function() {setTimeout(repeatAux,100,taskName,over,username,done);}})(taskName,over,username,done));
	else done();
}




function repeat(taskName,username,done)
{
	repeating=true;
	repeatAux(taskName,function(){return !repeating;},username,done);
}

function stopRepeat(taskName,u,done)
{
	repeating=false;
	done();
}

function ifThenElse(condition,then,els,u,done)
{
	if(stringToPredicate(condition)()) achieve(then,u,done);
	else achieve(els,u,done);
}

function ifThen(condition,then,u,done)
{
	if(stringToPredicate(condition)()) achieve(then,u,done);
}

function sameBlock(pos1,pos2)
{
	return pos1.floored().equals(pos2.floored());
}

function stringToPredicate(s)
{
	var v;
	if((v=new RegExp("^at (.+)$").exec(s))!=null) return function(pos){return function(){return sameBlock(pos,bot.entity.position)};}(stringToPosition(v[1]));
}

function repeatUntil(taskName,condition,u,done)
{
	repeatAux(taskName,stringToPredicate(condition),u,done);
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
	var ent=stringToEntity(s,u);
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

function toss(number,itemName,u,done)
{
	var item=itemByName(itemName);
	if(item) bot.toss(item.type,null,parseInt(number));
	else console.log("I have no " + itemName);
	done();
}

function attack(s,u,done)
{
	var ent=stringToEntity(s,u);
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



function stringToBlock(s)
{
	if((v=new RegExp("^nearest block (.+)$").exec(s))!=null) return nearestBlock(v[1]);
	return null;
}

function stringToEntity(s,u)
{
	var v;
	if(s==="me") s="player "+u;
	if(s==="bot") s="player "+bot.username;
	if((v=new RegExp("^player (.+)$").exec(s))!=null)
	{
	  if(bot.players[v[1]]===undefined) return null;
	  return bot.players[v[1]].entity;
	}
	if((v=new RegExp("^nearest mob (.+)$").exec(s))!=null) return nearestEntity(mobs(v[1]));
	if((v=new RegExp("^nearest object (.+)$").exec(s))!=null) return nearestEntity(objects(v[1]));
	if((v=new RegExp("^nearest reachable mob (.+)$").exec(s))!=null) return nearestReachableEntity(mobs(v[1]));
	if((v=new RegExp("^nearest reachable object (.+)$").exec(s))!=null) return nearestReachableEntity(objects(v[1]));
	return null;
}

function stringToAbsolutePosition(s,u)
{
	var b;if((b=stringToBlock(s))!=null) return b.position;
	var e;if((e=stringToEntity(s,u))!=null) return e.position;
	return simpleStringToPosition(s);
}

function stringToPosition(s,u)
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
	if((v=new RegExp("^r(.+?)\\+(.+)$").exec(s))!=null) return stringToAbsolutePosition(v[2],u).plus(simpleStringToPosition(v[1]));
	if((v=new RegExp("^r(.+)$").exec(s))!=null) return bot.entity.position.plus(simpleStringToPosition(v[1]));
	return stringToAbsolutePosition(s,u);
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

function jump(u,done)
{
	bot.setControlState('jump', true);
	bot.setControlState('jump', false);
	setTimeout(done,400);// change this
}

function achieveListAux(p,u,done)
{
	achieveList(p,u,done);
}

function up(u,done) // change this a bit ?
{
  bot.setControlState('jump', true);
  var targetBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  var jumpY = bot.entity.position.y + 1;
  bot.on('move', placeIfHighEnough);
  
  function placeIfHighEnough() {
    if (bot.entity.position.y > jumpY) {
      bot.placeBlock(targetBlock, vec3(0, 1, 0));
      bot.setControlState('jump', false);
      bot.removeListener('move', placeIfHighEnough);
	  setTimeout(done,400);
    }
  }
}

function nothing(u,done)
{
	done();
}

var com;
var wa;

function watch(u,done)
{
	var firstPosition=bot.players[u].entity.position.floored();
	com="";
	bot.on('blockUpdate',function(firstPosition){wa=[done,function(oldBlock,newBlock)
	{
		if(newBlock==null) return;
		if(bot.players[u].entity.position.floored().distanceTo(newBlock.position.floored())<5)
		{
			var action;
			if(isBlockEmpty(newBlock)) action="dig";
			else if(isBlockNotEmpty(newBlock)) action="build";
			else action="";
			if(action!="")
			{
				var d=newBlock.position.floored().minus(firstPosition);
				var c=action+" r"+positionToString(d)
				console.log(c);
				com+=(com!="" ? " then " : "")+c;
			}
		}
	}];return wa[1];}(firstPosition));
}

function stopWatch(u,done)
{
	bot.removeListener('blockUpdate',wa[1]);
	wa[0]();
	com="do "+com+" done";
	console.log(com);
	done();
}
// rather a parameterized alias ?
function replicate(u,done)
{
	processMessage(u,com,done);
}

// function print(l,done)
// {
// 	// build the a tower and the next tower and at the same time build the previous position
// 	// then move and do this again
// }

// simplify this ? (string:fonction ?)
tasks=
{
		"ifThenElse":{action:{f:ifThenElse}},
		"ifThen":{action:{f:ifThenElse}},
		"repeatUntil":{action:{f:repeatUntil}},
		"repeat":{action:{f:repeat}},
		"stopRepeat":{action:{f:stopRepeat}},
		"taskList":{action:{f:achieveListAux}},
		"dig":{action:{f:dig}},
		"move to":{action:{f:moveTo}},
		"move":{action:{f:move}},
		"pos":{action:{f:pos}},
 		"look for block":{action:{f:lookForBlock}},
		"look for entity":{action:{f:lookForEntity}},
		"stop move to":{action:{f:stopMoveTo}},
		"list":{action:{f:listInventory}},
		"toss":{action:{f:toss}},
		"equip":{action:{f:equip}},
		"unequip":{action:{f:unequip}},
		"look at":{action:{f:lookAt}},
		"say":{action:{f:say}},
		"wait":{action:{f:wait}},
		"activate item":{action:{f:activateItem}},
		"deactivate item":{action:{f:deactivateItem}},
		"build":{action:{f:build}},
		"craft":{action:{f:craft}},
		"jump":{action:{f:jump}},
		"up":{action:{f:up}},
		"attack":{action:{f:attack}},
		"nothing":{action:{f:nothing}},
		"watch":{action:{f:watch}},
		"stop watch":{action:{f:stopWatch}},
		"replicate":{action:{f:replicate}}
// 		"avancer":{action:{f:avancer,c:conditionAvancer}},
};

generated_tasks=
{
	// become useless by removing or integrating the dependencies to the syntax
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
	"spiral up":"do dig r0,2,0 then dig r0,1,1 then dig r0,2,1 then move to r0,1,1 then dig r0,2,0 then dig r-1,1,0 then dig r-1,2,0 then move to r-1,1,0 then dig r0,2,0 then dig r0,1,-1 then dig r0,2,-1 then move to r0,1,-1 then dig r0,2,0 then dig r1,1,0 then dig r1,2,0 then move to r1,1,0 done",
	"spiral down":"do dig r1,1,0 then dig r1,0,0 then dig r1,-1,0 then move to r1,-1,0 then dig r0,0,1 then dig r0,1,1 then dig r0,-1,1 then move to r0,-1,1 then dig r-1,1,0 then dig r-1,0,0 then dig r-1,-1,0 then move to r-1,-1,0 then dig r0,1,-1 then dig r0,0,-1 then dig r0,-1,-1 then move to r0,-1,-1 done",
	"raise chicken":"do move to nearest reachable object * then equip hand egg then activate item done",
	
	"build shelter":"immure bot",
	
	"destroy shelter":"do dig r-1,0,0 then dig r0,0,-1 then dig r1,0,0 then dig r0,0,1 then dig r1,0,1 then dig r-1,0,-1 then dig r-1,0,1 then dig r1,0,-1 then dig r-1,1,0 then dig r0,1,-1 then dig r1,1,0 then dig r0,1,1 then dig r1,1,1 then dig r-1,1,-1 then dig r-1,1,1 then dig r1,1,-1 then dig r-1,2,0 then dig r0,2,-1 then dig r1,2,0 then dig r0,2,1 then dig r1,2,1 then dig r-1,2,-1 then dig r-1,2,1 then dig r1,2,-1 then dig r0,2,0 done",
	
	
	"attack everymob":"repeat do move to nearest reachable mob * then attack nearest reachable mob * done done",
	"scome":"smove me",
	"come":"move to me",
	"down":"do move r0,0,0 then build r0,-2,0 then dig r0,-1,0 then wait 400 done", // could change the wait 400 to something like a when at r0,-1,0 or something
	"sup":"do dig r0,2,0 then up done",
}

function sgn(n)
{
	return n>0 ? 1 : -1;
}

parameterized_alias=
{
	"shoot":function(s,u)
	{
		return "do look at "+s+" then activate item then wait 1000 then deactivate item done"
	},
	"get":function(s,u)
	{
		return "do move to nearest reachable position nearest block "+s+" then dig nearest block "+s+" done";//add+" then move to nearest reachable object" when improved
	}, // do move to nearest reachable position block nearest block log then dig block nearest block log done
	"sget":function(s,u)
	{
		return "do smove nearest block "+s+" then dig nearest block "+s+" done";
	},
	"follow":function(s,u)
	{
		return "repeat do move to "+s+" then wait 2000 done done"// can make it follow with some distance maybe ?
	},
	"smove":function(s,u)
	{
		var p=stringToPosition(s,u);
		var s=positionToString(p);
		return "repeat sumove "+s+" until at "+s+" done";
	},
	"dig forward":function (s,u) 
	{
		var p=stringToPosition(s,u);
		return "do dig "+s+" then dig "+positionToString(p.offset(0,1,0))+" then build "+positionToString(p.offset(0,-1,0))+" then move "+s+" done";
	},
	"sumove":function(s,u)
	{
		var p=stringToPosition(s,u).floored();
		var d=p.minus(bot.entity.position.floored());
		if(d.y!=0) return d.y<0 ? "down" : "sup";
		if(d.x!=0) return "dig forward r"+sgn(d.x)+",0,0";
		if(d.z!=0) return "dig forward r0,0,"+sgn(d.z);
		return "nothing";
	},
	"immure":function(s,u)
	{
		return "do build r-1,0,0+"+s+" then build r0,0,-1+"+s+" then build r1,0,0+"+s+" then build r0,0,1+"+s+" then build r1,0,1+"+s+" then build r-1,0,-1+"+s+" then build r-1,0,1+"+s+" then build r1,0,-1+"+s+" then build r-1,1,0+"+s+" then build r0,1,-1+"+s+" then build r1,1,0+"+s+" then build r0,1,1+"+s+" then build r1,1,1+"+s+" then build r-1,1,-1+"+s+" then build r-1,1,1+"+s+" then build r1,1,-1+"+s+" then build r-1,2,0+"+s+" then build r0,2,-1+"+s+" then build r1,2,0+"+s+" then build r0,2,1+"+s+" then build r1,2,1+"+s+" then build r-1,2,-1+"+s+" then build r-1,2,1+"+s+" then build r1,2,-1+"+s+" then build r0,2,0+"+s+" done";
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
