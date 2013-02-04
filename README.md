#rbot
A bot based on mineflayer which can execute task with dependancies

[Youtube Demo of repeat spiral down](http://www.youtube.com/watch?v=UM1ZV5200S0)

## Features
 * basic mecanism to handle task and dependancies
 * a few task : dig, move, repeat, sequence
 * integration of mineflayer-navigate which can make the bot go to any position not too far away
 * dig a spiral staircase
 * inventory management : equip,toss,list
 * attack
 
### Roadmap

 * Doing more complicated things : getting any block, crafting things, getting anywhere by digging
 * Integrate other mineflayer functionnality : building, crafting
 * Improve/simplify the code
 
## Usage
 * If you specify a master the bot will only obey to him
 * `node rbot.js <host> <port> <name> <password> [<master>]`


### Commands
 * `dig <position>`
 * `move <position>`
 * `x+` `x-` `z+` `z-`
 * `dig forward <position>` : dig the two block in front of the bot then move, works if there is gravel that fall
 * `repeat <action>` for example :
  * `repeat dig forward <position>`
 * `<action1> then <action2>` : do first action then do the second one, for example :
  * `x+ then z+`
 * `look for entity <entity>`
 * `stop repeat <action>`
 * `pos <player>` : say the position of the other player if he is not too far away
 * `move to <position>` : use mineflayer-navigate to get to <position>
 * `stop move to`
 * `spiral up` : dig an ascending spiral staircase
 * `spiral down` : dig a descending spiral staircase
 * `equip <emplacement> <item>` : equip item at emplacement (for example hand)
 * `toss <item>`
 * `list` : list all items of the bot
 * `attack <entity>`
 * `say <message>`
 * `activate item`
 * `deactivate item`
 * `wait <milliseconds>`
 * `raise chicken` : get an egg then throw it then wait 1 sec then do this again
 * `stop raise chicken`
 * `look at <position>`
 * `shoot <position>` : if it has a bow and arrows, shoot <position>

### Parameters
 * `<position>` can be :
  * `rx,y,z` : relative position
  * `x,y,z` : absolute position
  * `<entity>`
 * `<entity>` can be :
  * `nearest mob <mob>`
  * `nearest mob : any nearest mob`
  * `nearest mob reachable <mob>`
  * `nearest mob reachable` : any nearest reachable mob
  * `nearest object <object>`
  * `nearest object : any nearest object`
  * `nearest object reachable <object>`
  * `nearest object reachable` : any nearest reachable object
  * `me`
  * `player <playerName>`
 * `<mob>` can be :
  * `spider`
  * `enderman`
  * `creeper`
  * ...

### Interesting use of commands
 * `repeat spiral down` : build a spiral staircase from y=64 to y=0
 * `repeat attack nearest reachable mob` : attack mobs close from the mob
 * `repeat dig forward r0,0,1` : if you want to build a tunnel (not stopped by gravel, but can die from drowning)
 * `move to me`
 * `raise chicken`
 * `stop raise chicken`
 * `repeat look at me`
 * `repeat shoot nearest reachable mob` : kill close mobs
 * `repeat shoot me` : kill you
