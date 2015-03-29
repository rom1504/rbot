var repeating,achieve,achieveList,stringTo;

function init(_achieve,_achieveList,_stringTo)
{
	achieve=_achieve;
	achieveList=_achieveList;
	stringTo=_stringTo;
	repeating=false;
}


function repeatAux(taskName,over,username,done)
{
  setImmediate(function() {
    if (!over()) achieve(taskName, username, (function (taskName, over, username, done) {
      return function (status) {
        if (status == true) done(true);
        //else setTimeout(repeatAux,100,taskName,over,username,done);
        else repeatAux(taskName, over, username, done);

      }
    })(taskName, over, username, done));
    else done();
  });
}

function repeat(taskName,username,done)
{
	repeating=true;
	repeatAux(taskName,function(){return !repeating;},username,done);
}

function stopRepeat(taskName,done)
{
	repeating=false;
	done();
}

function ifThenElse(pred,then,els,u,done)
{
	if(pred()) achieve(then,u,done);
	else achieve(els,u,done);
}

function ifThen(pred,then,u,done)
{
	if(pred()) achieve(then,u,done);
	else done();
}

function repeatUntil(taskName,pred,u,done)
{
	repeatAux(taskName,pred,u,done);
}

function achieveListAux(p,u,done)
{
	achieveList(p,u,done);
}

function nothing(done)
{
	done();
}

function wait(time,done)
{
	setTimeout(done,time);
}

module.exports={
	repeat:repeat,
	stopRepeat:stopRepeat,
	ifThen:ifThen,
	ifThenElse:ifThenElse,
	repeatUntil:repeatUntil,
	achieveListAux:achieveListAux,
	nothing:nothing,
	wait:wait,
	init:init
}