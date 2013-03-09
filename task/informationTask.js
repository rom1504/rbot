var bot,stringTo;

function init(_bot,_stringTo)
{
	bot=_bot;
	stringTo=_stringTo;
}

function pos(player,done)
{
	if(bot.players[player].entity!=undefined) bot.chat(player+" is in "+bot.players[player].entity.position);
	else bot.chat(player+" is too far.");
	done();
}



function lookForEntity(ent,done)
{
	if(ent===null) bot.chat("I can't find it");
	else bot.chat("It is in "+ent.position+(ent.type === 'mob' ? ". It's a "+ent.mobType : (ent.type === 'object' ? ". It's a "+ent.objectType : "")));
	done();
}

function lookForBlock(block,done)
{
	if(block===null) bot.chat("I can't find it");
	else bot.chat("It is in "+block.position+". It's a "+block.name);
	done();
}

// function lookFor(s,u,done)
// {
// 	var ent=stringTo.stringToEntity(s,u);
// 	if(ent!==null) {bot.chat(s+" is in "+ent.position+(ent.type === 'mob' ? ". It's a "+ent.mobType : (ent.type === 'object' ? ". It's a "+ent.objectType : "")));done();return;}
// 	var block=stringTo.stringToBlock(s);
// 	if(block!==null) {bot.chat(s+" is in "+block.position+". It's a "+block.name);done();return;}
// 	bot.chat("I can't find "+s);
// 	done();
// }


function say(message,done)
{
	bot.chat(message);
	done();
}

module.exports={
	pos:pos,
	lookForEntity:lookForEntity,
	lookForBlock:lookForBlock,
	say:say,
	init:init
};