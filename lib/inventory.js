// block types allowed to be used as scaffolding
var scaffoldBlockTypes = {
  3:  true, // dirt
  4:  true, // cobblestone
  87: true, // netherrack
};

var picks = {
  285: true, // gold
  270: true, // wood
  274: true, // stone
  257: true, // iron
  278: true, // diamond
};

var picksIronUp = {
  257: true, // iron
  278: true, // diamond
};

var picksStoneUp = {
  274: true, // stone
  257: true, // iron
  278: true, // diamond
};

var picksDiamond = {
  278: true, // diamond
};

var shovels = {
  256: true, // iron
  269: true, // wood
  273: true, // stone
  277: true, // diamond
  284: true, // gold
};

var axes = {
  258: true, // iron
  271: true, // wood
  275: true, // stone
  279: true, // diamond
  286: true, // gold
};

var toolsForBlock = {
  1: picks,     // stone
  2: shovels,   // grass
  3: shovels,   // dirt
  4: picks,     // cobblestone
  5: axes,      // wooden planks
  12: shovels,  // sand
  13: shovels,  // gravel
  14: picksIronUp, // gold ore
  15: picksStoneUp, // iron ore
  16: picksStoneUp, // coal ore
  17: axes,     // wood
  21: picksIronUp, // lapis lazuli ore
  22: picksIronUp, // lapis lazuli block
  23: picks,    // dispenser
  24: picks,    // sandstone
  25: axes,     // note block
  29: picks,    // sticky piston
  33: picks,    // piston
  41: picksStoneUp, // block of gold
  42: picksStoneUp, // block of iron
  43: picks,    // stone slab
  44: picks,    // stone slab
  45: picks,    // bricks
  48: picks,    // moss stone
  49: picksDiamond, // obsidian
  53: axes,     // oak wood stairs
  54: axes,     // chest
  56: picksIronUp, // diamond ore
  57: picksIronUp, // diamond block
  58: axes,     // crafting table
  60: shovels,  // farmland
  61: picks,    // furnace
  62: picks,    // furnace
  64: axes,     // wooden door
  67: picks,    // stone stairs
  70: axes,     // wooden pressure plate
  71: picksStoneUp, // iron door
  72: picks,    // stone pressure plate
  73: picksIronUp, // redstone ore
  78: shovels,  // snow
  80: shovels,  // snow block
  81: axes,     // cactus
  87: picks,    // netherrack
  88: shovels,  // soul sand
  89: picks,    // glowstone
  97: picks,    // monster stone egg
  98: picks,    // stone brick
  101: picks,   // iron bars
  108: picks,   // brick stairs
  110: shovels, // mycelium
  112: picks,   // nether brick
  113: picks,   // nether brick fence
  114: picks,   // nether brick stairs
  116: picksDiamond, // enchantment table
  125: axes,    // wood slab
  126: axes,    // wood slab
  128: picks,   // sandstone stairs
  129: picksIronUp, // emerald ore
  130: picksDiamond, // ender chest
  133: picksIronUp, // block of emerald
  134: axes, // spruce wood stairs
  135: axes, // birch wood stairs
  136: axes, // jungle wood stairs
  139: picks, // cobble wall
  145: picksIronUp, // anvil
};

function init(_bot)
{
	bot=_bot;
}

function toolToBreak(blockToBreak)
{
	// return true if we're already good to go
	var okTools = toolsForBlock[blockToBreak.id];
	if (!okTools) return true; // anything goes
	if (bot.heldItem && okTools[bot.heldItem.type]) return true;
	// see if we have the tool necessary in inventory
	var tools = bot.inventory.items().filter(function(item) {
	return okTools[item.type];
	});
	var tool = tools[0];
	if (!tool)
	{
		console.log("I don't have the tool to break "+blockToBreak.name);
		return null;
	}
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