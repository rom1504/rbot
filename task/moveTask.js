var bot,processMessage,isEmpty,stringTo,directions,direction,vec3;

function init(_bot,_processMessage,_isEmpty,_stringTo,_vec3,_isNotEmpty)
{
	bot=_bot;
	processMessage=_processMessage;
	isEmpty=_isEmpty;
	isNotEmpty=_isNotEmpty;
	stringTo=_stringTo;
	vec3=_vec3;
}


function jump(done)
{
	bot.setControlState('jump', true);
	bot.setControlState('jump', false);
	setTimeout(done,400);// change this
}

function up(done) // change this a bit ?
{
	if(isNotEmpty(bot.entity.position.offset(0, 2, 0))) {done(true);return;}
	  //if(bot.heldItem===null) {done(true);return;} // replace this with something checking whether the bot has a block to build ?
  var targetBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  var jumpY = bot.entity.position.y + 1;
	bot.setControlState('jump', true);
  bot.on('move', placeIfHighEnough);
  
  function placeIfHighEnough() {
    if (bot.entity.position.y > jumpY) {
      bot.placeBlock(targetBlock, vec3(0, 1, 0));
      //dirty
	  //processMessage(u,"sbuild r0,-1,0",function(){ // this is very wrong, solve it somehow (doesn't take into account the parameter of the callback as in achieve)
		bot.setControlState('jump', false);
		bot.removeListener('move', placeIfHighEnough);
        setTimeout(done,400);// could (should ?) be replaced my something checking whether the bot is low enough/has stopped moving
	 // });
    }
  }
}

function center(p)
{
	return p.floored().offset(0.5,0,0.5);
}

function scalarProduct(v1,v2)
{
	return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
}

function norm(v)
{
	return Math.sqrt(scalarProduct(v,v));
}

function isFree(pos)
{
	return isEmpty(pos) && isEmpty(pos.offset(0,1,0));
}

function move(goalPosition,done)
{
	goalPosition=center(goalPosition);
	bot.lookAt(goalPosition.offset(0,bot.entity.height,0),true);
	bot.setControlState('forward', true);
	var arrive=setInterval((function(goalPosition,done){return function()
	{
		if(/*scalarProduct(goalPosition.minus(bot.entity.position),d)<0 || */goalPosition.distanceTo(bot.entity.position)<0.3 || !isFree(goalPosition)/*(norm(bot.entity.velocity)<0.01)*/)
		{
			bot.setControlState('forward', false);
			clearInterval(arrive);
			done();// maybe signal an error if the goal position isn't free (same thing for move to)
		} else bot.lookAt(goalPosition.offset(0,bot.entity.height,0),true);
	}})(goalPosition,done),50);	
}


function moveTo(goalPosition,done)
{
	goalPosition=center(goalPosition);
	if(goalPosition!=null /*&& isFree(goalPosition)*/)
	{
		if(goalPosition.distanceTo(bot.entity.position)>=0.2)
		{
			//bot.navigate.to(goalPosition);//use callback here ?
			var a=bot.navigate.findPathSync(goalPosition,{timeout:5000});
			console.log(a.status+" "+a.path.length);
			if(a.path.length<=1) done();
			else if(a.status==='success') bot.navigate.walk(a.path,function(){done()});
			else if(a.status==='noPath') done(true);
			else bot.navigate.walk(a.path,function(){moveTo(goalPosition,done);});
			//bot.once("stop",done);
		}
		else done();
	} else done(true);
}

function stopMoveTo(done)
{
	bot.navigate.stop();
	done();
}

function tcc(done)
{
	bot.entity.position=center(bot.entity.position);
    setTimeout(done,200);
}

module.exports={
		jump:jump,
		up:up,
		move:move,
		moveTo:moveTo,
		stopMoveTo:stopMoveTo,
		tcc:tcc,
		init:init
};