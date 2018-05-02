const Vec3 = require('vec3').Vec3;

let bot,stringTo,findItemType,inventory;

function init(_bot,_stringTo,_findItemType,_inventory)
{
	bot=_bot;
	stringTo=_stringTo;
	findItemType=_findItemType;
	inventory=_inventory;
}


function listInventory(done)
{
	const output=inventory.myItems().map(function(a){return a[0]+":"+a[1];}).join(", ");
	if (output) {
		bot.chat(output);
	} else {
		bot.chat("empty inventory");
	}
	done();
}



function toss(number,itemName,done)
{
	const item=findItemType(itemName);
	if(item) bot.toss(item.id,null,number,function(){done()});
	else
	{
		console.log("I have no " + itemName);// change this maybe
		done();
	}
}


function equip(destination,item,done)
{
	if (item!=null && item!==true)
	{
		bot.equip(item, destination, function(err) 
		{
			if (err)
			{
				console.log("unable to equip " + item.name);
				//console.log(err.stack);
				setTimeout(function(){done(false);},200);
			}
			else
			{
				console.log("equipped " + item.name);
				setTimeout(done,200);
			}
		});
	}
	else if(item==null)
	{
		console.log("I have no such item");// change this maybe : yes : it should be fixed by : either it's a block you can break by hand, either go get a block... (and if it's to build : careful you might die... : figure a way out)
		done();
	}
	else if(item===true) // already equipped
	{
		done();
	}	
}


function unequip(destination,done)
{
	bot.unequip(destination);
	done();
}

function findCraftingTable()
{
	const cursor = new Vec3();
	for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++)
	{
		for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++)
		{
			for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++)
			{
				const block = bot.blockAt(cursor);
				if (block.type === 58) return block;
			}
		}
	}
}

function craft(amount,name,done)
{
	const item=findItemType(name);
	const craftingTable=findCraftingTable();
	const wbText = craftingTable ? "with a crafting table, " : "without a crafting table, ";
	if (item == null)
	{
		bot.chat(wbText + "unknown item: " + name);
		done(true);
	}
	else
	{
		const recipes = bot.recipesFor(item.id, null, amount, craftingTable);
		if (recipes.length)
		{
			bot.chat(wbText + "I can make " + item.name);
			const numberOfOperation=Math.ceil(amount/recipes[0].result.count);
			const newAmount=numberOfOperation*recipes[0].result.count;
			bot.craft(recipes[0], numberOfOperation, craftingTable, function(err)
			{
				if (err)
				{
					bot.chat("error making " + item.name);
					console.error(err.stack);
					setTimeout(done,5000);
				}
				else
				{	
					bot.chat("made " + newAmount + " " + item.name);
					done();
				}
			});
		}
		else
		{
			bot.chat(wbText + "I can't make " + item.name);
			done();
		}
	}
}



function activateItem(done)
{
	bot.activateItem();
	done();
}

function deactivateItem(done)
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
};