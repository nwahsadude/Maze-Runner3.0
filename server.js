var http = require('http'),
	path = require('path'),
	isProduction = (process.env.NODE_ENV === 'production'),
	port = isProduction ? 80 : process.env.PORT || 8000,
    //port = 80,
	express = require('express'),
	app = express(),
	socketio = require('socket.io'),
	Player = require('./Player').Player,
    HealthEntity = require('./Entities').HealthEntity;

app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
	res.render('index');
});

app.get('/game', function(req, res){
	res.render('game');
});

app.get('/credits', function(req, res){
    res.render('credits');
});

var server = http.createServer(app),
	io = socketio.listen(server);
var	players,
    healthEntities,
    healthEntitiesAmount = 6;

function init(){
	players = [];
    healthEntities = [];
	highScores = {};
    HEP();
}

function playerById(id){
	for (var i = 0; i < players.length; i++){
		if (players[i].id === id){
			return players[i];
		}
	}
	return false;
}

//TODO change this proper entity search
function entityById(id){
	for (var i = 0; i < healthEntities.length; i++){
		if (healthEntities[i].id === id){
			return healthEntities[i];
		}
	}
	return false;
}

function HEP() {
    var healthEntityPos = [
        {x: 580, y: 1201},
        {x: 1120, y: 682},
        {x: 563, y: 825},
        {x: 53, y: 707},
        {x: 1470, y: 65},
        {x: 1344, y: 1169}];

    for(var i = 0; i < healthEntitiesAmount; i++){
        var newHealthEntity = new HealthEntity(healthEntityPos[i]);
        healthEntities.push(newHealthEntity);
    }
}

io.sockets.on('connection', function(socket){
	console.log("Client connected");

	socket.on('disconnect', function(){
		if(players.length === 0){return;}
		
		console.log("Disconnect: Player has disconnected: " + this.id);

		var removePlayer = playerById(this.id);
		if(!removePlayer){
			console.log("DISCONNECT ERROR: Player not found: " + this.id);
			return;
		}

		io.sockets.emit("removePlayer", {id: this.id, name: this.name});

		players.splice(players.indexOf(removePlayer), 1);
	});

	socket.on('gameReady', function(data){
		var newPlayer = new Player(this.id, data.name, data.room, 100, 100, "down");

        this.emit('addHealthEntity', healthEntities);

		if(playerById(this.id)){
			return;
		}

		this.emit('addMainPlayer', {id: newPlayer.id, name: newPlayer.name, x: newPlayer.getX(), y: newPlayer.getY()});
		socket.broadcast.emit('addPlayer', {
				id: newPlayer.id, 
				name: newPlayer.name, 
				x: newPlayer.getX(), 
				y: newPlayer.getY()
			});

		for (var i = 0; i < players.length; i++) {
			var existingPlayer = players[i];
			this.emit("addPlayer", {
				id: existingPlayer.id, 
				name: existingPlayer.name, 
				x: existingPlayer.getX(), 
				y: existingPlayer.getY()
			});
		}

		players.push(newPlayer);



	});

	socket.on('movePlayer', function(data){
		var movePlayer = playerById(this.id);

		if(!movePlayer){
			console.log("Move Player: Player not found: " + this.id);
			return;
		}	


		movePlayer.setX(data.x);
		movePlayer.setY(data.y);
		movePlayer.setDirection(data.direction);

		this.broadcast.emit('movePlayer', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), direction: movePlayer.getDirection(), moving: data.moving});
	});

	socket.on('fireProjectile', function(id, source, target){
		socket.broadcast.emit('fireProjectile', id, source, target);
	});

	socket.on('playerHit', function(data){
        this.broadcast.emit('remotePlayerHit', data);
	});

	socket.on('scoreHit', function(){

	});

	socket.on('resetPlayer', function(data){
        var resetPlayer = playerById(this.id);

        if(!resetPlayer){
            console.log("Move Player: Player not found: " + this.id);
            return;
        }

        this.broadcast.emit('resetPlayer', data);

	});

    socket.on('removeHealthEntity', function(data){
        var healthPack = entityById(data.id);

        if(!healthPack){
            console.log("removeHealthEntity: Entity not found: " + data.id);
            return;
        }

        this.broadcast.emit('removeHealthEntity', healthPack);
    });


});

server.listen(app.get('port'));

console.log(Date());

init();

