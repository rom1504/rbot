var ce = require('cloneextend');
var parser = require("./grammar/grammar").parser;

var bot,vec3,generated_tasks,tasks,parameterized_alias,alias,master;

function init(_tasks,_parameterized_alias,_alias,_bot,_vec3,_master) // ou passer simplement task...
{
	master=_master;
	bot=_bot;
	vec3=_vec3;
	tasks=_tasks;
	parameterized_alias=_parameterized_alias;
	alias=_alias;
}

function parsedTaskToString(parsedTask)
{
	function arrayToString(a)
	{
		return "["+a.map(taskToString).join()+"]";
	}
	function taskToString(t)
	{
		if(t.constructor == Array) return arrayToString(t);
		if(t.constructor == String) return '"'+t+'"';
	}
	return(taskToString(parsedTask));
}

function reportEndOfTask(parsedTask,done)
{
	return function()
	{
		console.log("I achieved task "+parsedTaskToString(parsedTask));
		done();
	};
}

function reportFailOfTask(parsedTask,done)
{
	return function()
	{
		console.log("I failed task "+parsedTaskToString(parsedTask));
	};
}

function applyAction(task,parsedTask,done)
{
		var b;
		task.f.apply(this,task.p.concat([function(result){
			if(result!=null && !result) {applyAction(task,parsedTask,done);} else {if(result) reportFailOfTask(parsedTask)(); else reportEndOfTask(parsedTask,done)()}
			
		}]));
		
}

function nameToTask(parsedTask,username,done)
{
	replaceParameterizedAlias(parsedTask,username,function(parsedTask){
		var v;
		var task;
		var pars;
		if(parsedTask[0] in tasks)
		{
			pars=ce.clone(parsedTask[1]);
			pars.push(username);
			task={f:ce.clone(tasks[parsedTask[0]]),p:pars};
			done(task);
		}
		else done(null);
	});
}

function achieve(parsedTask,username,done)
{
	try
	{
		nameToTask(parsedTask,username,function(task){
			if(task===null)
			{
				console.log("Cannot find "+parsedTaskToString(parsedTask));
				done();
				return;
			}
			console.log("I'm going to achieve task "+parsedTaskToString(parsedTask));
			applyAction(task,parsedTask,done);
		});
	}
	catch(error)
	{
		console.log(error.stack);
		done(true);
		return;
	}
}

function listAux(taskNameList,i,username,done)
{
	if(i<taskNameList.length) achieve(taskNameList[i],username,(function(taskNameList,i,username,done) {
		return function() {listAux(taskNameList,i+1,username,done)};
	})(taskNameList,i,username,done));
	else done();
}

function achieveList(taskNameList,username,done)
{
	listAux(taskNameList,0,username,done);
}

//reecriture (systeme suppose confluent et fortement terminal)
function replaceAlias(message,username)
{
	var changed=1;
	while(changed)
	{
		changed=0;
		for(var alia in alias)
		{
			var newM=message.replace(alia,alias[alia]);
			if(newM!=message)
			{
				message=newM;
				changed=1;
				continue; // sure ?
			}
		}
	}
	return message;
}

// function mapParsedMessage(parsedMessage,fun)
// {
// 	if(parsedMessage[0]==="taskList") for(i in parsedMessage[1]) parsedMessage[1][i]=mapParsedMessage(parsedMessage[1][i],fun);
// 	else if(parsedMessage[0]==="repeat") parsedMessage[1][0]=mapParsedMessage(parsedMessage[1][0],fun);
// 	else if(parsedMessage[0]==="repeatUntil") parsedMessage[1][0]=mapParsedMessage(parsedMessage[1][0],fun);
// 	else if(parsedMessage[0]==="ifThen") parsedMessage[1][1]=mapParsedMessage(parsedMessage[1][1],fun);
// 	else if(parsedMessage[0]==="ifThenElse")
// 	{
// 		parsedMessage[1][1]=mapParsedMessage(parsedMessage[1][1],fun);
// 		parsedMessage[1][2]=mapParsedMessage(parsedMessage[1][2],fun);
// 	}
// 	else if(parsedMessage[0]==="stopRepeat") parsedMessage[1][0]=mapParsedMessage(parsedMessage[1][0],fun);
// 	else parsedMessage=fun(parsedMessage);
// 	return parsedMessage;
// }
// 
// function replaceAllParameterizedAlias(parsedMessage,username)
// {
// 	return mapParsedMessage(parsedMessage,function(username){return function(parsedMessage){replaceParameterizedAlias(parsedMessage,username)};}(username));
// }

function replaceParameterizedAlias(parsedMessage,username,done)
{
	if(parsedMessage[0] in parameterized_alias)
	{
		var pars=ce.clone(parsedMessage[1]);
		pars.push(username);
		pars.push(function(replaced){
			replaceParameterizedAlias(parse(replaced,username),username,done);
		});
		parameterized_alias[parsedMessage[0]].apply(this,pars);
// 			console.log(pars);
	}
	else done(parsedMessage);
}

function parse(message,username)
{
	return /*replaceAllParameterizedAlias(*/parser.parse(replaceAlias(message,username))/*)*/;
}

function processMessage(username,message,done)
{
	if(username !=bot.username && (username===master || master===undefined))
	{
		console.log(message);
		var parsedMessage;
		try
		{
			parsedMessage=parse(message,username);
		}
		catch(error)
		{
			console.log(error.stack);
			return;
		}
		if(parsedMessage[0] in tasks ||parsedMessage[0] in parameterized_alias) achieve(parsedMessage,username,done);
	}
}

module.exports={
	init:init,
	processMessage:processMessage,
	achieve:achieve,
	achieveList:achieveList
};