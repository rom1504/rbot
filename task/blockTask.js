var bot,stringTo,isNotEmpty,isBlockEmpty,isBlockNotEmpty,isEmpty,vec3,processMessage,positionToString;

function init(_bot,_stringTo,_isNotEmpty,_isBlockEmpty,_isBlockNotEmpty,_isEmpty,_vec3,_positionToString,_processMessage)
{
	bot=_bot;
	stringTo=_stringTo;
	isNotEmpty=_isNotEmpty;
	isBlockEmpty=_isBlockEmpty;
	isBlockNotEmpty=_isBlockNotEmpty;
	isEmpty=_isEmpty;
	vec3=_vec3;
	positionToString=_positionToString;
	processMessage=_processMessage;
}

function canFall(pos)
{
	var b=bot.blockAt(pos);
	return b!=null && (b.type===13 || b.type===12);
}

// function print(l,done)
// {
// 	// build the a tower and the next tower and at the same time build the previous position
// 	// then move and do this again
// }

function dig(pos,done)
{
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
	bot.dig(bot.blockAt(pos),function() {done()});
}


function build(blockPosition,done)
{
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
			//setTimeout(done,200);
			done();
			return;
		}
	}
}


var com;
var wa;

function watch(ent,done)
{
	var firstPosition=ent.position.floored();
	com="";
	bot.on('blockUpdate',function(firstPosition){wa=[done,function(oldBlock,newBlock)
	{
		if(newBlock==null) return;
		if(ent.position.floored().distanceTo(newBlock.position.floored())<5)
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

function stopWatch(done)
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
	processMessage(com,u,done);
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
