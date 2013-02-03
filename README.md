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
 * node index.js &lsaquo;host&rsaquo; &lsaquo;port&rsaquo; &lsaquo;name&rsaquo; &lsaquo;password&rsaquo; [&lsaquo;master&rsaquo;]


Commands :
 * dig &lsaquo;position&rsaquo;
 * move &lsaquo;position&rsaquo;
 * x+ x- z+ z-
 * dig forward &lsaquo;position&rsaquo; : dig the two block in front of the bot then move, works if there is gravel that fall
 * repeat &lsaquo;action&rsaquo; for example :
  * repeat dig forward &lsaquo;position&rsaquo;
 * &lsaquo;action1&rsaquo; then &lsaquo;action2&rsaquo; : do first action then do the second one, for example :
  * x+ then z+
 * look for mob &lsaquo;mob&rsaquo;
 * look for mob
 * stop repeat &lsaquo;action&rsaquo;
 * pos &lsaquo;player&rsaquo; : say the position of the other player if he is not too far away
 * move to &lsaquo;position&rsaquo; : use mineflayer-navigate to get to &lsaquo;position&rsaquo;
 * spiral up : dig an ascending spiral staircase
 * spiral down : dig a descending spiral staircase
 * equip &lsaquo;emplacement&rsaquo; &lsaquo;item&rsaquo; : equip item at emplacement (for example hand)
 * toss &lsaquo;item&rsaquo;
 * list : list all items of the bot
 * attack &lsaquo;entity&rsaquo;
 * say &lsaquo;message&rsaquo;

Parameters :
 * &lsaquo;position&rsaquo; can be :
  * rx,y,z : relative position
  * x,y,z : absolute position
  * &lsaquo;entity&rsaquo;
 * &lsaquo;mob&rsaquo; can be :
  * spider
  * enderman
  * creeper
  * ...
 * &lsaquo;entity&rsaquo; can be :
  * nearest mob &lsaquo;mob&rsaquo;
  * nearest mob : any nearest mob
  * nearest mob reachable &lsaquo;mob&rsaquo;
  * nearest mob reachable : any nearest reachable mob
  * me
  * player &lsaquo;playerName&rsaquo;

Interesting use of commands :
 * repeat spiral down : build a spiral staircase from y=64 to y=0
 * repeat attack nearest reachable mob : attack mobs close from the mob
 * repeat dig forward r0,0,1 : if you want to build a tunnel (not stopped by gravel, but can die from drowning)
 * move to me
