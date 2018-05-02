const Vec3 = require('vec3').Vec3;

let bot,stringTo,isNotEmpty,isBlockEmpty,isBlockNotEmpty,isEmpty,processMessage,positionToString;

function init(_bot,_stringTo,_isNotEmpty,_isBlockEmpty,_isBlockNotEmpty,_isEmpty,_positionToString,_processMessage)
{
	bot=_bot;
	stringTo=_stringTo;
	isNotEmpty=_isNotEmpty;
	isBlockEmpty=_isBlockEmpty;
	isBlockNotEmpty=_isBlockNotEmpty;
	isEmpty=_isEmpty;
	positionToString=_positionToString;
	processMessage=_processMessage;
}

function canFall(pos)
{
	const b=bot.blockAt(pos);
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
	let p;
	const contiguousBlocks=[new Vec3(1,0,0),new Vec3(-1,0,0),new Vec3(0,1,0),new Vec3(0,-1,0),new Vec3(0,0,-1),new Vec3(0,0,1)];
	for(i in contiguousBlocks)
	{
		p=blockPosition.plus(contiguousBlocks[i]);
		if(isNotEmpty(p))
		{
			bot.placeBlock({position:p},(new Vec3(0,0,0)).minus(contiguousBlocks[i]),done);
			return;
		}
	}
}


let com;
let wa;

function watch(ent,done)
{
	const firstPosition=ent.position.floored();
	com="";
	bot.on('blockUpdate',function(firstPosition){wa=[done,function(oldBlock,newBlock)
	{
		if(newBlock==null) return;
		if(ent.position.floored().distanceTo(newBlock.position.floored())<5)
		{
			let action;
			if(isBlockEmpty(newBlock)) action="dig";
			else if(isBlockNotEmpty(newBlock)) action="build";
			else action="";
			if(action!=="")
			{
				const d=newBlock.position.floored().minus(firstPosition);
				const c=action+" r"+positionToString(d)
				console.log(c);
				com+=(com !== "" ? " then " : "")+c;
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
