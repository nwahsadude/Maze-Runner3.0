var game = {
	data: {
		score: 0,
		health: 3,
		volume: 1
	},
	playerId: '',
	players: {},
	mouseTarget: {},
	MAIN_PLAYER_OBJECT: 4,
	ENEMY_OBJECT: 5,
	mainPlayer: {},

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
		me.state.change(me.state.LOADING);
	},

	'loaded': function() {
		me.state.set(me.state.PLAY, new game.PlayScreen());

		me.pool.register("mainPlayer", game.PlayerEntity);
		// me.pool.register("enemyPlayer", game.NetworkPlayerEntity);

		me.input.bindKey(me.input.KEY.LEFT, 'left');
		me.input.bindKey(me.input.KEY.A, 'left');
		me.input.bindKey(me.input.KEY.RIGHT, 'right');
		me.input.bindKey(me.input.KEY.D, 'right');
		me.input.bindKey(me.input.KEY.UP, 'up');
		me.input.bindKey(me.input.KEY.W, 'up');
		me.input.bindKey(me.input.KEY.DOWN, 'down');
		me.input.bindKey(me.input.KEY.S, 'down');

		me.state.change(me.state.PLAY);

	},

	'addMainPlayer': function(data){
		if(!data) {return;}
		this.mainPlayer = me.pool.pull('mainPlayer', 100, 100, {
			image: 'boy',
			spritewidth: 48,
			spriteheight: 48,
			width: 32,
			height: 32,
			id: data.id,
		});

		me.game.world.addChild(this.mainPlayer, 4);
	}
};