var game;
game = {
    data: {
        score: 0,
        health: 10,
        volume: 1,
        death: 0
    },
    playerId: '',
    players: [],
    mouseTarget: {},
    MAIN_PLAYER_OBJECT: 4,
    ENEMY_OBJECT: 5,
    mainPlayer: [],
    ready: false,


    'onload': function () {
        me.sys.pauseOnBlur = false;
        me.sys.fps = 60;
        if (!me.video.init("screen", me.video.CANVAS, 640, 480, true, 'auto')) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // add "#debug" to the URL to enable the debug Panel
        if (document.location.hash === "#debug") {
            window.onReady(function () {
                me.plugin.register.defer(this, me.debug.Panel, "debug", me.input.KEY.V);
            });
        }

        me.input.registerPointerEvent('pointermove', me.game.viewport, function (e) {
            game.mouseTarget = {x: e.gameWorldX, y: e.gameWorldY};
        });

        me.audio.init('ogg,mp3');
        me.loader.onload = this.loaded.bind(this);
        me.loader.preload(game.resources);
        me.state.change(me.state.LOADING);
    },

    'loaded': function () {
        me.state.set(me.state.PLAY, new game.PlayScreen());

        me.pool.register("mainPlayer", game.PlayerEntity);
        me.pool.register("enemyPlayer", game.NetworkPlayerEntity);
        me.pool.register("bullet", game.Bullet);
        me.pool.register("networkBullet", game.networkBullet);

        me.input.bindKey(me.input.KEY.LEFT, 'left');
        me.input.bindKey(me.input.KEY.A, 'left');
        me.input.bindKey(me.input.KEY.RIGHT, 'right');
        me.input.bindKey(me.input.KEY.D, 'right');
        me.input.bindKey(me.input.KEY.UP, 'up');
        me.input.bindKey(me.input.KEY.W, 'up');
        me.input.bindKey(me.input.KEY.DOWN, 'down');
        me.input.bindKey(me.input.KEY.S, 'down');

        me.input.bindKey(me.input.KEY.SPACE, 'shoot')

        game.ready = true;

        me.state.change(me.state.PLAY);

    },

    getSpawnPoint: function(){
        data = {x: Math.floor(Math.random() * (300 - 60)) + 60, y: Math.floor(Math.random() * (300 - 60) + 60)};
        return data;
    },

    getPlayerById: function (id) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                return this.players[i];
            }
        }
        return false;
    },

    'addMainPlayer': function (data) {
        if (!data) {
            return;
        }
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

    'addEnemy': function (data) {
        if (!data) {
            return;
        }
        //if(!game.ready){return;}
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
        $('#individualScores').append('<li id=' + "'" + player.name + "'" + '>' + player.name + '</li>');
    },

    'movePlayer': function (data) {
        if (!data) {
            return;
        }
        var movePlayer = game.getPlayerById(data.id);

        if (!movePlayer) {
            console.log("Player was not found");
            return;
        }

        movePlayer.pos.x = data.x;
        movePlayer.pos.y = data.y;
        movePlayer.direction = data.direction;
    },

    'removeEnemy': function (data) {
        // $('#'+"'"+ data.name +"'" + 'd').remove();
        if (!data) {
            return;
        }
        var removePlayer = game.getPlayerById(data.id);

        if (!removePlayer) {
            console.log("Player was not found");
            return;
        }
        me.game.world.removeChild(removePlayer);
    },

    'fireBullet': function (id, source, target, broadcast) {
        if(!game.ready){return;}
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
        //audioManager.playSound("shoot");

        if (broadcast) {
            this.socket.emit('fireProjectile', id, source, target);
        }
    },

    'fireNetworkBullet': function (id, source, target) {
        if(!game.ready){return;}
        var obj = me.pool.pull('networkBullet', source.x, source.y, {
            image: 'bullet',
            spritewidth: 24,
            spriteheight: 24,
            width: 24,
            height: 24,
            target: target,
            id: id
        });

        me.game.world.addChild(obj, 6);
        //audioManager.playSound("shoot");
    },

    'hitPlayer': function (sourceId, targetId) {

        if(!targetId || !sourceId){return};

        var player = game.getPlayerById(targetId);

        if (!player){
            console.log("Hitplayer: Player not found");
            return;
        }

        player.health--;
        audioManager.playSound("shoot");
        if(sourceId === game.mainPlayer.id){
            if (player.health >= 0){
                game.data.score++;
                this.socket.emit('playerHit', {id: player.id, health: player.health});
            } else if (player.health < 0){
                player.health = 10;
                //console.log(player.name + " has died!");
            }
        }


    },

    'remotePlayerHealthChanged': function(data){
        var remotePlayer = game.getPlayerById(data.id)

        if (!remotePlayer){
            console.log("remotePlayerHealthChanged: Player not found");
            return;
        }
        remotePlayer.health = data.health;

        //console.log(remotePlayer.name + "'s health is " + remotePlayer.health);
    },

    'scoreHit': function(sourceId, targetId){
        game.data.health--;
        var data;
        audioManager.playSound("shoot");
        if (game.data.health < 0){
            data = {id: game.mainPlayer.id, name: game.mainPlayer.name};
            me.game.world.removeChild(game.mainPlayer);
            game.data.health = 10;
            game.respawnMainPlayer(data);
        }
    },

    'respawnMainPlayer': function(data){
        if (!data) {
            return;
        }
        me.input.unbindKey(me.input.KEY.SPACE, 'shoot');
        game.data.death++;
        audioManager.playSound("respawn");
        var spawnPoint = game.getSpawnPoint();
        this.mainPlayer = me.pool.pull('mainPlayer', spawnPoint.x, spawnPoint.y, {
            image: 'rockani',
            spritewidth: 32,
            spriteheight: 32,
            width: 32,
            height: 32,
            id: data.id,
            name: data.name
        });
        this.mainPlayer.health = 100;
        me.game.world.addChild(this.mainPlayer, 4);
        me.input.bindKey(me.input.KEY.SPACE, 'shoot');
        game.socket.emit('movePlayer', {x: this.mainPlayer.pos.x, y: this.mainPlayer.pos.y, direction: this.mainPlayer.direction});
    }


};
