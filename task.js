var bot,vec3,achieve,achieveList,blocks,mf,processMessage,inventory,stringTo,nearest,syntaxTask,moveTask,inventoryTask,blockTask,informationTask,tasks,alias,parameterized_alias,all_task={};

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
	inventory=require('./lib/inventory');
	nearest=require('./lib/nearest');
	stringTo=require('./lib/stringTo');
	inventory.init(bot);
	nearest.init(bot,isNotEmpty,blocks,vec3);
	stringTo.init(bot,inventory,nearest,vec3);
	
	
	syntaxTask=require('./task/syntaxTask');
	syntaxTask.init(achieve,achieveList,stringTo);
	moveTask=require('./task/moveTask');
	moveTask.init(bot,processMessage,isEmpty,stringTo);
	inventoryTask=require('./task/inventoryTask');
	inventoryTask.init(bot,stringTo,findItemType,inventory);
	blockTask=require('./task/blockTask');
	blockTask.init(bot,stringTo,isNotEmpty,isBlockEmpty,isBlockNotEmpty,isEmpty,vec3);
	informationTask=require('./task/informationTask');
	informationTask.init(bot,stringTo);
	
	tasks=
	{
			"ifThenElse":syntaxTask.ifThenElse,
			"ifThen":syntaxTask.ifThen,
			"repeatUntil":syntaxTask.repeatUntil,
			"repeat":syntaxTask.repeat,
			"stopRepeat":syntaxTask.stopRepeat,
			"taskList":syntaxTask.achieveListAux,
			"wait":syntaxTask.wait,
			"nothing":syntaxTask.nothing,
			
			"move to":moveTask.moveTo,
			"move":moveTask.move,
			"stop move to":moveTask.stopMoveTo,
			"jump":moveTask.jump,
			"up":moveTask.up,
	// 		"avancer":avancer,c:conditionAvancer,
			
			
			"list":inventoryTask.listInventory,
			"toss":inventoryTask.toss,
			"equip":inventoryTask.equip,
			"unequip":inventoryTask.unequip,
			"activate item":inventoryTask.activateItem,
			"deactivate item":inventoryTask.deactivateItem,
			"craft":inventoryTask.craft,
			
			
			"dig":blockTask.dig,
			"build":blockTask.build,
			"watch":blockTask.watch,
			"stop watch":blockTask.stopWatch,
			"replicate":blockTask.replicate,
			
			
			"pos":informationTask.pos,
			"look for block":informationTask.lookForBlock,
			"look for entity":informationTask.lookForEntity,
			"say":informationTask.say,
			
			"attack":attack,
			"look at":lookAt
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
		"spiral up":"do sdig r0,2,0 then sdig r0,1,1 then sdig r0,2,1 then move to r0,1,1 then sdig r0,2,0 then sdig r-1,1,0 then sdig r-1,2,0 then move to r-1,1,0 then sdig r0,2,0 then sdig r0,1,-1 then sdig r0,2,-1 then move to r0,1,-1 then sdig r0,2,0 then sdig r1,1,0 then sdig r1,2,0 then move to r1,1,0 done",
		"spiral down":"do sdig r1,1,0 then sdig r1,0,0 then sdig r1,-1,0 then move to r1,-1,0 then sdig r0,0,1 then sdig r0,1,1 then sdig r0,-1,1 then move to r0,-1,1 then sdig r-1,1,0 then sdig r-1,0,0 then sdig r-1,-1,0 then move to r-1,-1,0 then sdig r0,1,-1 then sdig r0,0,-1 then sdig r0,-1,-1 then move to r0,-1,-1 done",
		"raise chicken":"do move to nearest reachable object * then equip hand egg then activate item done",
		
		"build shelter":"immure bot",
		
		"destroy shelter":"do sdig r-1,0,0 then sdig r0,0,-1 then sdig r1,0,0 then sdig r0,0,1 then sdig r1,0,1 then sdig r-1,0,-1 then sdig r-1,0,1 then sdig r1,0,-1 then sdig r-1,1,0 then sdig r0,1,-1 then sdig r1,1,0 then sdig r0,1,1 then sdig r1,1,1 then sdig r-1,1,-1 then sdig r-1,1,1 then sdig r1,1,-1 then sdig r-1,2,0 then sdig r0,2,-1 then sdig r1,2,0 then sdig r0,2,1 then sdig r1,2,1 then sdig r-1,2,-1 then sdig r-1,2,1 then sdig r1,2,-1 then sdig r0,2,0 done",
		
		
		"attack everymob":"repeat do move to nearest reachable mob * then attack nearest reachable mob * done done",
		"scome":"smove me",
		"come":"move to me",
		"down":"do move r0,0,0 then sbuild r0,-2,0 then sdig r0,-1,0 then wait 400 done", // could change the wait 400 to something like a when at r0,-1,0 or something
		"sup":"do sdig r0,2,0 then up done",//move r0,0,0 then  : put this back when I understand the pb with do sup then sup done
	};
	
	var gss={"stonebrick":"stone","coal":"oreCoal","ingotIron":"oreIron"};


	// should I put these aliases somewhere else ?
	parameterized_alias=
	{
		"toss everything":function(s,u)
		{
			return "do "+inventory.myItems().map(function(a){return "toss "+a[1]+" "+a[0]}).join(" then ")+" done";
		},
		"sbuild":function(s,u)
		{
			return "do equip hand item to build then build "+s+" done"
		},
		"sdig":function(s,u)
		{
			return "do equip hand tool to break "+bot.blockAt(stringTo.stringToPosition(s,u)).name+" then dig "+s+" done"
		},
		"shoot":function(s,u)
		{
			return "do look at adapted "+s+" then activate item then wait 1000 then deactivate item done"
		},
		"cget":function(n,s,u)
		{
			var gs=s in gss ? gss[s] : s;
			var m=inventory.numberOfOwnedItems(s);
			var need;
			return m>=n ? "nothing" : isCraftable(s) ? "do "+neededItemsToCraft(n-m,s).map(function(item){return "cget "+item.count+" "+item.name;}).join(" then ")+" then "+((need=needWorkbench(s)) ? "if close of workbench then nothing else do cget 1 workbench then sdig r0,-1,1 then equip hand workbench then build r0,-1,1 done endif then " : "")+"look at r0,0,0 then craft "+(n-m)+" "+s+(need ? " then sdig r0,-1,1 then sbuild r0,-1,1" : "")+" done" : "repeat sget "+gs+" until have "+n+" "+s+" done";
		}, // r0,0,1 : change this , problem with the number : try to craft it all when it only need to craft current - demanded : let's do it here, it seems to make sense since I'm going stringTo.stringToPosition for dig forward : hence the if have could probably be replaced by a js if : I'm going to let the if have be for now, and just do the current - demanded : not using have anymore... : remove it ? actually I'm using it, can't you see ???
		"get":function(s,u)
		{
			return "do move to nearest reachable position nearest block "+s+" then sdig nearest block "+s+" done";//add+" then move to nearest reachable object" when improved
		}, // do move to nearest reachable position block nearest block log then dig block nearest block log done
		"sget":function(s,u)
		{
			return "do smove nearest block "+s+" then sdig nearest block "+s+" done";
		},
		"follow":function(s,u)
		{
			return "repeat do move to "+s+" then wait 2000 done done"// can make it follow with some distance maybe ?
		},
		"smove":function(s,u)
		{
			var p=stringTo.stringToPosition(s,u);
			var s=positionToString(p);
			return "repeat sumove "+s+" until at "+s+" done";
		},
		"dig forward":function (s,u) 
		{
			var p=stringTo.stringToPosition(s,u);
			return "do sdig "+s+" then sdig "+positionToString(p.offset(0,1,0))+" then sbuild "+positionToString(p.offset(0,-1,0))+" then move "+s+" done";
		},
		"sumove":function(s,u)
		{
			var p=stringTo.stringToPosition(s,u).floored();
			var d=p.minus(bot.entity.position.floored());
			if(d.y!=0) return d.y<0 ? "down" : "sup";
			if(d.x!=0) return "dig forward r"+sgn(d.x)+",0,0";
			if(d.z!=0) return "dig forward r0,0,"+sgn(d.z);
			return "nothing";
		},
		"immure":function(s,u)
		{
			return "do sbuild r-1,0,0+"+s+" then sbuild r0,0,-1+"+s+" then sbuild r1,0,0+"+s+" then sbuild r0,0,1+"+s+" then sbuild r1,0,1+"+s+" then sbuild r-1,0,-1+"+s+" then sbuild r-1,0,1+"+s+" then sbuild r1,0,-1+"+s+" then sbuild r-1,1,0+"+s+" then sbuild r0,1,-1+"+s+" then sbuild r1,1,0+"+s+" then sbuild r0,1,1+"+s+" then sbuild r1,1,1+"+s+" then sbuild r-1,1,-1+"+s+" then sbuild r-1,1,1+"+s+" then sbuild r1,1,-1+"+s+" then sbuild r-1,2,0+"+s+" then sbuild r0,2,-1+"+s+" then sbuild r1,2,0+"+s+" then sbuild r0,2,1+"+s+" then sbuild r1,2,1+"+s+" then sbuild r-1,2,-1+"+s+" then sbuild r-1,2,1+"+s+" then sbuild r1,2,-1+"+s+" then sbuild r0,2,0+"+s+" done";
		}
	};
	all_task.tasks=tasks;
	all_task.alias=alias;
	all_task.parameterized_alias=parameterized_alias;
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


function pround(p)
{
	return new vec3(round(p.x),round(p.y),round(p.z));
}

function findItemType(name)
{
	var id;
	if((id=items[name])!=undefined) return id;
	if((id=blocks[name])!=undefined) return id;
	return null;
}

function lookAt(s,u,done)
{
	var goalPosition=stringTo.stringToPosition(s,u,1);
	if(goalPosition!=null)
	{
		bot.lookAt(goalPosition);
	}
	done();
}


function isCraftable(s)
{
	return mf.Recipe.find(findItemType(s).id).length!==0;
}

function attack(s,u,done)
{
	var ent=stringTo.stringToEntity(s,u);
	if(ent!=null) bot.attack(ent);
	done();
}

function positionToString(p)
{
	return p.x+","+p.y+","+p.z;
}

function neededItemsToCraft(n,s)
{
	var id=findItemType(s).id;
	var r=mf.Recipe.find(id);
	if(r.length===0) return null;
	var nd=[],d=r[0].delta;
	for(i in d)
	{
		if(d[i].type!=id)
		{
			nd.push({"name":mf.items[d[i].type]===undefined ? mf.blocks[d[i].type].name : mf.items[d[i].type].name,"count":-parseInt(n)*d[i].count});
		}
	}
	return nd;
}

function needWorkbench(s)
{
	var id=findItemType(s).id;
	var r=mf.Recipe.find(id);
	if(r.length===0) return null;
	return r[0].requiresTable;
}

function sgn(n)
{
	return n>0 ? 1 : -1;
}

module.exports={
	all_task:all_task,
	init:init
};