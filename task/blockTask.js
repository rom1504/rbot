var bot,stringTo,isNotEmpty,isBlockEmpty,isBlockNotEmpty,isEmpty,vec3;

function init(_bot,_stringTo,_isNotEmpty,_isBlockEmpty,_isBlockNotEmpty,_isEmpty,_vec3)
{
	bot=_bot;
	stringTo=_stringTo;
	isNotEmpty=_isNotEmpty;
	isBlockEmpty=_isBlockEmpty;
	isBlockNotEmpty=_isBlockNotEmpty;
	isEmpty=_isEmpty;
	vec3=_vec3;
}

function canFall(pos)
{
	var b=bot.blockAt(pos);
	return b!=null && (b.type===13 || b.type===12);
}

function dig_(s,u,done)
{
	stringTo.stringToPosition(s,u,null,function(pos){
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
	});
}

// function print(l,done)
// {
// 	// build the a tower and the next tower and at the same time build the previous position
// 	// then move and do this again
// }

function dig(s,u,done)
{
	stringTo.stringToPosition(s,u,null,function(pos){
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
		var cf=canFall(pos.offset(0,1,0));
		bot.dig(bot.blockAt(pos),function(pos,done,cf)
		{
			return function()
			{
	// 			if(cf) bot.once("pos_"+pos+"_not_empty",function(){setTimeout(function(){done(false)},500);});
				if(cf) setTimeout(function(){done(false)},1500);// ask superjoe about this...
	// 			if(cf) bot.once("pos_"+pos+"_not_empty",function(){setTimeout(function(){done(false)},500);}); // do better ?
	// 			if(cf) done(false);
	// 			else setTimeout(done,300);
				else if(isNotEmpty(pos)) done(false);
				else done();
	// 			else check();
	// 			function check()
	// 			{
	// 				if(isNotEmpty(pos)) setTimeout(check,300); // sometimes bug... : this timeout should temporarly fix it
	// 				else done();
	// 			}
			}
		}(pos,done,cf));
	// 	if(!cf) bot.dig(bot.blockAt(pos),function(){done();});
	// 	else
	// 	{
	// 		bot.dig(bot.blockAt(pos));
	// 		bot.once("pos_"+pos+"_empty",(function (pos,done) {return function() {
	// 		if(canFall(pos.offset(0,1,0))) bot.once("pos_"+pos+"_not_empty",function(){done(false);});
	// 		else done();
	// 		};})(pos,done));// because a block can fall
	// 	}
	// 	bot.dig(bot.blockAt(pos),function(pos,done)
	// 	{
	// 		return function()
	// 		{
	// 			if(canFall(pos.offset(0,1,0))) 
	// 				bot.once("pos_"+pos+"_empty",(function (pos,done) {return function() {bot.once("pos_"+pos+"_not_empty",function(){done(false);});}})(pos,done));
	// 			else done();
	// 		}
	// 	}(pos,done));
	// 	bot.dig(bot.blockAt(pos),function(pos,done){return function(){done(isEmpty(pos));}}(pos,done));
	});
}


function build(s,u,done)
{
	stringTo.stringToPosition(s,u,null,function(blockPosition){
		blockPosition=blockPosition.floored();
		if(isNotEmpty(blockPosition)) {done(); return;}
		if(bot.heldItem===null) {done(true);return;}
		var x,y,z,p;
		var contiguousBlocks=[new vec3(1,0,0),new vec3(-1,0,0),new vec3(0,1,0),new vec3(0,-1,0),new vec3(0,0,-1),new vec3(0,0,1)];
		for(i in contiguousBlocks)
		{
			p=blockPosition.plus(contiguousBlocks[i]);
			if(isNotEmpty(p))
			{
				bot.placeBlock({position:p},(new vec3(0,0,0)).minus(contiguousBlocks[i]));
				setTimeout(done,200);
				return;
			}
		}
	});
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

module.exports={
	dig:dig,
	build:build,
	watch:watch,
	stopWatch:stopWatch,
	replicate:replicate,
	canFall:canFall,
	init:init
};
