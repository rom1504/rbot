// block types allowed to be used as scaffolding
var scaffoldBlockTypes = {
	1: true, // stone
  3:  true, // dirt
  4:  true, // cobblestone
  87: true // netherrack
};

var materials,assert = require('assert');

function init(_bot,_materials)
{
	bot=_bot;
	materials=_materials;
}

function canHarvest(block) {
    var okTools = block.harvestTools;
    if (!okTools) return true;
    if (bot.heldItem && okTools[bot.heldItem.type]) return true;
    // see if we have the tool necessary in inventory
    var tools = bot.inventory.items().filter(function(item) {
      return okTools[item.type];
    });
    var tool = tools[0];
    return !!tool;
  }

function toolToBreak(blockToBreak)
{
	if (!canHarvest(blockToBreak))
	{
		console.log("I don't have the tool to break "+blockToBreak.name);
		return null;
	}
	var material = blockToBreak.material;
    if (! material) return true;
    var toolMultipliers = materials[material];
    assert.ok(toolMultipliers);
    var tools = bot.inventory.items().filter(function(item) {
      return toolMultipliers[item.type] != null;
    });
    tools.sort(function(a, b) {
      return toolMultipliers[b.type] - toolMultipliers[a.type];
    });
    var tool = tools[0];
    if (!tool) return true;
    if (bot.heldItem && bot.heldItem.type === tool.type) return true;
	return tool;
}

function itemToBuild()
{
	// return true if we're already good to go
	if (bot.heldItem && scaffoldBlockTypes[bot.heldItem.type]) return true;
	var scaffoldingItems = bot.inventory.items().filter(function(item) {
	return scaffoldBlockTypes[item.type];
	});
	var item = scaffoldingItems[0];
	if (!item)
	{
		console.log("I don't have any block to build");
		return null;
	}
	return item;
}


function numberOfOwnedItems(name)
{
	var items=bot.inventory.items();
	var c=0;
	for(i in items)
	{
		if(items[i].name===name) c+=items[i].count;
	}
	return c;
}

function myItems()
{
	var items={};
	bot.inventory.items().forEach(function(item) {
		if(items[item.name]===undefined) items[item.name]=0;
		items[item.name]+=item.count;
	});
	var nitems=[];
	for(var i in items)
	{
		nitems.push([i,items[i]]);
	}
	return nitems;
}

module.exports={
	toolToBreak:toolToBreak,
	itemToBuild:itemToBuild,
	numberOfOwnedItems:numberOfOwnedItems,
	myItems:myItems,
	init:init
};