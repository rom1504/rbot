# rbot

[![NPM version](https://badge.fury.io/js/rbot.png)](http://badge.fury.io/js/rbot)

A minecraft bot that can do many things.

Supports minecraft 1.11.2

Youtube demos :
 * [repeat spiral down](http://www.youtube.com/watch?v=UM1ZV5200S0)
 * [watch,stop watch,replicate](http://www.youtube.com/watch?v=0cQxg9uDnzA)

## Features
 * dig
 * move to any not too far away position thanks to mineflayer-navigate
 * repeat
 * sequence
 * dig a spiral staircase
 * inventory management : equip,toss,list
 * attack : mobs, players
 * build
 * find and get a block
 * activate an item (shoot and arrow for example)
 * follow 
 * build a shelter
 * dig a tunnel
 * raise chicken
 * move by building and digging
 * building things : watch then replicate
 * craft
 
### Roadmap

 * Doing more complicated things :
  * crafting things : get or craft the needed items
  * getting anywhere even if it's hard (lava, water)
  * building more things
 * Integrate other mineflayer functionnality : 
  * using chests, dispensers and enchantment tables
  * use vehicle
  * activate block
 * React to the world : for example if a mob attack the bot, the bot should defend itself
 * Improve/simplify the code

## Installation

First, you need to install [node](http://nodejs.org/) , you might want to read [this](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

 * `npm install -g rbot`
 
 or 
 
 * git clone https://github.com/rom1504/rbot.git
 * cd rbot
 * npm install


## Usage
 * If you specify a master the bot will only obey to him
 * `rbot <host> <port> <name> <password> [<master>]`
 
 If you cloned the repo, run `node rbot.js` instead.


### Commands
#### Syntax
 * `repeat <action> done`
 * `stop repeat <action> done`
 * `do <action1> then <action2> done` : do first action then do the second one
 * `if <condition> do <task> done`
 * `if <condition> do <task1> else <task2> done`
 * `repeat <task> until <condition> done`


#### Base commands
 * `dig <position>`
 * `move <position>`
 * `look for <entity>`
 * `look for <block>`
 * `pos <player>` : say the position of the other player if he is not too far away
 * `move to <position>` : use mineflayer-navigate to get to `<position>`
 * `stop move to`
 * `equip <emplacement> <item>` : equip item at emplacement (for example hand)
 * `unequip <emplacement>`
 * `toss <number> <nameItem>`
 * `toss everything`
 * `list` : list all items of the bot
 * `attack <entity>`
 * `say <message>.`
 * `activate item`
 * `deactivate item`
 * `wait <milliseconds>`
 * `stop raise chicken`
 * `look at <position>`
 * `build <position>` : build at position with the equipped block
 * `craft <number> <nameItem>` : will craft this item if you have the required items
 * `up` : jump and build under the bot (but doesn't dig the bot above the bot unlike sup)
 * `jump`
 * `nothing`
 * `watch <entity>` : start watching what `<entity>` is building and digging
 * `stop watch` : stop watching and save what has been done
 * `replicate` : redo the building and digging that has just been done (the position of the action are calculated from the position of the bot)
 
 
#### Alias
 * `x+` `x-` `z+` `z-`
 * `dig forward <position>` : dig the two block in front of the bot then move, works if there is gravel that fall
 * `spiral up` : dig an ascending spiral staircase
 * `spiral down` : dig a descending spiral staircase
 * `raise chicken` : get an egg then throw it
 * `shoot <entity>` : if it has a bow and arrows, shoot `<entity>`
 * `follow <position>` : go to `<position>` every 2 sec
 * `get <nameBlock>` : go to a position next to nearest `<nameBlock>` then dig it
 * `build shelter` : build a very simple shelter with the equipped block (need 25 blocks)
 * `destroy shelter` : destroy this shelter
 * `come` : `move to me`
 * `attack everymob` : kill any close mob
 * `scome` : move to you by digging and building
 * `down` : move down of one block
 * `sup` : move up of one block
 * `sget <blockName>` : get a block by building and digging
 * `smove <position>` : `repeat ssumove <position> until at <position> done` : if the position is too far ssumove can't calculate it because it doesn't know the blocks that far
 * `ssumove <position>` : get to the position by building and digging using a-star to avoid bedrock
 * `sumove <position>` : move of 1 in the direction of the position by building and digging
 * `immure <position>`
 * `cget <number> <nameItem>` : get the item using sget and craft commands
 * `give <position> <number> <item>`
 * `give <position> everything`
 * `sdig <position>` : repeat ssdig until it's done
 * `ssdig <position>` : dig safely
 * `achieve <condition>` : achieve `<condition>` using the related action
 


### Parameters
 * `<item>` can be :
  * `item to build`
  * `tool to break <nameBlock>`
  * `<nameItem>`
 * `<position>` can be :
  * `rx,y,z` : relative position
  * `<absolute position>`
  * `rx,y,z+<absolute position>`
  * `nearest reachable position <position>`
 * `<absolute position>` can be :
  * `x,y,z` : absolute position
  * `adapted <entity>` : adapted position for shooting with a bow
  * `<entity>`
  * `<block>`
 * `<block>` can be :
  * `nearest block <nameBlock>`
  * `nearest block *: any nearest block`
 * `<entity>` can be :
  * `nearest mob <mob>`
  * `nearest mob *` : any nearest mob
  * `nearest visible mob <mob>`
  * `nearest visible mob *` : any nearest visible mob
  * `nearest reachable mob <mob>`
  * `nearest reachable mob *` : any nearest reachable mob
  * `nearest object <object>`
  * `nearest object *` : any nearest object
  * `nearest reachable object <object>`
  * `nearest reachable object *` : any nearest reachable object
  * `me`
  * `bot`
  * `player <playerName>`
 * `<mob>` can be :
  * `spider`
  * `enderman`
  * `creeper`
  * ...
 * `<condition>` can be :
  * `at <position>`
  * `have <number> <nameItem>`
  * `close of <blockName>`
  * `<position> is empty`
  * `<position> is not empty`

### Interesting use of commands
 * `repeat spiral down done` : build a spiral staircase from y=64 to y=0
 * `attack everymob` : attack mobs close from the mob
 * `repeat dig forward r0,0,1 done` : if you want to build a tunnel (not stopped by gravel, but can die from drowning)
 * `come`
 * `scome`
 * `repeat do raise chicken then wait 1000 done done`
 * `stop repeat do raise chicken then wait 1000 done done`
 * `repeat look at me done`
 * `repeat shoot nearest reachable mob done` : kill close mobs
 * `repeat shoot me done` : kill you
 * `move to nearest reachable position nearest block log`
 * `follow me`
 * `stop follow me`
 * `get log`
 * `repeat do build shelter then destroy shelter done done` : fun
