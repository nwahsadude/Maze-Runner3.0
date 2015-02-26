game.PlayerEntity = me.Entity.extend({
	init: function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, settings]);
		this.body.addShape(new me.Rect(0, 0, 32, 32));

		this.id = settings.id;
		this.name = settings.name;

		this.body.gravity = 0;
		this.isCollidable = true;
		this.type = game.MAIN_PLAYER_OBJECT;

		this.accelForce = 4;

		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        this.renderable.addAnimation('stand-down', [0]);
        this.renderable.addAnimation('run-down', [0, 4, 8, 12], 100);
        this.renderable.addAnimation('stand-left', [1]);
        this.renderable.addAnimation('run-left', [1, 5, 9, 13], 100);
        this.renderable.addAnimation('stand-up', [2]);
        this.renderable.addAnimation('run-up', [2, 6, 10, 14], 100);
        this.renderable.addAnimation('stand-right', [3]);
        this.renderable.addAnimation('run-right', [3, 7, 11, 15], 100);

		this.lastAnimationUsed = "stand-down";
		this.animationToUseThisFrame = "stand-down";
		this.renderable.setCurrentAnimation('stand-down');

		this.body.maxVel.x = this.body.maxVel.y = 25;
	},

	update: function(dt){
		this.body.vel.x = 0;
		this.body.vel.y = 0;
		this.g_dt = dt / 20;

		if (me.input.isKeyPressed('left')){
		    this.animationToUseThisFrame = 'run-left';
		    this.body.vel.x -= 1;
		    this.direction = 'left';
		} else if (me.input.isKeyPressed('right')){
		    this.animationToUseThisFrame = 'run-right';
		    this.body.vel.x += 1;
		    this.direction = 'right';
		} else {
		    if (this.direction === 'left') {
		        this.animationToUseThisFrame = 'stand-left';
		    } else if (this.direction === 'right')  {
		        this.animationToUseThisFrame = 'stand-right';
		    }
		}

		if (me.input.isKeyPressed('up')){
		    this.animationToUseThisFrame = 'run-up';
		    this.body.vel.y -= 1;
		    this.direction = 'up';
		}else if (me.input.isKeyPressed('down')){
		    this.animationToUseThisFrame = 'run-down';
		    this.body.vel.y += 1;
		    this.direction = 'down';
		} else {
		    if (this.direction === 'up') {
		        this.animationToUseThisFrame = 'stand-up';
		    } else if (this.direction === 'down'){
		        this.animationToUseThisFrame = 'stand-down';
		    }
		}

		if (this.animationToUseThisFrame != this.lastAnimationUsed) {
		  this.lastAnimationUsed = this.animationToUseThisFrame;
		  this.renderable.setCurrentAnimation(this.animationToUseThisFrame);
		}


		this.body.vel.normalize();
		this.body.vel.scale(this.accelForce * this.g_dt);

		this.body.update(dt);

		me.collision.check(this);
		
		// return true if we moved or if the renderable was updated
		if (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0){
			game.socket.emit('movePlayer', {x: this.pos.x, y: this.pos.y});
		    return true;
		} else {
		    return false;
		}

	},

	onCollision: function(response, other){
		// make all other objects solid
		return true;
	}
});

game.NetworkPlayerEntity = me.Entity.extend({
	init: function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, settings]);
		this.body.addShape(new me.Rect(0, 0, 32, 32));
		this.id = settings.id;
		this.name = settings.name;

		this.body.gravity = 0;
		this.isCollidable = true;
		this.type = game.ENEMY_OBJECT;


        this.renderable.addAnimation('stand-down', [0]);
        this.renderable.addAnimation('run-down', [0, 4, 8, 12], 100);
        this.renderable.addAnimation('stand-left', [1]);
        this.renderable.addAnimation('run-left', [1, 5, 9, 13], 100);
        this.renderable.addAnimation('stand-up', [2]);
        this.renderable.addAnimation('run-up', [2, 6, 10, 14], 100);
        this.renderable.addAnimation('stand-right', [3]);
        this.renderable.addAnimation('run-right', [3, 7, 11, 15], 100);

		this.lastAnimationUsed = "stand-down";
		this.animationToUseThisFrame = "stand-down";
		this.renderable.setCurrentAnimation('stand-down');



	},

	update: function(dt){
		this.body.vel.x = 0;
		this.body.vel.y = 0;

		this.body.update(dt);

		this._super(me.Entity, 'update', [dt]);
		return true;
	},

	onCollision: function(response, other){
		// Make all other objects solid
		return false;
	}
});