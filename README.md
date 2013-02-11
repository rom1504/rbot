#rbot
A bot based on mineflayer which can execute task with dependancies

[Youtube Demo of repeat spiral down](http://www.youtube.com/watch?v=UM1ZV5200S0)

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
 
### Roadmap

 * Doing more complicated things :
  * crafting things
  * getting anywhere even if it's hard
  * building things
 * Integrate other mineflayer functionnality : 
  * crafting
  * using chests, dispensers and enchantment tables
  * use vehicle
  * activate block
 * React to the world : for example if a mob attack the bot, the bot should defend itself
 * Improve/simplify the code

## Installation

First, you need to install [node](http://nodejs.org/)

### Linux / OSX

 * `npm install -g rbot`
 
### Windows

 * Follow the Windows instructions from [Obvious/ursa](https://github.com/Obvious/ursa)
 * `npm install -g rbot`

If you download the source via github, you can just run `npm install`


## Usage
 * If you specify a master the bot will only obey to him
 * `rbot <host> <port> <name> <password> [<master>]`


### Commands
 * `dig <position>`
 * `move <position>`
 * `x+` `x-` `z+` `z-`
 * `dig forward <position>` : dig the two block in front of the bot then move, works if there is gravel that fall
 * `repeat <action> done` for example :
  * `repeat dig forward <position> done`
 * `do <action1> then <action2> done` : do first action then do the second one, for example :
  * `do x+ then z+ done`
 * `look for entity <entity>`
 * `look for block <block>`
 * `stop repeat <action> done`
 * `pos <player>` : say the position of the other player if he is not too far away
 * `move to <position>` : use mineflayer-navigate to get to <position>
 * `stop move to`
 * `spiral up` : dig an ascending spiral staircase
 * `spiral down` : dig a descending spiral staircase
 * `equip <emplacement> <item>` : equip item at emplacement (for example hand)
 * `unequip <emplacament>` : doesn't work yet
 * `toss <number> <item>`
 * `list` : list all items of the bot
 * `attack <entity>`
 * `say <message>.`
 * `activate item`
 * `deactivate item`
 * `wait <milliseconds>`
 * `raise chicken` : get an egg then throw it
 * `stop raise chicken`
 * `look at <position>`
 * `shoot <position>` : if it has a bow and arrows, shoot <position>
 * `follow <position>` : go to `<position>` every 2 sec
 * `get <nameBlock>` : go to a position next to nearest `<nameBlock>` then dig it
 * `build <position>` : build at position with the equipped block
 * `build shelter` : build a very simple shelter with the equipped block (need 25 blocks)
 * `destroy shelter` : destroy this shelter
 * `craft <number> <item>` : will craft this item if you have the required items : doesn't work yet
 
 * `come` : `move to me`
 * `attack everymob` : 

### Parameters
 * `<position>` can be :
  * `rx,y,z` : relative position
  * `x,y,z` : absolute position
  * `entity <entity>`
  * `block <block>`
  * `nearest reachable position <position>`
 * `<block>` can be :
  * `nearest block <nameBlock>`
  * `nearest block *: any nearest block`
 * `<entity>` can be :
  * `nearest mob <mob>`
  * `nearest mob *` : any nearest mob
  * `nearest reachable mob <mob>`
  * `nearest reachable mob *` : any nearest reachable mob
  * `nearest object <object>`
  * `nearest object *` : any nearest object
  * `nearest reachable object <object>`
  * `nearest reachable object *` : any nearest reachable object
  * `me`
  * `player <playerName>`
 * `<mob>` can be :
  * `spider`
  * `enderman`
  * `creeper`
  * ...

### Interesting use of commands
 * `repeat spiral down done` : build a spiral staircase from y=64 to y=0
 * `repeat attack nearest reachable mob done` : attack mobs close from the mob
 * `repeat dig forward r0,0,1 done` : if you want to build a tunnel (not stopped by gravel, but can die from drowning)
 * `move to entity me`
 * `repeat do raise chicken then wait 1000 done done`
 * `stop repeat do raise chicken then wait 1000 done done`
 * `repeat look at me done`
 * `repeat shoot nearest reachable mob done` : kill close mobs
 * `repeat shoot me done` : kill you
 * `move to nearest reachable position block nearest block log`
 * `follow me`
 * `stop follow me`
 * `get log`
 * `do repeat build shelter then destroy shelter done` : fun
