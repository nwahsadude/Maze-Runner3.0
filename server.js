var http = require('http'),
	path = require('path'),
	isProduction = (process.env.NODE_ENV === 'production'),
	port = isProduction ? 80 : process.env.PORT || 8000,
	express = require('express'),
	app = express(),
	socketio = require('socket.io'),
	Player = require('./Player').Player;

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

var server = http.createServer(app),
	io = socketio.listen(server);
var	players,
	rooms;

function init(){
	players = [];
	highScores = {};
}

function playerById(id){
	for (var i = 0; i < players.length; i++){
		if (players[i].id === id){
			return players[i];
		}
	}
	return false;
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
			existingPlayer = players[i];
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

		this.broadcast.emit('movePlayer', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), direction: movePlayer.getDirection()});
	});

	socket.on('fireProjectile', function(id, source, target){
		socket.broadcast.emit('fireProjectile', id, source, target);
	});

	socket.on('playerHit', function(data){

	});

	socket.on('scoreHit', function(){

	});

	socket.on('resetPlayer', function(){

	});

});

server.listen(app.get('port'));

console.log(Date());

init();

