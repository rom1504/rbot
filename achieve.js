var ce = require('cloneextend');
var parser = require("./grammar/grammar").parser;

var bot, vec3, generated_tasks, tasks, parameterized_alias, alias, master, stringTo, giveUser;

function init(_tasks, _giveUser, _parameterized_alias, _alias, _stringTo, _bot, _vec3, _master) // ou passer simplement task...
{
  master = _master;
  bot = _bot;
  vec3 = _vec3;
  tasks = _tasks;
  parameterized_alias = _parameterized_alias;
  alias = _alias;
  stringTo = _stringTo;
  giveUser = _giveUser;
}

function parsedTaskToString(parsedTask) {
  function arrayToString(a) {
    return "[" + a.map(taskToString).join() + "]";
  }

  function taskToString(t) {
    if (t.constructor == Array) return arrayToString(t);
    if (t.constructor == String) return '"' + t + '"';
  }

  return (taskToString(parsedTask));
}

function reportEndOfTask(parsedTask, done) {
  return function () {
    console.log("I achieved task " + parsedTaskToString(parsedTask));
    done();
  };
}

function reportFailOfTask(parsedTask, done) {
  return function () {
    console.log("I failed task " + parsedTaskToString(parsedTask));
  };
}

function applyAction(task, username, parsedTask, done) {
  var b;
  stringTo.stringTo(task.p, parsedTask[0] == "look at" ? 1 : null, username, function (pars) {
    task.f.apply(this, pars.concat(giveUser.indexOf(parsedTask[0]) != -1 ? [username] : []).concat([function (result) {
      if (result != null && !result) {
        applyAction(task, username, parsedTask, done);
      } else {
        if (result) reportFailOfTask(parsedTask)(); else reportEndOfTask(parsedTask, done)()
      }
    }]));
  });
}

function nameToTask(parsedTask, username, done) {
  replaceParameterizedAlias(parsedTask, username, function (parsedTask) {
    var v;
    var task;
    var pars;
    if (parsedTask[0] in tasks) {
      pars = ce.clone(parsedTask[1]);
      task = {f: ce.clone(tasks[parsedTask[0]]), p: pars};
      done(task, parsedTask);
    }
    else done(null, parsedTask);
  });
}

function achieve(parsedTask, username, done) {
  try {
    nameToTask(parsedTask, username, function (task, parsedTask) {
      if (task === null) {
        console.log("Cannot find " + parsedTaskToString(parsedTask));
        done(true);// think how to use this...
        return;
      }
      console.log("I'm going to achieve task " + parsedTaskToString(parsedTask));
      setImmediate(function () {
        applyAction(task, username, parsedTask, done)
      });
    });
  }
  catch (error) {
    console.log(error.stack);
    done(true);
    return;
  }
}

function listAux(taskNameList, i, username, done) {
  if (i < taskNameList.length) setImmediate(function () {
    achieve(taskNameList[i][1], username, (function (taskNameList, i, username, done) {
      return function () {
        setImmediate(function () {
          listAux(taskNameList, i + 1, username, done);
        });
      };
    })(taskNameList, i, username, done))
  });
  else setImmediate(done);
}

function achieveList(taskNameList, username, done) {
  listAux(taskNameList, 0, username, done);
}

//reecriture (systeme suppose confluent et fortement terminal)
function replaceAlias(message) {
  var changed = 1;
  while (changed) {
    changed = 0;
    for (var alia in alias) {
      var newM = message.replace(alia, alias[alia]);
      if (newM != message) {
        message = newM;
        changed = 1;
        continue; // sure ?
      }
    }
  }
  return message;
}

function replaceParameterizedAlias(parsedMessage, username, done) {
  if (parsedMessage[0] in parameterized_alias) {
    var pars = ce.clone(parsedMessage[1]); // how can I use stringTo ? (removing parameterized alias ?) seems like I don't want to use it
    pars = pars.map(function (par) {
      return par[1];
    });
    pars.push(username);
    pars.push(function (replaced) {
      replaceParameterizedAlias(parse(replaced), username, done);
    });
    parameterized_alias[parsedMessage[0]].apply(this, pars);
// 			console.log(pars);
  }
  else done(parsedMessage);
}

function parse(message) {
  return parser.parse(replaceAlias(message));
}

function processMessage(message, username, done) {
  if (username != bot.username && (username === master || master === undefined)) {
    console.log(message);
    var parsedMessage;
    try {
      parsedMessage = parse(message);
    }
    catch (error) {
      console.log(error.stack);
      return;
    }
    if (parsedMessage[0] in tasks || parsedMessage[0] in parameterized_alias) achieve(parsedMessage, username, done);
  }
}

module.exports = {
  init: init,
  processMessage: processMessage,
  achieve: achieve,
  achieveList: achieveList
};