var mineflayer = require('mineflayer');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var ce = require('cloneextend');
var vec3 = mineflayer.vec3;
var bot = mineflayer.createBot({
	username: process.argv[4],
	verbose: true,
	port:parseInt(process.argv[3]),
	host:process.argv[2]});

navigatePlugin(bot);

bot.on('login', function() {
  console.log("I logged in.");
  bot.chat("/login "+process.argv[5]);
  console.log("settings", bot.settings);
});

// function estVideRelatif(dp)
// {
// 	return estVide(new vec3(bot.entity.position.x+dp.x,bot.entity.position.y+dp.y,bot.entity.position.z+dp.z));
// }

function surveiller()
{
	for(dx=-1;dx<=1;dx++)
	{
		for(dy=-1;dy<=2;dy++)
		{
			for(dz=-1;dz<=1;dz++)
			{
				var dp=new vec3(dx,dy,dz);
				var p=bot.entity.position.plus(dp).floored();
				if(estVide(p)) bot.emit("pos_"+p+"_vide");
			}
		}
	}
}

function slowLoop()
{
	surveiller();
}

bot.on('spawn', function() {
//   bot.chat("I have spawned");
  console.log("game", bot.game);
//   maj=setInterval(fastLoop, 50);
  maj2=setInterval(slowLoop, 500);
});
bot.on('death', function() {
  bot.chat("I died x.x");
//   clearInterval(maj);
  clearInterval(maj2);
});

// bot.on('chunkUpdate',function()
// {
// 	surveiller();
// });

function estVide(pos)
{
// 	console.log(pos);
	var b=bot.blockAt(pos);
	return b!=null && b.type===0;
}

function posArrondi()
{
	return new vec3(Math.floor(bot.entity.position.x), Math.floor(bot.entity.position.y), Math.floor(bot.entity.position.z));
}

function conditionCreuse(x,y,z)
{
	if(typeof(x)=='string') x=parseFloat(x);
	if(typeof(y)=='string') y=parseFloat(y);
	if(typeof(z)=='string') z=parseFloat(z);
	var pos=(new vec3(x,y,z)).floored();
	return estVide(pos);
}

function creuse(x,y,z)
{
	if(typeof(x)=='string') x=parseFloat(x);
	if(typeof(y)=='string') y=parseFloat(y);
	if(typeof(z)=='string') z=parseFloat(z);
	var pos=(new vec3(x,y,z)).floored();
	if(estVide(pos))
	{
		console.log("c'est vide !");
		return "pos_"+pos+"_vide";
	}
	var rpos=pos.minus(bot.entity.position);
	var face=-1;
	if(rpos.x>0) {face=4;}
	else if(rpos.x<0) {face=5;}
	else if(rpos.z>0) {face=2;}
	else if(rpos.z<0) {face=3;}
	else if(rpos.y>0) {face=0;}
	else if(rpos.y<0) {face=1;}
	bot.client.write(0x0e, {status: 0,x:pos.x,y:pos.y,z:pos.z,face:face});
	bot.client.write(0x0e, {status: 2,x:pos.x,y:pos.y,z:pos.z,face:face});
	console.log("Je creuse la position "+pos);
	var e=unique("finCreuse");
	bot.on("pos_"+pos+"_vide",function(){setTimeout(function(){bot.emit(e);},500);});// car une roche met un certain temps à tomber (500 bon temps ? : réduisible ?)
	return e;
}


function scalarProduct(v1,v2)
{
	return v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
}

function norm(v)
{
	return Math.sqrt(scalarProduct(v,v));
}

numeros={};
function unique(nom)
{
	if(numeros[nom]==undefined) numeros[nom]=0;
	numeros[nom]++;
	return nom+numeros[nom];
}
var positionObjectif=new vec3(0,0,0);
function conditionDeplacer(x,y,z)
{
	if(typeof(x)=='string') x=parseFloat(x);
	if(typeof(y)=='string') y=parseFloat(y);
	if(typeof(z)=='string') z=parseFloat(z);
	var positionObjectif=new vec3(x,y,z);
// 	console.log(!estLibre(positionObjectif));
	console.log(positionObjectif+" "+bot.entity.position);
	console.log(positionObjectif.distanceTo(bot.entity.position));
	console.log(positionObjectif.distanceTo(bot.entity.position)<0.1);
	return positionObjectif.distanceTo(bot.entity.position)<0.1 || !estLibre(positionObjectif);
}


function deplacer(x,y,z)
{
	if(typeof(x)=='string') x=parseFloat(x);
	if(typeof(y)=='string') y=parseFloat(y);
	if(typeof(z)=='string') z=parseFloat(z);
	var positionObjectif=new vec3(x,y,z);
	
	bot.lookAt(positionObjectif);
	bot.setControlState('forward', true);
	var eA=unique("deplace");
	var arrive=setInterval(function()
	{
		if(/*scalarProduct(positionObjectif.minus(bot.entity.position),d)<0 || */positionObjectif.distanceTo(bot.entity.position)<0.1 || !estLibre(positionObjectif)/*(norm(bot.entity.velocity)<0.01)*/) // modifier comme conditionDeplacer peut etre
		{
			clearInterval(arrive);
			bot.setControlState('forward', false);
			bot.emit(eA);
		}
	},50);
	return eA;
}

directions=[new vec3(0,0,1),new vec3(0,0,-1),new vec3(1,0,0),new vec3(-1,0,0)];
direction=directions[0];

function estLibre(pos)
{
	return estVide(pos) && estVide(pos.offset(0,1,0));
}

// function chercherDirection()
// {
// 	var i;
// 	while(1)
// 	{
// 		i=Math.floor(Math.random()*4);
// 		if(estLibre(i)) {return i;}
// 	}
// 	return directions[i];
// }
// 
// function conditionAvancer(dejaEssaye)
// {
// 	return false;
// }
// 
// function avancer()
// {
// 	if(!estLibre(direction))
// 	{
// 		direction=chercherDirection();
// 	}
// 	e=deplacer(direction.x,direction.y,direction.z);
// 	return e;
// }

function repeter(nomEtat)
{
	atteindre(nomEtat);
// 	console.log("ogogofof"+nomEtat);
	bot.on(nomEtat,repetition=function(){atteindre(nomEtat);});
	repetitionEnCours=true;
	return "repeter";
}

function conditionRepeter(nomEtat)
{
	return null;
}

function arreterRepeter(nomEtat)
{
	bot.removeListener(nomEtat,repetition); // modifier pour permettre plusieurs répétition simultannée ?
	setTimeout(function(){repetitionEnCours=false;bot.emit("arreter repeter");bot.emit("repeter");},200);
	return "arreter repeter";
}

function conditionArreterRepeter(nomEtat)
{
	return null;
}

// function marcheEscalierColimacon() // non : utiliser des états paramétrés
// {
// 	creuse(new vec3(0,1,1));
// 	creuse(new vec3(0,1,0));
// 	creuse(new vec3(0,2,0));
// 	creuse(new vec3(0,2,1));
// }

function conditionPos(personne)
{
	return null;
}

function pos(personne)
{
	if(bot.players[personne].entity!=undefined) bot.chat(personne+" est en "+bot.players[personne].entity.position);
	else bot.chat(personne+" est trop loin.");
	setTimeout(function(){bot.emit("pos");},100);
	return "pos";
}

function conditionChercherMob(nomMob)
{
	return null;
}

function chercherMob(nomMob)
{
	setTimeout(function(){bot.emit("chercher mob");},100);
	for(i in bot.entities)
	{
		entity=bot.entities[i];
		if(entity.type === 'mob' && entity.mobType ===nomMob)
		{
				bot.chat("Il y a un "+nomMob+" en "+entity.position);
				return "chercher mob";
		}
	}
	bot.chat("Je ne trouve pas de "+nomMob+".");
	return "chercher mob";
}
/*
function conditionAttendre(temps)
{
	return null;
}

function attendre(temps)
{
	var temps=parseInt(temps);
	var f=unique("fin");
	setTimeout(function(f){function(){bot.emit(f);}}(f),temps);
	return f;
}*/

function atteindreDansListe(listeNomsEtats,i)
{
	return function(){atteindre(listeNomsEtats[i])};
}

function listeAux(eIni,listeNomsEtats)
{
	var e=eIni;
// 	console.log(listeNomsEtats);
	for(var i in listeNomsEtats)
	{
// 		console.log(e+"-> atteindre "+listeNomsEtats[i]);
		bot.once(e,atteindreDansListe(listeNomsEtats,i));
		e=listeNomsEtats[i];
	}
// 	console.log(e);
	return e;
}

function conditionListe(listeNomsEtats)
{
	return null;
}

function liste(listeNomsEtats)
{
	var eIni=unique("demarrerListe");
 	var e=listeAux(eIni,listeNomsEtats.split(" puis "));
// 	var l=listeNomsEtats.split(" puis ");
// 	console.log("j'émet "+eIni);
	bot.emit(eIni);
	return e;
}

// (-?[0-9]+(?:\\.[0-9]+)?),(-?[0-9]+(?:\\.[0-9]+)?),(-?[0-9]+(?:\\.[0-9]+)?)
//remplacer par taches (ou cible ?) ?
etats=
{
		// va y avoir un pb ici : pas de fin liste et repeter...
		// les conditions sont des post condition, pas pré
		// pré condition réalisé grace aux dépendances
		"repeter (.+)":{action:{f:repeter,c:conditionRepeter}},//priorité avec puis
		"arreter repeter (.+)":{action:{f:arreterRepeter,c:conditionArreterRepeter}},
		"(.+ puis .+)":{action:{f:liste,c:conditionListe}},
		"creuse position":{action:{f:creuse,c:conditionCreuse}},
		"deplace position":{action:{f:deplacer,c:conditionDeplacer}},
		"pos (.+)":{action:{f:pos,c:conditionPos}},
		"chercher mob (.+)":{action:{f:chercherMob,c:conditionChercherMob}},
// 		"attendre ([0-9]+)":{action:{f:attendre,c:conditionAttendre}}
// 		"avancer":{action:{f:avancer,c:conditionAvancer}},
// 		"creusehba2 position":{action:{f:avancer,c:conditionDeplacer},deps:["creuse "]} // pour faire ça il va falloir faire comme l'alias paramétrable : fonction de génération des états
// 		"monter une marche d'escalier en colimacon":{action:{f:marcheEscalierColimacon,p:[]},deps:[]}
};

etats_generes=
{
	"creusehba position":function (x,y,z) {x=parseFloat(x);y=parseFloat(y);z=parseFloat(z);return {action:{f:deplacer,c:conditionDeplacer,p:[x,y,z]},deps:["creuse "+x+","+(y+1)+","+z,"creuse "+x+","+y+","+z]};}
};

// ou passer à du pur string ?
// etats_parametre


//alias paramétrable ?
alias=
{
	"x+":"deplace r1,0,0",
	"x-":"deplace r-1,0,0",
	"y+":"deplace r0,1,0",
	"y-":"deplace r0,-1,0",
	"z+":"deplace r0,0,1",
	"z-":"deplace r0,0,-1",
}

alias_parametrable=
{
// 	"creusehba position":function (x,y,z) {x=parseFloat(x);y=parseFloat(y);z=parseFloat(z);return "creuse "+x+","+(y+1)+","+z+" puis creuse "+x+","+y+","+z+" puis deplace "+x+","+y+","+z;}
	"rposition":function (x,y,z,input) {if(input.indexOf("repeter")>-1 || input.indexOf("puis")>-1) {return "r"+x+","+y+","+z};x=parseFloat(x);y=parseFloat(y);z=parseFloat(z);return (bot.entity.position.x+x)+","+(bot.entity.position.y+y)+","+(bot.entity.position.z+z)}
}

regex=
{
	"position":"(-?[0-9]+(?:\\.[0-9]+)?),(-?[0-9]+(?:\\.[0-9]+)?),(-?[0-9]+(?:\\.[0-9]+)?)"
}

//possibilité (possiblement) de remplacer une fois au lancement seulement
function remplacerRegex(texte)
{
	for(var i in regex)
	{
		texte=texte.replace(i,regex[i]);
	}
	return texte;
}

netats_generes={};
for(i in etats_generes)
{
	netats_generes[remplacerRegex(i)]=etats_generes[i];
}
etats_generes=netats_generes;

netats={};
for(i in etats)
{
	netats[remplacerRegex(i)]=etats[i];
}
etats=netats;

nalias_parametrable={};
for(i in alias_parametrable)
{
	nalias_parametrable[remplacerRegex(i)]=alias_parametrable[i];
}
alias_parametrable=nalias_parametrable;

function signalerFinEtat(nomEtat)
{
	return function()
	{
		console.log("J'ai atteint l'état "+nomEtat);
		bot.emit(nomEtat);
	};
}

// à faire plus tard si vraiment nécessaire/utile
// conditionsASurveiller={};
// 
// function surveiller()
// {
// 	for(i in conditionsASurveiller)
// 	{
// 		if(conditionsASurveiller[i]())
// 		{
// 			emit(i);
// 		}
// 	}
// }

function atteint(etat)
{
	return etat.action.c.apply(this,etat.action.p);
}

function appliquerAction(etat,nomEtat)
{
		return function()
		{
			var b;
			if((b=atteint(etat))!=null && b)
			{
 					console.log("fin:"+nomEtat);
					(signalerFinEtat(nomEtat))();
			}
			else
			{
 				console.log("action:"+nomEtat);
				var actione=etat.action.f.apply(this,etat.action.p);
				bot.once(actione,atteint(etat)===null ? signalerFinEtat(nomEtat) : appliquerAction(etat,nomEtat));
			}
			// comportement différent mais peut etre interessant :
// 			var actione=etat.action.f.apply(this,etat.action.p);
// 			bot.once(actione,signalerFinEtat(nomEtat));
		}
}

function nomToEtat(nomEtat)
{
	nomEtat=remplacerAlias(nomEtat);
	var v;
	var etat;
	for(rnomEtat in etats)
	{
		if((v=(new RegExp("^"+rnomEtat+"$")).exec(nomEtat))!=null)
		{
// 			v.push(v.input);
			v.shift();
			etat=ce.clone(etats[rnomEtat]);
			etat.action.p=etat.action.p != undefined ? etat.action.p.concat(v) : v
			break;
		}
	}
	for(rnomEtat in etats_generes)
	{
		if((v=(new RegExp("^"+rnomEtat+"$")).exec(nomEtat))!=null)
		{
// 			v.push(v.input);
			v.shift();
			etat=etats_generes[rnomEtat].apply(this,v);
			etat.action.p=etat.action.p != undefined ? etat.action.p.concat(v) : v // pb : clone : modification de l'objet dans etats ?
			break;
		}
	}
	return etat;
}

function atteindre(nomEtat)
{
	var etat=nomToEtat(nomEtat);
// 	nomEtat=remplacerAlias(nomEtat);//utile ?
	console.log("Je vais atteindre l'état "+nomEtat);
	var eIni=unique("demarrerAtteindre");
	var eFin=unique("finAtteindre");
	var listeNomsEtats=etat.deps!=undefined ? etat.deps : [];
	var letats=[];
	for(var i in listeNomsEtats)
	{
		letats[i]=nomToEtat(listeNomsEtats[i]);// est refait plusieurs fois, il vaudrait sans doute mieux le faire une fois pour toute qq part (peut etre meme que ca change le comportement dans certains cas)
	}
 	atteindreDependances(eIni,listeNomsEtats,letats,eFin);
	bot.once(eFin,appliquerAction(etat,nomEtat));
// 	console.log("j'émet "+eIni);
	bot.emit(eIni);
	
}

function atteindreDansAtteindreDependances(listeNomsEtats,i)
{
	return function(){atteindre(listeNomsEtats[i])};
}

function atteindreDependances(eIni,listeNomsEtats,letats,eFin)
{
	var e=eIni;
	var b;
// 	console.log(listeNomsEtats);
	var continuer=false;
	for(var i in listeNomsEtats)
	{
		b=atteint(letats[i]);
		if(b===null || !b)
		{
	// 		console.log(e+"-> atteindre "+listeNomsEtats[i]);
			bot.once(e,atteindreDansAtteindreDependances(listeNomsEtats,i));
			e=listeNomsEtats[i];
			if(b===null) letats[i].c=function() {return true;};// va pas marche car letats non transmis : le transmettre... // pb
			continuer=true;
		}
	}
	if(continuer)
	{
		bot.once(e,function(eIni,listeNomsEtats,letats,eFin) {return function(){var s=unique("atteindreDependance");atteindreDependances(s,listeNomsEtats,letats,eFin);bot.emit(s);};} (eIni,listeNomsEtats,letats,eFin));
	}
	else
	{
		bot.once(e,(function(eFin){return function() {bot.emit(eFin);};})(eFin));
	}
// 	console.log(e);
}

//reecriture (systeme suppose confluent et fortement terminal)
function remplacerAlias(message)
{
	var modifie=1;
	while(modifie)
	{
		modifie=0;
		for(var alia in alias)
		{
			var newM=message.replace(alia,alias[alia]);
			if(newM!=message)
			{
				message=newM;
				modifie=1;
			}
		}
		var v;
		for(var aliap in alias_parametrable)
		{
			if((v=(new RegExp(aliap)).exec(message))!=null)
			{
				v.push(v.input);
				var aRemplacer=v.shift();
				newM=message.replace(aRemplacer,alias_parametrable[aliap].apply(this,v));
				if(newM!=message)
				{
					message=newM;
					modifie=1;
				}
			}
		}
	}
	return message;
}


bot.on('chat', function(username, message) {
	message=remplacerAlias(message);
	for(nomEtat in etats)
	{
		if((new RegExp("^"+nomEtat+"$")).test(message))
		{
			atteindre(message);
			return;
		}		
	}
	for(nomEtat in etats_generes)
	{
		if((new RegExp("^"+nomEtat+"$")).test(message))
		{
			atteindre(message);
			return;
		}		
	}
});



bot.navigate.on('pathFound', function (path) {
  bot.chat("found path. I can get there in " + path.length + " moves.");
});
bot.navigate.on('cannotFind', function () {
  bot.chat("unable to find path");
});

	
bot.on('chat', function(username, message) {
	var target = bot.players[username].entity;
	if (message === 'come') {
		bot.navigate.to(target.position);
	} else if (message === 'stop') {
		bot.navigate.stop();
	}
	else if (message === 'pos') {
	bot.chat("I am at " + bot.entity.position + ", you are at " + bot.players[username].entity.position);
	} else if (message === 'spawn') {
	bot.chat("spawn is at " + bot.spawnPoint);
	} else if (message === 'quit') {
	bot.quit(username + "told me to");
	} else if (message === 'set') {
	bot.setSettings({viewDistance: 'normal'});
	} else if (message === 'block') {
	block = bot.blockAt(bot.players[username].entity.position.offset(0, -1, 0));
	bot.chat("block under you is " + block.displayName + " in the " + block.biome.name + " biome id"+block.type);
	}else if (message === 'blockup') {
	block = bot.blockAt(bot.players[username].entity.position.offset(0, +2, 0));
	bot.chat("block on you is " + block.displayName + " in the " + block.biome.name + " biome id"+block.type);
	} else if (message === 'blocksdown') {
	pos = bot.game.players[username].entity.position.clone();
	setInterval(function() {
		var block = bot.blockAt(pos);
		console.log("pos " + pos + ": " + block.displayName + ", " + block.biome.name);
		pos.translate(0, -1, 0);
	}, 500);
	}
});



bot.on('health', function() {
  console.log("I have " + bot.health + " health and " + bot.food + " food");
});

bot.on('playerJoined', function(player) {
  console.log("hello, " + player.username + "! welcome to the server.");
});
bot.on('playerLeft', function(player) {
  console.log("bye " + player.username);
});
bot.on('rain', function() {
  if (bot.isRaining) {
    bot.chat("it started raining");
  } else {
    bot.chat("it stopped raining.");
  }
});
bot.on('kicked', function(reason) {
  console.log("I got kicked for", reason, "lol");
});


bot.on('nonSpokenChat', function(message) {
  console.log("non spoken chat", message);
});
bot.on('spawnReset', function(message) {
  console.log("oh noez!! my bed is broken.");
});
// var map = {};
// bot.on('entitySwingArm', function(entity) {
//   map[entity.id] = map[entity.id] || 0;
//   map[entity.id] += 1;
//   console.log(entity.username + ", you've swung your arm " + map[entity.id] + "times.");
// });
// bot.on('entityHurt', function(entity) {
//   if (entity.type === 'mob') {
// //     console.log("Haha! The " + entity.mobType + " got hurt position "+entity.position);
//   } else if (entity.type === 'player') {
//     console.log("aww, poor " + entity.username + " got hurt. maybe you shouldn't have a ping of " + bot.players[entity.username].ping);
//   }
// });
// bot.on('entityWake', function(entity) {
//   bot.chat("top of the morning, " + entity.username);
// });
// bot.on('entitySleep', function(entity) {
//   bot.chat("good night, " + entity.username);
// });
// bot.on('entityEat', function(entity) {
//   console.log(entity.username + ": OM NOM NOM NOMONOM. that's what you sound like.");
// });
// bot.on('entityCrouch', function(entity) {
//   bot.chat(entity.username + ": you so sneaky.");
// });
// bot.on('entityUncrouch', function(entity) {
//   bot.chat(entity.username + ": welcome back from the land of hunchbacks.");
// });
// bot.on('entityEquipmentChange', function(entity) {
//   console.log("entityEquipmentChange", entity)
// });
// bot.on('entitySpawn', function(entity) {
//   if (entity.type === 'mob') {
//     bot.chat("look out - a " + entity.mobType + " spawned at " + entity.position);
//   } else if (entity.type === 'player') {
//     bot.chat("look who decided to show up: " + entity.username);
//   } else if (entity.type === 'object') {
//     bot.chat("there's a " + entity.objectType + " at " + entity.position);
//   }
// });
// bot.on('playerCollect', function(collector, collected) {
//   if (collector.type === 'player' && collected.type === 'object') {
//     bot.chat("I'm so jealous. " + collector.username + " collected " + collected.objectType);
//   }
// });
// bot.on('entityDetach', function(entity, vehicle) {
//   if (entity.type === 'player' && vehicle.type === 'object') {
//     bot.chat("lame - " + entity.username + " stopped riding the " + vehicle.objectType);
//   }
// });
// bot.on('entityAttach', function(entity, vehicle) {
//   if (entity.type === 'player' && vehicle.type === 'object') {
//     bot.chat("sweet - " + entity.username  + " is riding that " + vehicle.objectType);
//   }
// });
// bot.on('entityEffect', function(entity, effect) {
//   console.log("entityEffect", entity, effect);
// });
// bot.on('entityEffectEnd', function(entity, effect) {
//   console.log("entityEffectEnd", entity, effect);
// });
