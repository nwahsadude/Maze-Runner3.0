var game;
game = {
    data: {
        score: 0,
        health: 10,
        volume: 1,
        death: 0, //TODO add this to the player
        healthCooldown: 3000
    },
    playerId: '',
    players: [],
    healthEntity: [],
    mouseTarget: {},
    MAIN_PLAYER_OBJECT: 4,
    ENEMY_OBJECT: 5,
    mainPlayer: [],
    ready: false,


    'onload': function () {
        //me.sys.pauseOnBlur = false;
        me.sys.fps = 60;
        me.sys.preRender = true;

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
        me.pool.register("HealthEntity", game.HealthEntity);

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
        var data = {x: Math.floor(Math.random() * (300 - 20)) + 20, y: Math.floor(Math.random() * (150 - 20) + 20)};
        var data2 = {x: 1300, y: 810};
        return data2;
    },

    getPlayerById: function (id) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                return this.players[i];
            }
        }
        return false;
    },

    getEntityById: function(id){
        for (var i = 0; i < this.healthEntity.length; i++) {
            if (this.healthEntity[i].id === id) {
                return this.healthEntity[i];
            }
        }
        return false;
    },

    'addMainPlayer': function (data) {
        if (!data) {
            return;
        }
        var spawnPoint = game.getSpawnPoint();
        this.mainPlayer = me.pool.pull('mainPlayer', spawnPoint.x, spawnPoint.y, {
            image: 'rockani',
            spritewidth: 32,
            spriteheight: 32,
            width: 32,
            height: 32,
            id: data.id,
            name: data.name,
            score: 0
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
        $('#individualScores').append('<li id=' + player.name + ">" + player.name + '</li>');
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
        if(!data.moving){
            movePlayer.emitter.totalParticles = 0;
        } else if(data.moving){
            if(particleManager.enableParticles){
                movePlayer.emitter.totalParticles = 10;
            }
        }

        movePlayer.pos.x = data.x;
        movePlayer.pos.y = data.y;
        movePlayer.direction = data.direction;
    },

    'removeEnemy': function (data) {
        if (!data) {
            return;
        }
        var removePlayer = game.getPlayerById(data.id);

        me.game.world.removeChild(removePlayer.emitter);
        me.game.world.removeChild(removePlayer.emitter.container);

        if (!removePlayer) {
            console.log("Player was not found");
            return;
        }
        $("#" + removePlayer.name).remove();
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

        me.game.world.addChild(obj, 3);
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

        me.game.world.addChild(obj, 3);
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
        game.mainPlayer.score++;
        audioManager.playSound("shoot");


        if(sourceId === game.mainPlayer.id){
            if (player.health > 0){
                this.socket.emit('playerHit', {id: player.id, health: player.health});
            } else if (player.health <= 0){
                player.health = game.data.health;
                this.socket.emit('playerHit', {id: player.id, health: player.health});
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
        audioManager.playSound("shoot");
        game.mainPlayer.health--;
        var data;
        if (game.mainPlayer.health <= 0){
            data = {id: game.mainPlayer.id, name: game.mainPlayer.name, score: game.mainPlayer.score};
            game.mainPlayer.health = game.data.health;
            this.socket.emit('playerHit', {id: game.mainPlayer.id, health: game.mainPlayer.health});
            me.game.world.addChild(this.mainPlayer.emitter);
            me.game.world.addChild(this.mainPlayer.emitter.container);
            me.game.world.removeChild(game.mainPlayer);
            game.respawnMainPlayer(data);
            game.socket.emit('resetPlayer');
        } else {
            //this.socket.emit('playerHit', {id: game.mainPlayer.id, health: game.mainPlayer.health});
        }
    },

    'respawnMainPlayer': function(data){
        if (!data) {
            return;
        }
        me.input.unbindKey(me.input.KEY.SPACE, 'shoot');
        game.data.death++;
        //audioManager.playSound("respawn");
        var spawnPoint = game.getSpawnPoint();
        this.mainPlayer = me.pool.pull('mainPlayer', spawnPoint.x, spawnPoint.y, {
            image: 'rockani',
            spritewidth: 32,
            spriteheight: 32,
            width: 32,
            height: 32,
            id: data.id,
            name: data.name,
            score: data.score
        });
        this.mainPlayer.health = game.data.health;
        me.game.world.addChild(this.mainPlayer, 3);
        me.input.bindKey(me.input.KEY.SPACE, 'shoot');
        game.socket.emit('movePlayer', {x: this.mainPlayer.pos.x, y: this.mainPlayer.pos.y, direction: this.mainPlayer.direction});
    },

    'resetPlayer': function(data){
        audioManager.playSound("respawn");
    },

    'updatePlayerHealth': function(data){
        this.socket.emit('playerHit', {id: data.id, health: data.health});
    },

    'addHealthEntity': function(data){
        if(!data){return;}
        for(var i = 0; i < data.length; i++){
            var obj = me.pool.pull('HealthEntity', data[i].pos.x, data[i].pos.y, {
                image: 'health',
                spritewidth: 32,
                spriteheight: 32,
                width: 32,
                height: 32,
                id: data[i].id
            });
            me.game.world.addChild(obj, 4);
            game.healthEntity.push(obj);
        }
    },

    'removeHealthEntity': function(data){
        this.socket.emit('removeHealthEntity', {id: data})
    },

    'disableHealthEntity': function(data){
        var disableHE = game.getEntityById(data.id);

        if(!disableHE){return;}
        disableHE.body.setCollisionMask(me.collision.types.NO_OBJECT);
        disableHE.renderable.alpha = 0.0;
        setTimeout(function() {
            disableHE.body.setCollisionMask(4294967295);
            disableHE.renderable.alpha = 1.0;
        }, game.data.healthCooldown);

    },

    'gameManager': function(){
        var particleSystem = {
            init: function(){
                particleSystem.particles(true);

            },

            particles: function(enabled){
                if(endabled){

                    //Do stuff
                } else if(!enabled){
                    //Stop doing stuff
                }
            },

            switchParticles: function(){
                if(particleSystem.particles()){

                }
            }
        }
    }

};
