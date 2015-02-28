var game = {
	data: {
		score: 0,
		health: 3,
		volume: 1
	},
	playerId: '',
	players: [],
	mouseTarget: {},
	MAIN_PLAYER_OBJECT: 4,
	ENEMY_OBJECT: 5,
	mainPlayer: [],

	'onload': function() {
		me.sys.pauseOnBlur = false;
		me.sys.fps = 60;
		if (!me.video.init("screen",  me.video.CANVAS, 640, 480, true, 'auto')) {
		    alert("Your browser does not support HTML5 canvas.");
		    return;
		}

		// add "#debug" to the URL to enable the debug Panel
		if (document.location.hash === "#debug") {
		    window.onReady(function () {
		        me.plugin.register.defer(this, debugPanel, "debug");
		    });
		}

		me.input.registerPointerEvent('pointermove', me.game.viewport, function(e){
			game.mouseTarget = {x: e.gameWorldX, y: e.gameWorldY};
		});

		me.audio.init('ogg,mp3');
		me.loader.onload = this.loaded.bind(this);
		me.loader.preload(game.resources);
		me.state .change(me.state.LOADING);
	},

	'loaded': function() {
		me.state.set(me.state.PLAY, new game.PlayScreen());

		me.pool.register("mainPlayer", game.PlayerEntity);
		me.pool.register("enemyPlayer", game.NetworkPlayerEntity);
		me.pool.register("bullet", game.Bullet);

		me.input.bindKey(me.input.KEY.LEFT, 'left');
		me.input.bindKey(me.input.KEY.A, 'left');
		me.input.bindKey(me.input.KEY.RIGHT, 'right');
		me.input.bindKey(me.input.KEY.D, 'right');
		me.input.bindKey(me.input.KEY.UP, 'up');
		me.input.bindKey(me.input.KEY.W, 'up');
		me.input.bindKey(me.input.KEY.DOWN, 'down');
		me.input.bindKey(me.input.KEY.S, 'down');

		me.input.bindKey(me.input.KEY.SPACE, 'shoot')

		me.state.change(me.state.PLAY);

	},

	getPlayerById: function(id){
		for (var i = 0; i < this.players.length; i++) {
			if(this.players[i].id === id){
				return this.players[i];
			}
		}
		return false;
	},

	'addMainPlayer': function(data){
		if(!data) {return;}
		this.mainPlayer = me.pool.pull('mainPlayer', 100, 100, {
			image: 'rockani',
			spritewidth: 32,
			spriteheight: 32,
			width: 32,
			height: 32,
			id: data.id,
			name: data.name
		});

		this.players.push(this.mainPlayer);
		me.game.world.addChild(this.mainPlayer, 4);
		$('#individualScores').append('<li>' + this.mainPlayer.name + '</li>');
	},

	'addEnemy': function(data){
		if(!data) {return;}
		var player = me.pool.pull('enemyPlayer', data.x, data.y, {
			image: 'rockani',
			spritewidth: 32,
			spriteheight: 32,
			width: 32,
			height: 32,
			id: data.id,
			name: data.name
		});
		this.players.push(player);
		me.game.world.addChild(player, 4);
		$('#individualScores').append('<li id=' + "'" + player.name + "'" +'>'  + player.name + '</li>');
	},

	'movePlayer': function(data){
		if(!data) {return;}
		var movePlayer = game.getPlayerById(data.id);

		if(!movePlayer){
			console.log("Player was not found");
			return;
		}

		movePlayer.pos.x = data.x;
		movePlayer.pos.y = data.y;
		movePlayer.direction = data.direction;
	},

	'removeEnemy': function(data){
		// $('#'+"'"+ data.name +"'" + 'd').remove();
		console.log(data);
		if(!data) {return;}
		var removePlayer = game.getPlayerById(data.id);

		if(!removePlayer){
			console.log("Player was not found");
			return;
		}
		console.log("running");
		me.game.world.removeChild(removePlayer);
	},

	'fireBullet': function(id, source, target, broadcast){
		var obj = me.pool.pull('bullet', source.x, source.y, {
			image: 'bullet',
			spritewidth: 24,
			spriteheight: 24,
			width: 24,
			height: 24,
			target: target,
			id: id
		});

		me.game.world.addChild(obj, 6);

		if (broadcast){
			this.socket.emit('fireProjectile', id, source, target);
		}
	}
};