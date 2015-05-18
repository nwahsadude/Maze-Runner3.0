#!/usr/bin/env node
var http = require('http'),
	path = require('path'),
	isProduction = (process.env.NODE_ENV === 'production'),
	port = isProduction ? 80 : process.env.PORT || 8000,
    //port = 80,
	express = require('express'),
	socketio = require('socket.io'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
	Player = require('./app/models/players').Player,
    HealthEntity = require('./app/models/entities').HealthEntity,
    passport = require('passport'),
    mongoose = require('mongoose'),
    flash = require('connect-flash');

var LocalStrategy = require('passport-local').Strategy;

var app = express();
var gameData = {};

var configDB = require('./app/config/database.js');
mongoose.connect(configDB.url);
require('./app/config/passport')(passport);

app.set('port', port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'thisbetharsecret',
    saveUninitialized: true,
    resave: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


var server = http.createServer(app);


var index = express.Router();
require('./app/routes/index')(index, passport);
app.use('/', index);

var auth = express.Router();
require('./app/routes/users')(auth);
app.use('/', auth);


function init(){
	gameData.players = [];
    gameData.healthEntitiesAmount = 6;
    gameData.healthEntities = [];
    HEP();
}


function HEP() {
    var healthEntityPos = [
        {x: 580, y: 1201},
        {x: 1120, y: 682},
        {x: 563, y: 825},
        {x: 53, y: 707},
        {x: 1470, y: 65},
        {x: 1344, y: 1169}];

    for(var i = 0; i < gameData.healthEntitiesAmount; i++){
        var newHealthEntity = new HealthEntity(healthEntityPos[i]);
        gameData.healthEntities.push(newHealthEntity);
    }
}

require('./app/socketio/socketio')(socketio, server, gameData, Player, HealthEntity);

server.listen(app.get('port'));

console.log(Date());

init();

