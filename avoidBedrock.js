var aStar = require('a-star');

module.exports = init;

// instantiated from init
var vec3;

var MONITOR_INTERVAL = 40;
var WATER_THRESHOLD = 20;
var DEFAULT_TIMEOUT = 10 * 1000; // 10 seconds
var DEFAULT_END_RADIUS = 0.1;

// if the distance is more than this number, navigator will opt to simply
// head in the correct direction and recalculate upon getting closer
var TOO_FAR_THRESHOLD = 150;

function init(mineflayer) {
  vec3 = require('vec3');
  return inject;
}

function inject(bot) {
  bot.navigate2 = {};
  bot.navigate2.findPathSync = findPathSync;

  bot.navigate2.blocksToAvoid = {
    7: true, // bedrock
  };

  function findPathSync(end, params) {
    params = params || {};
    end = end.floored()

    var timeout = params.timeout == null ? DEFAULT_TIMEOUT : params.timeout;
    var endRadius = params.endRadius == null ? DEFAULT_END_RADIUS : params.endRadius;
    var tooFarThreshold = params.tooFarThreshold == null ? TOO_FAR_THRESHOLD : params.tooFarThreshold;
    var actualIsEnd = params.isEnd || createIsEndWithRadius(end, endRadius);
    var heuristic = createHeuristicFn(end);

    var start = bot.entity.position.floored();
	console.log(start);
    var tooFar = false;
    if (start.distanceTo(end) > tooFarThreshold) {
      // Too far to calculate reliably. Return 'tooFar' and a path to walk
      // in the general direction of end.
      actualIsEnd = function(node) {
        // let's just go 100 meters
        return start.distanceTo(node.point) >= 100;
      };
      tooFar = true;
    }

    // search
    var results = aStar({
      start: new Node(start, 0),
      isEnd: actualIsEnd,
      neighbor: getNeighbors,
      distance: distanceFunc,
      heuristic: heuristic,
      timeout: timeout,
    });
    results.status = tooFar ? 'tooFar' : results.status;
    results.path = results.path.map(nodeCenterOffset);
    return results;
  }

  function getNeighbors(node)
  {
	var p=node.point;
	var result=[];
	if(risSafe(p,0,-1,0)) result.push(p.offset(0,-1,0));
	if(risSafe(p,0,2,0)) result.push(p.offset(0,1,0));
	if(risSafe(p,1,0,0) && risSafe(p,1,1,0)) result.push(p.offset(1,0,0));
	if(risSafe(p,-1,0,0) && risSafe(p,-1,1,0)) result.push(p.offset(-1,0,0));
	if(risSafe(p,0,0,1) && risSafe(p,0,1,1)) result.push(p.offset(0,0,1));
	if(risSafe(p,0,0,-1) && risSafe(p,0,1,-1)) result.push(p.offset(0,0,-1));
	return result.map(function(point) {return new Node(point);});
  }
	function risSafe(p,x,y,z)
	{
		return isSafe(bot.blockAt(p.offset(x,y,z)))
	}
  function isSafe(block) {
    return !bot.navigate2.blocksToAvoid[block.type];
  }

}

function createIsEndWithRadius(end, radius) {
  return function(node) {
    return node.point.distanceTo(end) <= radius;
  };
}

function distanceFunc(nodeA, nodeB) {
  return nodeA.point.distanceTo(nodeB.point);
}

function nodeCenterOffset(node) {
  return node.point.offset(0.5, 0, 0.5);
}

function Node(point) {
  this.point = point;
}
Node.prototype.toString = function() {
  // must declare a toString so that A* works.
  return this.point.toString();
};

function createHeuristicFn(end) {
  return function(node) {
    return node.point.distanceTo(end);
  };
}

function noop() {}
