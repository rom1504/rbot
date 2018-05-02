// block types allowed to be used as scaffolding
const scaffoldBlockTypes = {
	1: true, // stone
  3:  true, // dirt
  4:  true, // cobblestone
  87: true // netherrack
};

let materials;
let bot;
const assert = require('assert');

function init(_bot,_materials)
{
	bot=_bot;
	materials=_materials;
}

function canHarvest(block) {
    const okTools = block.harvestTools;
    if (!okTools) return true;
    if (bot.heldItem && okTools[bot.heldItem.type]) return true;
    // see if we have the tool necessary in inventory
    const tools = bot.inventory.items().filter(function(item) {
      return okTools[item.type];
    });
    const tool = tools[0];
    return !!tool;
  }

function toolToBreak(blockToBreak)
{
	if (!canHarvest(blockToBreak))
	{
		console.log("I don't have the tool to break "+blockToBreak.name);
		return null;
	}
  const material = blockToBreak.material;
	if (! material) return true;
  const toolMultipliers = materials[material];
  assert.ok(toolMultipliers);
  const tools = bot.inventory.items().filter(function(item) {
    return toolMultipliers[item.type] != null;
  });
  tools.sort(function(a, b) {
    return toolMultipliers[b.type] - toolMultipliers[a.type];
  });
  const tool = tools[0];
  if (!tool) return true;
  if (bot.heldItem && bot.heldItem.type === tool.type) return true;
	return tool;
}

function itemToBuild()
{
	// return true if we're already good to go
	if (bot.heldItem && scaffoldBlockTypes[bot.heldItem.type]) return true;
  const scaffoldingItems = bot.inventory.items().filter(function(item) {
	return scaffoldBlockTypes[item.type];
	});
  const item = scaffoldingItems[0];
	if (!item)
	{
		console.log("I don't have any block to build");
		return null;
	}
	return item;
}


function numberOfOwnedItems(name)
{
  const items=bot.inventory.items();
	let c=0;
	for(i in items)
	{
		if(items[i].name===name) c+=items[i].count;
	}
	return c;
}

function myItems()
{
  const items={};
	bot.inventory.items().forEach(function(item) {
		if(items[item.name]===undefined) items[item.name]=0;
		items[item.name]+=item.count;
	});
  const nitems=[];
	for(let i in items)
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