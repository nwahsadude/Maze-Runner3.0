var Player = function(id, name, room, posX, posY, direction){
	var x = posX,
		y = posY,
		id = id,
		vX = 0,
		vY = 0,
		name = name, 
		direction = direction;

	var getX = function() { 
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	var getvX = function() { 
		return vX;
	};

	var getvY = function() {
		return vY;
	};

	var setvX = function(newvX) {
		vX = newvX;
	};

	var setvY = function(newvY) {
		vY = newvY;
	};

	var getDirection = function() {
		return direction;
	};

	var setDirection = function(newDirection){
		direction = newDirection;
	};

	return {
		getX:  getX,
		getY:  getY,
		setX:  setX,
		setY:  setY,
		getvX: getvX,
		getvY: getvY,
		setvX: setvX,
		setvY: setvY,
		id:    id,
		name:  name,
		room:  room,
		getDirection: getDirection,
		setDirection: setDirection
	};
};

exports.Player = Player;