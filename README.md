#rbot
A bot based on mineflayer which can execute task with dependancies

## Features
 * basic mecanism to handle task and dependancies
 * a few task : dig, move, repeat, sequence
 * integration of mineflayer-navigate which can make the bot go to any position not too far away
 
### Roadmap

 * Doing more complicated things (building a spiral staircase for example)
 * Integrate other mineflayer functionnality (inventory for example)
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
 * come : make the bot come to you