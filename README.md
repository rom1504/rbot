#rbot
A bot based on mineflayer which can execute task with dependancies

## Features
 * basic mecanism to handle task and dependancies
 * a few task : dig, move, repeat, sequence
 * integration of mineflayer-navigate which can make the bot go to any position not too far away
 * building a spiral staircase
 
### Roadmap

 * Doing more complicated things : getting any block, crafting things, getting anywhere by digging
 * Integrate other mineflayer functionnality : inventory, building
 * Improve/simplify the code
 
## Usage
	node index.js host port name password
 Commands :
 * dig r0,0,1
 * move r0,0,1
 * x+ x- z+ z-
 * dig forward r0,0,1 : dig the two block in front of you then move, works if there is gravel that fall
 * repeat <action> for example :
  * repeat dig forward r0,0,1
 * <action1> then <action2> : do first action then do the second one, for example :
  * x+ then z+
 * look for mob <mob>
 * stop repeat <action>
 * pos <player> : say the position of the other player if he is not too far away
 * move to me : make the bot come to you
 * move to position : use mineflayer-navigate to get to the position
 * spiral up : build an ascending spiral staircase
 * spiral down : build a descending spiral staircase