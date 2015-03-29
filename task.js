var bot,vec3,achieve,achieveList,blocks,mf,processMessage,inventory,stringTo,nearest,syntaxTask,moveTask,inventoryTask,blockTask,informationTask,tasks,alias,parameterized_alias,giveUser,async,all_task={};

function init(_bot,_vec3,_achieve,_achieveList,_processMessage,_mf,_async)
{
	async=_async;
	processMessage=_processMessage;
	mf=_mf;
	bot=_bot;
// 	require('./blockFinder').inject(bot);
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
	inventory.init(bot,mf.materials);
	nearest.init(bot,isNotEmpty,blocks,vec3);
	stringTo.init(bot,inventory,nearest,vec3,isEmpty,isNotEmpty,blocks,async);
	
	
	syntaxTask=require('./task/syntaxTask');
	syntaxTask.init(achieve,achieveList,stringTo);
	moveTask=require('./task/moveTask');
	moveTask.init(bot,processMessage,isEmpty,stringTo,vec3,isNotEmpty);
	inventoryTask=require('./task/inventoryTask');
	inventoryTask.init(bot,stringTo,findItemType,inventory,vec3);
	blockTask=require('./task/blockTask');
	blockTask.init(bot,stringTo,isNotEmpty,isBlockEmpty,isBlockNotEmpty,isEmpty,vec3,positionToString,processMessage);
	informationTask=require('./task/informationTask');
	informationTask.init(bot,stringTo);
	giveUser=["ifThenElse","ifThen","repeatUntil","repeat","taskList","replicate"];
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
			"tcc":moveTask.tcc,
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
			"look at":lookAt,
			
			
// 			"achieve":achieveCondition
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
// 		"spiral up":"do sdig r0,2,0 then sdig r0,1,1 then sdig r0,2,1 then move to r0,1,1 then sdig r0,2,0 then sdig r-1,1,0 then sdig r-1,2,0 then move to r-1,1,0 then sdig r0,2,0 then sdig r0,1,-1 then sdig r0,2,-1 then move to r0,1,-1 then sdig r0,2,0 then sdig r1,1,0 then sdig r1,2,0 then move to r1,1,0 done",
		//"spiral up":"do sdig r0,2,0 then sdig r0,3,0 then smove r0,1,1 then sdig r0,2,0 then sdig r0,3,0 then smove r-1,1,0 then sdig r0,2,0 then sdig r0,3,0 then smove r0,1,-1 then sdig r0,2,0 then sdig r0,3,0 then smove r1,1,0 done",
        "spiral up":"do smove r0,1,1 then sdig r0,-2,0 then smove r-1,1,0 then sdig r0,-2,0  then smove r0,1,-1 then sdig r0,-2,0  then smove r1,1,0 then sdig r0,-2,0  done",

// 		"spiral down":"do sdig r1,1,0 then sdig r1,0,0 then sdig r1,-1,0 then move to r1,-1,0 then sdig r0,0,1 then sdig r0,1,1 then sdig r0,-1,1 then move to r0,-1,1 then sdig r-1,1,0 then sdig r-1,0,0 then sdig r-1,-1,0 then move to r-1,-1,0 then sdig r0,1,-1 then sdig r0,0,-1 then sdig r0,-1,-1 then move to r0,-1,-1 done",
		"spiral down":"do smove r1,-1,0 then smove r0,-1,1 then smove r-1,-1,0 then smove r0,-1,-1 done",
		"raise chicken":"do move to nearest reachable object * then equip hand egg then activate item done",
		
		"build shelter":"immure bot",
		
		"destroy shelter":"do sdig r-1,0,0 then sdig r0,0,-1 then sdig r1,0,0 then sdig r0,0,1 then sdig r1,0,1 then sdig r-1,0,-1 then sdig r-1,0,1 then sdig r1,0,-1 then sdig r-1,1,0 then sdig r0,1,-1 then sdig r1,1,0 then sdig r0,1,1 then sdig r1,1,1 then sdig r-1,1,-1 then sdig r-1,1,1 then sdig r1,1,-1 then sdig r-1,2,0 then sdig r0,2,-1 then sdig r1,2,0 then sdig r0,2,1 then sdig r1,2,1 then sdig r-1,2,-1 then sdig r-1,2,1 then sdig r1,2,-1 then sdig r0,2,0 done",
		
		
		"attack everymob":"repeat do move to nearest reachable mob * then attack nearest reachable mob * done done",
		"scome":"smove me",
		"come":"move to me",
		"down":"do tcc then sbuild r0,-2,0 then sdig r0,-1,0 then wait 400 done", // could change the wait 400 to something like a when at r0,-1,0 or something
		"sup":"do tcc then sdig r0,2,0 then equip hand item to build then up done",
	};
	
	var gss={"stonebrick":"stone","coal":"oreCoal","ingotIron":"oreIron","diamond":"oreDiamond"};

	// should I put these aliases somewhere else ?
	parameterized_alias=
	{
		"giveEverything":function(p,u,done)
		{
			done("do look at "+p+" then toss everything done");
		},
		"give":function(p,n,i,u,done)
		{
			done("do look at "+p+" then toss "+n+" "+i+" done");
		},
		"toss everything":function(u,done)
		{
			var l=inventory.myItems().map(function(a){return "toss "+a[1]+" "+a[0]}).join(" then ");
			done(l=="" ? "nothing" : "do "+l+" done");
		},
		"sbuild":function(s,u,done)
		{
			done("if is empty "+s+" then do equip hand item to build then build "+s+" done endif");
		},
		"sdig":function(s,u,done)
		{
			stringTo.stringToPosition(s,u,null,function(pos){
				done("repeat do ssdig "+s+(blockTask.canFall(pos.offset(0,1,0)) ? " then wait 1500" : "")+" done until is empty "+s+" done"); // empty != air !!
			});
		},
		"ssdig":function(s,u,done)
		{
			stringTo.stringToPosition(s,u,null,function(pos){
				var t,p,a=[],x,y,z;
				var bb=bot.entity.position.floored();
				var bb2=bb.offset(0,1,0);
				var u="";
				if(pos.floored().equals(bb.offset(0,2,0)) && blockTask.canFall(bb.offset(0,3,0)))
				{
					u="repeat do equip hand tool to break "+bot.blockAt(bb.offset(0,3,0)).name+" then dig "+
					positionToString(bb.offset(0,3,0))+(blockTask.canFall(bb.offset(0,4,0)) ? " then wait 1500" : "")+
					" done until is empty "+positionToString(bb.offset(0,3,0))+" done then ";
				}
				function makeSafe(bb,bb2,pos,a)
				{
					//check for water or lava
					for(x=-1;x<=1;x++) // can do this better...
					{
						for(y=-1;y<=1;y++)
						{
							for(z=-1;z<=1;z++)
							{
								if((Math.abs(x)+Math.abs(y)+Math.abs(z))==1)
								{
									p=pos.offset(x,y,z);
									if(!(p.equals(bb)) && !(p.equals(bb2)))
									{
										var e=bot.blockAt(p);
										if(e!=null)
										{
											t=e.type;
											if(t>=8 && t<=11) a.push("sbuild "+positionToString(p));
										}
									}
								}
							}
						}
					}
				}
				makeSafe(bb,bb2,pos,a);
				if(blockTask.canFall(pos.offset(0,1,0))) makeSafe(bb,bb2,pos.offset(0,1,0),a);
				//if(blockTask.canFall(pos.offset(0,2,0))) makeSafe(bb,bb2,pos.offset(0,2,0),a);
				// cannot make this recursive because he can't build very high but a column of 2 is common
				var b=a.join(" then ");
				b=b=="" ? b : b+" then ";
				done("if is not empty "+s+" then do "+u+" "+b+" equip hand tool to break "+bot.blockAt(pos).name+" then dig "+s+" done endif");
			});
		},
		"shoot":function(s,u,done)
		{
			done("do look at adapted "+s+" then activate item then wait 1000 then deactivate item done");
		},
		"cget":function(n,s,u,done)
		{
			var gs=s in gss ? gss[s] : s;
			var m=inventory.numberOfOwnedItems(s);
			var need;
			function gn(item){
				return neededItemsToCraft(n-m,s)
					.map(function(item){
						return "cget "+item.count+" "+item.name;
					})
					.join(" then ")
			}
			done(m>=n ?
				"nothing" :
				isCraftable(s) ?
				"do "+gn(item)+" then "+((need=needWorkbench(s)) ?
				"if close of workbench then nothing else do cget 1 workbench then "+gn(item)+
				" then sdig r0,0,1 then sbuild r0,-1,1 then equip hand workbench then build r0,0,1 done endif then " : "")+
				"look at r0,0,0 then craft "+(n-m)+" "+s+(need ?
					" then sdig r0,0,1" : "")+" done" : "repeat sget "+gs+" until have "+n+" "+s+" done");
		}, // r0,0,1 : change this , problem with the number : try to craft it all when it only need to craft current - demanded : let's do it here, it seems to make sense since I'm going stringTo.stringToPosition for dig forward : hence the if have could probably be replaced by a js if : I'm going to let the if have be for now, and just do the current - demanded : not using have anymore... : remove it ? actually I'm using it, can't you see ???
		"get":function(s,u,done)
		{
			done("do move to nearest reachable position nearest block "+s+" then sdig nearest block "+s+" done");//add+" then move to nearest reachable object" when improved
		}, // do move to nearest reachable position block nearest block log then dig block nearest block log done
		"sget":function(s,u,done)
		{
			done("do smove nearest block "+s+" then sdig nearest block "+s+" done");
		},
		"follow":function(s,u,done)
		{
			done("repeat do move to "+s+" then wait 2000 done done");// can make it follow with some distance maybe ?
		},
		"smove":function(s,u,done)
		{
 			stringTo.stringToPosition(s,u,null,function(p){ // change ?
 				var s=positionToString(p);
 				done("repeat ssumove "+s+" until at "+s+" done");
 			});
		},
		"dig forward":function (s,u,done) 
		{
			stringTo.stringToPosition(s,u,null,function(p){
				done("do sdig "+s+" then sdig "+positionToString(p.offset(0,1,0))+" then sbuild "+positionToString(p.offset(0,-1,0))+" then move to "+s+" done");
			});
		},
// 		"tunnel":function (s,u,done) 
// 		{
// 			stringTo.stringToPosition(s,u,null,function(p){
// 				done("do sdig "+s+" then sdig "+positionToString(p.offset(0,1,0))+" then sbuild "+positionToString(p.offset(0,-1,0))+" then sbuild "+positionToString(p.offset(,2,0))+" then move to "+s+" done");
// 			});
// 		},
		"ssumove":function(s,u,done)
		{
			stringTo.stringToPosition(s,u,null,function(p){
				var s=positionToString(p);
				var r=bot.navigate2.findPathSync(p);
				var path=r.path;// cannot fail : should be able to fail... : maybe with a break, failed or stop task ?
				console.log(r);
				var t=path.map(function(p2){return "sumove "+positionToString(p2);}).join(" then ");
				done("do "+t+" done");
			});
		},
		"sumove":function(s,u,done)
		{
			stringTo.stringToPosition(s,u,null,function(p){
				p=p.floored();
				var bb=bot.entity.position.floored();
				var d=p.minus(bb);
				if(d.y!=0 && isNotBedrock(bb.offset(0,sgn(d.y),0))) done(d.y<0 ? "down" : "sup");
				else if(d.x!=0 && isNotBedrock(bb.offset(sgn(d.x),0,0)) && isNotBedrock(bb.offset(sgn(d.x),1,0))) done("dig forward r"+sgn(d.x)+",0,0");
				else if(d.z!=0 && isNotBedrock(bb.offset(0,0,sgn(d.z))) && isNotBedrock(bb.offset(0,1,sgn(d.z)))) done("dig forward r0,0,"+sgn(d.z));
// 				if(d.y!=0) done(d.y<0 ? "down" : "sup");
// 				else if(d.x!=0) done("dig forward r"+sgn(d.x)+",0,0");
// 				else if(d.z!=0) done("dig forward r0,0,"+sgn(d.z));
				else done("nothing");
			});
		},
		"immure":function(s,u,done)
		{
			done("do sbuild r-1,0,0+"+s+" then sbuild r0,0,-1+"+s+" then sbuild r1,0,0+"+s+" then sbuild r0,0,1+"+s+" then sbuild r1,0,1+"+s+" then sbuild r-1,0,-1+"+s+" then sbuild r-1,0,1+"+s+" then sbuild r1,0,-1+"+s+" then sbuild r-1,1,0+"+s+" then sbuild r0,1,-1+"+s+" then sbuild r1,1,0+"+s+" then sbuild r0,1,1+"+s+" then sbuild r1,1,1+"+s+" then sbuild r-1,1,-1+"+s+" then sbuild r-1,1,1+"+s+" then sbuild r1,1,-1+"+s+" then sbuild r-1,2,0+"+s+" then sbuild r0,2,-1+"+s+" then sbuild r1,2,0+"+s+" then sbuild r0,2,1+"+s+" then sbuild r1,2,1+"+s+" then sbuild r-1,2,-1+"+s+" then sbuild r-1,2,1+"+s+" then sbuild r1,2,-1+"+s+" then sbuild r0,2,0+"+s+" done");
		},
		"achieve":function(c,u,done)
		{
			var impliedActions={
				"at":function(p){return "smove "+p;},
				"have":function(n,o){return "cget "+n+" "+o},
				"close of":function(b){return "smove nearest block "+b},
				"is empty":function(p){return "sdig "+p},
				"is not empty":function(p){return "sbuild "+p}
			};
			done("repeat do "+impliedActions[c[0]].apply(this,c[1].map(function(par){return par[1]}))+" then wait 500 done until "+c[0]+" "+c[1].map(function(par){return par[1]}).join(" ")+" done");
		}
	};
	all_task.tasks=tasks;
	all_task.giveUser=giveUser;
	all_task.alias=alias;
	all_task.parameterized_alias=parameterized_alias;
	all_task.stringTo=stringTo;
}

function isNotBedrock(pos)
{
	var b=bot.blockAt(pos);
	return b!=null && b.type!=7;
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


function lookAt(goalPosition,done)
{
	if(goalPosition!=null)
	{
		bot.lookAt(goalPosition,true);
	}
	done();
}


function isCraftable(s)
{
	return mf.Recipe.find(findItemType(s).id).length!==0;
}

function attack(ent,done)
{
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
	n=Math.ceil(n/r[0].result.count);
	if(r.length===0) return null;
	var nd=[],d=r[0].delta;
	console.log(d);
	for(i in d)
	{
		if(d[i].id!=id)
		{
			//console.log("d id"+d[i].id);
			//console.log(mf.items[d[i].id].name);
			nd.push({
				"name":
					mf.items[d[i].id]===undefined ?
					mf.blocks[d[i].id].name :
					mf.items[d[i].id].name,
				"count":-parseInt(n)*d[i].count
			});
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