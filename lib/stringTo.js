var bot,inventory,nearest,vec3,isEmpty,isNotEmpty,blocks,async;

function init(_bot,_inventory,_nearest,_vec3,_isEmpty,_isNotEmpty,_blocks,_async)
{
	bot=_bot;
	inventory=_inventory;
	nearest=_nearest;
	vec3=_vec3;
	isEmpty=_isEmpty;
	isNotEmpty=_isNotEmpty;
	blocks=_blocks;
	async=_async;
}

function noconv(s,u,head,done)
{
	done(s);
}
var convs=
{
	"item":function(s,u,head,done){done(stringToItem(s));},
	"position":stringToPosition,
	"entity":function(s,u,head,done){done(stringToEntity(s,u));},
	"block":function(s,u,head,done){stringToBlock(s,done)},
	"int":function(s,u,head,done){done(parseInt(s))},
	"condition":function(s,u,head,done){stringToPredicate(s,u,done);},
	"simpleItem":noconv,
	"simplePlayer":noconv,
	"destination":noconv,
	"simpleBlock":noconv,
	"message":noconv,
	"exp":noconv,
	"taskList":noconv,
	"blockName":noconv
};

function stringTo(pars,head,u,done)
{
	async.map(pars,function(par,done){if(convs[par[0]]==undefined) console.log(par[0]+" not a type"); else convs[par[0]].apply(this,[par[1],u,head,function(r){done(null,r);}]);},function(err,r){done(r)});
}

function stringToBlock(s,done)
{
	if((v=new RegExp("^nearest block (.+)$").exec(s))!=null) {nearest.nearestBlock(v[1],done);return;}
	done(null);
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

function stringToAbsolutePosition(s,u,head,done)
{
	var v;
	if((v=new RegExp("^adapted (.+)$").exec(s))!=null)
	{
		var entity=stringToEntity(v[1],u);
		if(entity!=null)
		{
			done(adapted(entity));
		}
		else done(null);
		return;
	}
	stringToBlock(s,function(b){
		if(b!=null) done(b.position);
		else
		{
			var e;if((e=stringToEntity(s,u))!=null) {done(head!=null ? e.position.offset(0,e.height,0) : e.position);return}
			done(simpleStringToPosition(s));
		}
	});	
}

function stringToPosition(s,u,head,done)
{
	var v;
	if((v=new RegExp("^nearest reachable position (.+)$").exec(s))!=null) stringToPosition(v[1],u,head,function(pos){done(nearest.nearestReachablePosition(pos))});
	else if((v=new RegExp("^r(.+?)\\+(.+)$").exec(s))!=null) stringToAbsolutePosition(v[2],u,head,function(pos){done(pos.floored().plus(simpleStringToPosition(v[1])));});
	else if((v=new RegExp("^r(.+)$").exec(s))!=null) done(bot.entity.position.floored().plus(simpleStringToPosition(v[1])));
	else stringToAbsolutePosition(s,u,head,done);
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


function stringToPredicate(c,u,done)
{
	var preds={
		"at":function(pos){return function(){return nearest.sameBlock(pos,bot.entity.position)}},
		"have":function(count,name){return function(){return inventory.numberOfOwnedItems(name)>=count;}},
		"close of":function(blockName){return function(){return nearest.closeOf(blockName);}},
		"is empty":function(pos){return function(){return isEmpty(pos);}},
		"is not empty":function(pos){return function(){return isNotEmpty(pos);}},
	};
	stringTo(c[1],null,u,function(pars){
		if(c[0] in preds) done(preds[c[0]].apply(this,pars));
		else done(null);
	})
}

module.exports={
	init:init,
	stringTo:stringTo,
	stringToBlock:stringToBlock,
	stringToEntity:stringToEntity,
	stringToAbsolutePosition:stringToAbsolutePosition,
	simpleStringToPosition:simpleStringToPosition,
	stringToPosition:stringToPosition,
	stringToItem:stringToItem,
	stringToPredicate:stringToPredicate
};