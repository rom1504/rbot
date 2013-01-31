var ce = require('cloneextend');


function init(_regex,_generated_tasks,_tasks,_parameterized_alias,_alias,_unique,_bot,_vec3) // ou passer simplement task...
{
	bot=_bot;
	vec3=_vec3;
	unique=_unique;
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

function reportEndOfTask(taskName,done)
{
	return function()
	{
		console.log("I achieved task "+taskName);
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

function achieved(task)
{
	return task.action.c.apply(this,task.action.p);
}

function applyAction(task,taskName,done)
{
		return function()
		{
			var b;
			
			if((b=achieved(task))!=null && b) (reportEndOfTask(taskName,done))();
			else task.action.f.apply(this,task.action.p.concat([achieved(task)===null ? reportEndOfTask(taskName,done) : applyAction(task,taskName,done)]));
			// comportement différent mais peut etre interessant :
// 			var actione=task.action.f.apply(this,task.action.p);
// 			bot.once(actione,reportEndOfTask(taskName));
		}
}

function nameToTask(taskName,username)
{
	taskName=replaceAlias(taskName,username);
	var v;
	var task;
	for(rtaskName in tasks)
	{
		if((v=(new RegExp("^"+rtaskName+"$")).exec(taskName))!=null)
		{
			v.shift();
			v.push(username);
			task=ce.clone(tasks[rtaskName]);
			task.action.p=task.action.p != undefined ? task.action.p.concat(v) : v
			break;
		}
	}
	for(rtaskName in generated_tasks)
	{
		if((v=(new RegExp("^"+rtaskName+"$")).exec(taskName))!=null)
		{
			v.shift();
			v.push(username);
			task=generated_tasks[rtaskName].apply(this,v);
			task.action.p=task.action.p != undefined ? task.action.p.concat(v) : v
			break;
		}
	}
	return task;
}

function achieve(taskName,username,done)
{
	var task=nameToTask(taskName,username);
//  	taskName=replaceAlias(taskName,username);//utile ? // bien ?
	console.log("I'm going to achieve task "+taskName);
	var taskNameList=task.deps!=undefined ? task.deps : [];
	var ltasks=[];
	for(var i in taskNameList)
	{
		ltasks[i]=nameToTask(taskNameList[i],username);
	}
	achieveDependencies(taskNameList,ltasks,username,applyAction(task,taskName,done));
}

function achieveDependenciesAux(taskNameList,ltasks,i,toContinue,username,done)
{
	if(i<taskNameList.length)
	{
		var b;
		b=achieved(ltasks[i]);
		if(b===null || !b)
		{
			toContinue=true;
			if(b===null) ltasks[i].c=function() {return true;};
			achieve(taskNameList[i],username,(function()
			{
				return function(){achieveDependenciesAux(taskNameList,ltasks,i+1,toContinue,username,done)}
			})(taskNameList,ltasks,i,username,done));
			
		}
		else achieveDependenciesAux(taskNameList,ltasks,i+1,toContinue,username,done);
	}
	else
	{		
		if(toContinue) achieveDependencies(taskNameList,ltasks,username,done);
		else done();
	}
}


function achieveDependencies(taskNameList,ltasks,username,done) // on suppose ici que les dépendances ne modifie pas l'état : les paramètres font références à l'état initial
{
	achieveDependenciesAux(taskNameList,ltasks,0,false,username,done);
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
		var v;
		for(var aliap in parameterized_alias)
		{
			if((v=(new RegExp(aliap)).exec(message))!=null)
			{
				var toReplace=v.shift();
				v.push(v.input);
				v.push(username);
// 				console.log(v);
				newM=message.replace(toReplace,parameterized_alias[aliap].apply(this,v));
				if(newM!=message)
				{
					message=newM;
					changed=1;
					continue;
				}
			}
		}
	}
	return message;
}

function processMessage(username, message)
{
	message=replaceAlias(message,username);
// 	console.log(message);
	for(taskName in tasks)
	{
		if((new RegExp("^"+taskName+"$")).test(message))
		{
			achieve(message,username,function(){});
			return;
		}		
	}
	for(taskName in generated_tasks)
	{
		if((new RegExp("^"+taskName+"$")).test(message))
		{
			achieve(message,username,function(){});
			return;
		}		
	}
}


exports.init=init;
exports.processMessage=processMessage;
exports.achieve=achieve;
