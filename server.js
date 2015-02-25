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
		
		console.log("Player has disconnected: " + this.id);

		var removePlayer = playerById(this.id);
		if(!removePlayer){
			console.log("DISCONNECT ERROR: Player not found: " + this.id);
			return;
		}
		this.emit("remove player", {id: this.id});

		players.splice(players.indexOf(removePlayer), 1);
	});

	socket.on('gameReady', function(data){
		var newPlayer = new Player(this.id, data.nme, data.room, data.posX, data.posY, "down");

		if(playerById(this.id)){
			return;
		}

		this.emit('addMainPlayer', {id: newPlayer.id, name: newPlayer.name, posX: newPlayer.getX(), posY: newPlayer.getY()});

		players.push(newPlayer);

	});

	socket.on('movePlayer', function(position){

	});

	socket.on('fireProjectile', function(id, source, target){

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

