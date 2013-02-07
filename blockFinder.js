var mf = require('mineflayer');

var blockdb = mf.blocks;

module.exports.inject = inject;

function inject(bot) {

    var unit = [
        new mf.vec3(-1,  0,  0),
        new mf.vec3( 1,  0,  0),
        new mf.vec3( 0,  1,  0),
        new mf.vec3( 0, -1,  0),
        new mf.vec3( 0,  0,  1),
        new mf.vec3( 0,  0, -1),
    ];

    var zeroed = [
        new mf.vec3(0, 1, 1),
        new mf.vec3(0, 1, 1),
        new mf.vec3(1, 0, 1),
        new mf.vec3(1, 0, 1),
        new mf.vec3(1, 1, 0),
        new mf.vec3(1, 1, 0),
    ];

    bot.findBlock = findBlock;


    function findBlock(point, matching, radius, count) {
        var max_apothem = (radius == null) ? 64 : radius;
        if (count == null) {
            count = 1;
        }
        var predicate;
        if (typeof(matching) === 'number') {
            predicate = function(block) {
                if (block == null) {
                    return false;
                }
                return matching === block.type;
            }
        } else if (typeof(matching) === 'function') {
            predicate = matching;
        } else if (matching.length != null && matching.length > 0) {
            // Assuming list
            var matching_set = {};
            for (var i = 0; i < matching.length; i++) {
                matching_set[matching[i]] = 1;
            }
            predicate = function(block) {
                if (block == null) {
                    return false;
                }
                return matching_set[block.type] === 1;
            }
        } else {
            console.log('Block Finder: Unknown value for matching: ' + matching);
            return [];
        }

        var result = [];
        if (predicate(bot.blockAt(point))) {
            result.push(point);
            if (count <= 1) {
                return result;
            }
        }

        var pt = new mf.vec3(0, 0, 0);
        for (var apothem = 1; apothem <= max_apothem; apothem++) {
            for (var side = 0; side < 6; side++) {
                var max = zeroed[side].scaled(2 * apothem);
                if (max.y > 127) {
                    max.y = 127;
                } else if (max.y < 0) {
                    max.y = 0;
                }
                for (pt.x = 0; pt.x <= max.x; pt.x++) {
                    for (pt.y = 0; pt.y <= max.y; pt.y++) {
                        for (pt.z = 0; pt.z <= max.z; pt.z++) {
                            var offset = pt.minus(max.scaled(0.5).floored()).plus(unit[side].scaled(apothem));
                            var abs_coords = point.plus(offset);
                            if (predicate(bot.blockAt(abs_coords))) {
                                result.push(abs_coords);
                                if (result.length >= count) {
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
}

