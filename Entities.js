/**
 * Created by Shawn on 3/12/2015.
 */
var HealthEntity = function(Pos){
    var id,
        pos;

    id = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    pos = Pos;

    return {
        id: id,
        pos: pos
    };
};

exports.HealthEntity = HealthEntity;