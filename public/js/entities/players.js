game.PlayerEntity = me.Entity.extend({
	init: function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, settings]);
		this.body.addShape(new me.Rect(0, 0, 32, 32));

		this.id = settings.id;
		this.name = settings.name;
        this.score = settings.score;

        this.health = 10;

        this.moving = false;
        this.runonce = false;

		this.body.gravity = 0;
		this.type = "mainPlayer";
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;

        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PROJECTILE_OBJECT | me.collision.types.COLLECTABLE_OBJECT);




		// TODO Move this to a weapon file maybe
		this.isWeaponCoolDown = false;
		this.weaponCoolDownTime = 300;

		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        this.renderable.addAnimation('stand-down', [7]);
        this.renderable.addAnimation('run-down', [6, 7, 8], 100);
        this.renderable.addAnimation('stand-left', [10]);
        this.renderable.addAnimation('run-left', [9, 10, 11], 100);
        this.renderable.addAnimation('stand-up', [1]);
        this.renderable.addAnimation('run-up', [0, 1, 2], 100);
        this.renderable.addAnimation('stand-right', [4]);
        this.renderable.addAnimation('run-right', [3, 4, 5], 100);
        //this.renderable.addAnimation('moveleft', [0,1,2], 100);
        //this.renderable.addAnimation('moveright', [3,4,5], 100);


		this.lastAnimationUsed = "stand-down";
		this.animationToUseThisFrame = "stand-down";
		this.renderable.setCurrentAnimation('stand-down');
        this.body.setVelocity(3.5, 3.5);
        this.body.setFriction(.4, .4);

        //Setup particles
        var x = this.pos.x + 16;
        var y = this.pos.y + 16;
        this.emitter = particleManager.playerParticles(x, y);
        me.game.world.addChild(this.emitter);
        me.game.world.addChild(this.emitter.container);
        this.emitter.streamParticles();

	},

	update: function(dt){
		this.localPos = me.game.viewport.localToWorld(me.input.mouse.pos.x, me.input.mouse.pos.y);

		if (me.input.isKeyPressed('left')){
		    this.animationToUseThisFrame = 'run-left';
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
		    this.direction = 'left';
		    this.stateChanged = true;
		} else if (me.input.isKeyPressed('right')){
		    this.animationToUseThisFrame = 'run-right';
            this.body.vel.x += this.body.accel.x * me.timer.tick;
		    this.direction = 'right';
		    this.stateChanged = true;
		} else {
		    if (this.direction === 'left') {
		        this.animationToUseThisFrame = 'stand-left';
		    } else if (this.direction === 'right')  {
		        this.animationToUseThisFrame = 'stand-right';
		    }
		}

		if (me.input.isKeyPressed('up')){
		    this.animationToUseThisFrame = 'run-up';
            this.body.vel.y -= this.body.accel.y * me.timer.tick;
		    this.direction = 'up';
		    this.stateChanged = true;
		}else if (me.input.isKeyPressed('down')){
		    this.animationToUseThisFrame = 'run-down';
            this.body.vel.y += this.body.accel.y * me.timer.tick;
		    this.direction = 'down';
		    this.stateChanged = true;
		} else {
		    if (this.direction === 'up') {
		        this.animationToUseThisFrame = 'stand-up';
		    } else if (this.direction === 'down'){
		        this.animationToUseThisFrame = 'stand-down';
		    }
		}
		if (me.input.isKeyPressed('shoot')){
			if(!this.isWeaponCoolDown && me.input.isKeyPressed('shoot')){
				this.isWeaponCoolDown = true;
				game.fireBullet(this.id, {x: this.pos.x, y: this.pos.y}, this.localPos, true);
				setTimeout(function() {game.mainPlayer.isWeaponCoolDown = false;}, this.weaponCoolDownTime);
			}
		}

        if (me.input.isKeyPressed('pos')){
            console.log(this.pos.x, this.pos.y);
            this.body.setVelocity(5, 5);
        }

		if (this.animationToUseThisFrame != this.lastAnimationUsed) {
		  this.lastAnimationUsed = this.animationToUseThisFrame;
		  this.renderable.setCurrentAnimation(this.animationToUseThisFrame);
		}

        if(!particleManager.enableParticles){
            this.emitter.totalParticles = 0;
        } else if(particleManager.enableParticles){
            this.emitter.totalParticles = 10
        }

        //Making particles follow player
        this.emitter.pos.x = this.pos.x + 16;
        this.emitter.pos.y = this.pos.y + 16;

		this.body.update(dt);
		me.collision.check(this);

        if(this.body.vel.x || this.body.vel.y != 0){
            if(particleManager.enableParticles){
                this.emitter.streamParticles();
            }
            this.runonce = false;
            this.moving = true;
        } else {
            this.emitter.stopStream();
            this.moving = false;
        }


        if(!this.moving && !this.runonce){
            game.socket.emit('movePlayer', {x: this.pos.x, y: this.pos.y, direction: this.direction, moving: this.moving});
            this.runonce = true;
        }
		if (this.body.vel.x !== 0 || this.body.vel.y !== 0 || this.stateChanged){
            game.socket.emit('movePlayer', {x: this.pos.x, y: this.pos.y, direction: this.direction, moving: this.moving});
            this.stateChanged = false;
		}
		// return true if we moved or if the renderable was updated
		if (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0 ){
		    return true;
		} else {
		    return false;
		}
	},

	onCollision: function(response){
        if(response.a.type === "remoteBullet"){
            return false;
        }
		return true;
	}
});

game.NetworkPlayerEntity = me.Entity.extend({
	init: function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, settings]);
		this.body.addShape(new me.Rect(0, 0, 32, 32));
		this.id = settings.id;
		this.name = settings.name;
        this.alwaysUpdate = true;
        this.moving = false;

        this.health = 10;

		this.body.gravity = 0;
		this.type = "networkPlayer";
        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PROJECTILE_OBJECT);


        this.renderable.addAnimation('stand-down', [7]);
        this.renderable.addAnimation('run-down', [6, 7, 8], 100);
        this.renderable.addAnimation('stand-left', [10]);
        this.renderable.addAnimation('run-left', [9, 10, 11], 100);
        this.renderable.addAnimation('stand-up', [1]);
        this.renderable.addAnimation('run-up', [0, 1, 2], 100);
        this.renderable.addAnimation('stand-right', [4]);
        this.renderable.addAnimation('run-right', [3, 4, 5], 100);
        //this.renderable.addAnimation('moveleft', [0,1,2], 100);
        //this.renderable.addAnimation('moveright', [3,4,5], 100);

		this.lastAnimationUsed = "stand-down";
		this.animationToUseThisFrame = "stand-down";
		this.renderable.setCurrentAnimation('stand-down');

        //Setup for particles
        var x = this.pos.x + 16;
        var y = this.pos.y + 16;
        this.emitter = particleManager.playerParticles(x, y);
        me.game.world.addChild(this.emitter);
        me.game.world.addChild(this.emitter.container);
        this.emitter.streamParticles();

        this.font = new me.BitmapFont("32x32_font", 32);
	},

	update: function(dt){
		this.body.vel.x = 0;
		this.body.vel.y = 0;



        if(this.moving){
            if (this.direction === 'up'){
                this.animationToUseThisFrame = 'run-up';
            } else if (this.direction === 'down') {
                this.animationToUseThisFrame = 'run-down';
            } else if (this.direction === 'right'){
                this.animationToUseThisFrame = 'run-right';
            } else if (this.direction === 'left'){
                this.animationToUseThisFrame = 'run-left';
            }
        }


		if (this.animationToUseThisFrame != this.lastAnimationUsed) {
		  this.lastAnimationUsed = this.animationToUseThisFrame;
		  this.renderable.setCurrentAnimation(this.animationToUseThisFrame);
		}

        //Making particles follow player
        this.emitter.pos.x = this.pos.x + 16;
        this.emitter.pos.y = this.pos.y + 16;

		this.body.update(dt);

		this._super(me.Entity, 'update', [dt]);
		return true;
	},

	onCollision: function(){
		// Make all other objects solid
		return false;
	},

    draw: function(renderer){
        this._super(me.Entity, 'draw', [renderer]);
        this.font.draw(renderer, this.health, this.pos.x + 16, this.pos.y - 32);
    }
});