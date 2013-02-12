var ce = require('cloneextend');
var parser = require("./grammar").parser;

var bot,vec3,generated_tasks,tasks,parameterized_alias,alias,master;

function init(_regex,_generated_tasks,_tasks,_parameterized_alias,_alias,_bot,_vec3,_master) // ou passer simplement task...
{
	master=_master;
	bot=_bot;
	vec3=_vec3;
	function replaceRegex(text)
	{
		for(var i in _regex)
		{
			text=text.replace(i,_regex[i]);
		}
		return text;
	}

	ngenerated_tasks={};
	for(i in _generated_tasks)
	{
		ngenerated_tasks[replaceRegex(i)]=_generated_tasks[i];
	}
	generated_tasks=ngenerated_tasks;

	ntasks={};
	for(i in _tasks)
	{
		ntasks[replaceRegex(i)]=_tasks[i];
	}
	tasks=ntasks;

	nparameterized_alias={};
	for(i in _parameterized_alias)
	{
		nparameterized_alias[replaceRegex(i)]=_parameterized_alias[i];
	}
	parameterized_alias=nparameterized_alias;
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

// à faire plus tard si vraiment nécessaire/utile
// conditionsToMonitor={};
// 
// function monitor()
// {
// 	for(i in conditionsToMonitor)
// 	{
// 		if(conditionsToMonitor[i]())
// 		{
// 			emit(i);
// 		}
// 	}
// }

function applyAction(task,parsedTask,done)
{
		return function()
		{
			var b;
			task.action.f.apply(this,task.action.p.concat([function(success){if(success!=null && !success) {applyAction(task,parsedTask,done)()} else {reportEndOfTask(parsedTask,done)()}}]));
			// comportement différent mais peut etre interessant :
// 			var actione=task.action.f.apply(this,task.action.p);
// 			bot.once(actione,reportEndOfTask(taskName));
		}
}

function nameToTask(parsedTask,username)
{
// 	taskName=replaceAlias(taskName,username);// seems useless, check it...
	
	parsedTask=replaceParameterizedAlias(parsedTask,username);
	var v;
	var task;
	var pars;
	if(parsedTask[0] in generated_tasks)
	{
		pars=ce.clone(parsedTask[1]);
		pars.push(username);
		task=generated_tasks[parsedTask[0]].apply(this,pars);
		task.action.p=task.action.p != undefined ? task.action.p.concat(pars) : pars;
		return task;
	}
	if(parsedTask[0] in tasks)
	{
		pars=ce.clone(parsedTask[1]);
		pars.push(username);
		task=ce.clone(tasks[parsedTask[0]]);
		task.action.p=task.action.p != undefined ? task.action.p.concat(pars) : pars
		return task;
	}
	return null;
}

function achieve(parsedTask,username,done)
{
	var task;
	try
	{
		task=nameToTask(parsedTask,username);
	}
	catch(error)
	{
		console.log(error);
		done();
		return;
	}
		//  	taskName=replaceAlias(taskName,username);//utile ? // bien ?
	if(task===null)
	{
		console.log("Cannot find "+parsedTaskToString(parsedTask));
		done();
		return;
	}
	console.log("I'm going to achieve task "+parsedTaskToString(parsedTask));
	achieveList(task.deps!=undefined ? task.deps : [],username,applyAction(task,parsedTask,done));
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

function replaceParameterizedAlias(parsedMessage,username)
{
	if(parsedMessage[0] in parameterized_alias)
	{
		var pars=ce.clone(parsedMessage[1]);
		pars.push(username);
// 			console.log(pars);
		return replaceParameterizedAlias(parse(parameterized_alias[parsedMessage[0]].apply(this,pars),username));
	}
	else return parsedMessage;
}

function parse(message,username)
{
	return /*replaceAllParameterizedAlias(*/parser.parse(replaceAlias(message,username))/*)*/;
}

function processMessage(username,message,done)
{
	if(username !=bot.username && (username===master || master===undefined))
	{
// 		message=replaceAlias(message,username);
		console.log(message);
		var parsedMessage;
		try
		{
			parsedMessage=parse(message,username);
		}
		catch(error)
		{
			console.log(error);
			return;
		}
		if(parsedMessage[0] in generated_tasks || parsedMessage[0] in tasks ||parsedMessage[0] in parameterized_alias) achieve(parsedMessage,username,done);
	}
}

exports.init=init;
exports.processMessage=processMessage;
exports.achieve=achieve;
exports.achieveList=achieveList;