var bot,inventory,nearest,vec3;

function init(_bot,_inventory,_nearest,_vec3)
{
	bot=_bot;
	inventory=_inventory;
	nearest=_nearest;
	vec3=_vec3;
}

function stringToBlock(s)
{
	if((v=new RegExp("^nearest block (.+)$").exec(s))!=null) return nearest.nearestBlock(v[1]);
	return null;
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
	if((v=new RegExp("^nearest mob (.+)$").exec(s))!=null) return nearest.nearestEntity(mobs(v[1]));
	if((v=new RegExp("^nearest object (.+)$").exec(s))!=null) return nearest.nearestEntity(objects(v[1]));
	if((v=new RegExp("^nearest reachable mob (.+)$").exec(s))!=null) return nearest.nearestReachableEntity(mobs(v[1]));
	if((v=new RegExp("^nearest visible mob (.+)$").exec(s))!=null) return nearest.nearestVisibleEntity(mobs(v[1]));
	if((v=new RegExp("^nearest reachable object (.+)$").exec(s))!=null) return nearest.nearestReachableEntity(objects(v[1]));
	return null;
}


function adapted(entity)
{
	var distance = bot.entity.position.distanceTo(entity.position);
// 	var heightAdjust = entity.height*0.8  - (distance * 0.13)+distance*distance*0.008-distance*distance*distance*0.00003//*+(entity.position.y-bot.entity.position.y)*0.07*/;
	var heightAdjust = entity.height*0.8  +distance*(0.14+Math.random()/30);
	return entity.position.offset(0, heightAdjust, 0);
}

function stringToAbsolutePosition(s,u,head)
{
	var v;
	if((v=new RegExp("^adapted (.+)$").exec(s))!=null)
	{
		var entity=stringToEntity(v[1],u);
		if(entity!=null)
		{
			return adapted(entity);
		}
		else return null;
	}
	var b;if((b=stringToBlock(s))!=null) return b.position;
	var e;if((e=stringToEntity(s,u))!=null) return head!=null ? e.position.offset(0,e.height,0) : e.position;
	return simpleStringToPosition(s);
}

function stringToPosition(s,u,head)
{
	//could be used, maybe (0.8 not 1.8 ...)
	var v;
	if((v=new RegExp("^nearest reachable position (.+)$").exec(s))!=null) return nearest.nearestReachablePosition(stringToPosition(v[1]));
	if((v=new RegExp("^r(.+?)\\+(.+)$").exec(s))!=null) return stringToAbsolutePosition(v[2],u,head).floored().plus(simpleStringToPosition(v[1]));
	if((v=new RegExp("^r(.+)$").exec(s))!=null) return bot.entity.position.floored().plus(simpleStringToPosition(v[1]));
	return stringToAbsolutePosition(s,u,head);
}

function simpleStringToPosition(s)
{
	var c=s.split(",");
	return new vec3(parseFloat(c[0]),parseFloat(c[1]),parseFloat(c[2]));
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

function stringToItem(s)
{
	var v;
	if((v=new RegExp("^item to build$").exec(s))!=null) return inventory.itemToBuild();
	if((v=new RegExp("^tool to break (.+)$").exec(s))!=null) return inventory.toolToBreak(blocks[v[1]]);
	return itemByName(s);
}


function stringToPredicate(s)
{//could be replace by a simple hash table (stringToPosition too)
	var v;
	if((v=new RegExp("^at (.+)$").exec(s))!=null) return function(pos){return function(){return nearest.sameBlock(pos,bot.entity.position)};}(stringToPosition(v[1]));
	if((v=new RegExp("^have ([0-9]+) (.+)$").exec(s))!=null)
	{
		return function(count,name)
		{
			return function()
			{
				return inventory.numberOfOwnedItems(name)>=count;
			}
		}(parseInt(v[1]),v[2]);
	}
	if((v=new RegExp("^close of (.+)$").exec(s))!=null) return function(blockName){return function(){return nearest.closeOf(blockName);}}(v[1]);
}

module.exports={
	init:init,
	stringToBlock:stringToBlock,
	stringToEntity:stringToEntity,
	stringToAbsolutePosition:stringToAbsolutePosition,
	simpleStringToPosition:simpleStringToPosition,
	stringToPosition:stringToPosition,
	stringToItem:stringToItem,
	stringToPredicate:stringToPredicate
};