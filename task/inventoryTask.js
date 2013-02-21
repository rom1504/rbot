var bot,stringTo,findItemType,inventory;

function init(_bot,_stringTo,_findItemType,_inventory)
{
	bot=_bot;
	stringTo=_stringTo;
	findItemType=_findItemType;
	inventory=_inventory;
}


function listInventory(u,done)
{
	var output=inventory.myItems().map(function(a){return a[0]+":"+a[1];}).join(", ");
	if (output) {
		bot.chat(output);
	} else {
		bot.chat("empty inventory");
	}
	done();
}



function toss(number,itemName,u,done)
{
	var item=stringTo.stringToItem(itemName);
	if(item) bot.toss(item.type,null,parseInt(number),function(){done()});
	else
	{
		console.log("I have no " + itemName);// change this maybe
		done();
	}
}


function equip(destination,itemName,u,done)
{
	var item = stringTo.stringToItem(itemName);
	if (item)
	{
		bot.equip(item, destination, function(err) 
		{
			if (err)
			{
				console.log("unable to equip " + item.name);
				console.log(err.stack);
			}
			else
			{
				console.log("equipped " + item.name);
				
			}
			done();
		});
	}
	else
	{
		console.log("I have no " + itemName);// change this maybe
		done();
	}
	
}


function unequip(s,u,done)
{
	bot.unequip(s);
	done();
}

function findCraftingTable()
{
	var cursor = new vec3();
	for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++)
	{
		for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++)
		{
			for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++)
			{
				var block = bot.blockAt(cursor);
				if (block.type === 58) return block;
			}
		}
	}
}

function craft(amount,name,u,done)
{
	amount=parseInt(amount);
	var item=findItemType(name);
	var craftingTable=findCraftingTable();
	var wbText = craftingTable ? "with a crafting table, " : "without a crafting table, ";
	if (item == null)
	{
		bot.chat(wbText + "unknown item: " + name);
		done(true);
	}
	else
	{
		var recipes = bot.recipesFor(item.id, null, amount, craftingTable);
		if (recipes.length)
		{
			bot.chat(wbText + "I can make " + item.name);
			var numberOfOperation=Math.ceil(amount/recipes[0].count);
			var newAmount=numberOfOperation*recipes[0].count;
			bot.craft(recipes[0], numberOfOperation, craftingTable, function(err)
			{
				if (err)
				{
					bot.chat("error making " + item.name);
					console.error(err.stack);
					done(true);
				}
				else
				{	
					bot.chat("made " + newAmount + " " + item.name);
					setTimeout(done,5000);
				}
			});
		}
		else
		{
			bot.chat(wbText + "I can't make " + item.name);
			done(true);
		}
	}
}



function activateItem(u,done)
{
	bot.activateItem();
	done();
}

function deactivateItem(u,done)
{
	bot.deactivateItem();
	done();
}

module.exports={
	listInventory:listInventory,
	toss:toss,
	equip:equip,
	unequip:unequip,
	craft:craft,
	activateItem:activateItem,
	deactivateItem:deactivateItem,
	init:init
}