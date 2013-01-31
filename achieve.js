var ce = require('cloneextend');


function init(_regex,_generated_tasks,_tasks,_parameterized_alias,_alias,_unique,_bot,_vec3) // ou passer simplement task...
{
	bot=_bot;
	vec3=_vec3;
	unique=_unique;
	//possibilité (possiblement) de remplacer une fois au lancement seulement
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

function reportEndOfTask(taskName,eventTaskName)
{
	return function()
	{
		console.log("I achieved task "+taskName);
		bot.emit(eventTaskName);
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

function applyAction(task,taskName,eventTaskName)
{
		return function()
		{
			var b;
			if((b=achieved(task))!=null && b)
			{
					(reportEndOfTask(taskName,eventTaskName))();
			}
			else
			{
				var actione=task.action.f.apply(this,task.action.p);
				bot.once(actione,achieved(task)===null ? reportEndOfTask(taskName,eventTaskName) : applyAction(task,taskName,eventTaskName));
			}
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
// 			v.push(v.input);
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
// 			v.push(v.input);
			v.push(username);
			task=generated_tasks[rtaskName].apply(this,v);
			task.action.p=task.action.p != undefined ? task.action.p.concat(v) : v
			break;
		}
	}
	return task;
}

function achieve(taskName,username,eventTaskName)
{
	var task=nameToTask(taskName,username);
//  	taskName=replaceAlias(taskName,username);//utile ? // bien ?
	console.log("I'm going to achieve task "+taskName);
	var eIni=unique("demarrerAchieve");
	var eEnd=unique("endAchieve");
	var taskNameList=task.deps!=undefined ? task.deps : [];
	var ltasks=[];
	for(var i in taskNameList)
	{
		ltasks[i]=nameToTask(taskNameList[i],username);
	}
	achieveDependencies(eIni,taskNameList,ltasks,eEnd,username);
	bot.once(eEnd,applyAction(task,taskName,eventTaskName));
	bot.emit(eIni);
}

function achieveInAchieveDependencies(taskNameList,i,username,eventTaskName)
{
	return function(){achieve(taskNameList[i],username,eventTaskName)};
}

function achieveDependencies(eIni,taskNameList,ltasks,eEnd,username)
{
	var e=eIni;
	var b;
	var toContinue=false;
	var eventTaskName;
	for(var i in taskNameList)
	{
		b=achieved(ltasks[i]);// on suppose ici que les dépendances ne modifie pas l'état : les paramètres font références à l'état initial
		if(b===null || !b)
		{
			eventTaskName=unique(taskNameList[i]);
			bot.once(e,achieveInAchieveDependencies(taskNameList,i,username,eventTaskName));// unique eventTaskName
			e=eventTaskName;
			if(b===null) ltasks[i].c=function() {return true;};
			toContinue=true;
		}
	}
	if(toContinue)
	{
		bot.once(e,function(eIni,taskNameList,ltasks,eEnd) {return function(){var s=unique("achieveDependencies");achieveDependencies(s,taskNameList,ltasks,eEnd,username);bot.emit(s);};} (eIni,taskNameList,ltasks,eEnd));
	}
	else
	{
		bot.once(e,(function(eEnd){return function() {bot.emit(eEnd);};})(eEnd));
	}
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
			achieve(message,username,unique(message));
			return;
		}		
	}
	for(taskName in generated_tasks)
	{
		if((new RegExp("^"+taskName+"$")).test(message))
		{
			achieve(message,username,unique(message));
			return;
		}		
	}
}


exports.init=init;
exports.processMessage=processMessage;
exports.achieve=achieve;