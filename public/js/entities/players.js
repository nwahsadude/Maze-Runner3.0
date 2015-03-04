game.PlayerEntity = me.Entity.extend({
	init: function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, settings]);
		this.body.addShape(new me.Rect(0, 0, 32, 32));

		this.id = settings.id;
		this.name = settings.name;

        this.health = 3;

		this.body.gravity = 0;
		this.isCollidable = true;
		//this.type = game.MAIN_PLAYER_OBJECT;
		this.type = me.collision.types.PLAYER_OBJECT;
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;

        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PROJECTILE_OBJECT);



		this.accelForce = 4;

		// TODO Move this to a weapon file maybe
		this.isWeaponCoolDown = false;
		this.weaponCoolDownTime = 300;

		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        this.renderable.addAnimation('stand-down', [0]);
        this.renderable.addAnimation('run-down', [0, 4, 8, 12], 100);
        this.renderable.addAnimation('stand-left', [1]);
        this.renderable.addAnimation('run-left', [1, 5, 9, 13], 100);
        this.renderable.addAnimation('stand-up', [2]);
        this.renderable.addAnimation('run-up', [2, 6, 10, 14], 100);
        this.renderable.addAnimation('stand-right', [3]);
        this.renderable.addAnimation('run-right', [3, 7, 11, 15], 100);
        this.renderable.addAnimation('moveleft', [0,1,2], 100);
        this.renderable.addAnimation('moveright', [3,4,5], 100);

		// this.lastAnimationUsed = "stand-down";
		// this.animationToUseThisFrame = "stand-down";
		// this.renderable.setCurrentAnimation('stand-down');

		this.lastAnimationUsed = "moveright";
		this.animationToUseThisFrame = "moveright";
		this.renderable.setCurrentAnimation('moveright');

		this.body.maxVel.x = this.body.maxVel.y = 25;
	},

	update: function(dt){
		this.body.vel.x = 0;
		this.body.vel.y = 0;
		this.g_dt = dt / 20;
		this.localPos = me.game.viewport.localToWorld(me.input.mouse.pos.x, me.input.mouse.pos.y);

		// if (me.input.isKeyPressed('left')){
		//     this.animationToUseThisFrame = 'run-left';a
		//     this.body.vel.x -= 1;
		//     this.direction = 'left';
		// } else if (me.input.isKeyPressed('right')){
		//     this.animationToUseThisFrame = 'run-right';
		//     this.body.vel.x += 1;
		//     this.direction = 'right';
		// } else {
		//     if (this.direction === 'left') {
		//         this.animationToUseThisFrame = 'stand-left';
		//     } else if (this.direction === 'right')  {
		//         this.animationToUseThisFrame = 'stand-right';
		//     }
		// }

		// if (me.input.isKeyPressed('up')){
		//     this.animationToUseThisFrame = 'run-up';
		//     this.body.vel.y -= 1;
		//     this.direction = 'up';
		// }else if (me.input.isKeyPressed('down')){
		//     this.animationToUseThisFrame = 'run-down';
		//     this.body.vel.y += 1;
		//     this.direction = 'down';
		// } else {
		//     if (this.direction === 'up') {
		//         this.animationToUseThisFrame = 'stand-up';
		//     } else if (this.direction === 'down'){
		//         this.animationToUseThisFrame = 'stand-down';
		//     }
		// }

		if (me.input.isKeyPressed('left')){
		    this.animationToUseThisFrame = 'moveleft';
		    this.body.vel.x -= 1;
		    this.direction = 'left';
		    this.stateChanged = true;
		} else if (me.input.isKeyPressed('right')){
		    this.animationToUseThisFrame = 'moveright';
		    this.body.vel.x += 1;
		    this.direction = 'right';
		    this.stateChanged = true;
		} else {
		    if (this.direction === 'left') {
		        this.animationToUseThisFrame = 'moveleft';
		    } else if (this.direction === 'right')  {
		        this.animationToUseThisFrame = 'moveright';
		    }
		}

		if (me.input.isKeyPressed('up')){
		    this.animationToUseThisFrame = 'moveleft';
		    this.body.vel.y -= 1;
		    this.direction = 'up';
		    this.stateChanged = true;
		}else if (me.input.isKeyPressed('down')){
		    this.animationToUseThisFrame = 'moveright';
		    this.body.vel.y += 1;
		    this.direction = 'down';
		    this.stateChanged = true;
		} else {
		    if (this.direction === 'up') {
		        this.animationToUseThisFrame = 'moveleft';
		    } else if (this.direction === 'down'){
		        this.animationToUseThisFrame = 'moveright';
		    }
		}
		if (me.input.isKeyPressed('shoot')){
			if(!this.isWeaponCoolDown && me.input.isKeyPressed('shoot')){
				this.isWeaponCoolDown = true;
				game.fireBullet(this.id, {x: this.pos.x + 36, y: this.pos.y + 36}, this.localPos, true);
				setTimeout(function() {game.mainPlayer.isWeaponCoolDown = false;}, this.weaponCoolDownTime);
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
		if (this.stateChanged){
			game.socket.emit('movePlayer', {x: this.pos.x, y: this.pos.y, direction: this.direction});
			this.stateChanged = false;
		}
		// return true if we moved or if the renderable was updated
		if (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0){
		    return true;
		} else {
		    return false;
		}

	},

	onCollision: function(response){
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

        this.health = 3;

		this.body.gravity = 0;
		this.isCollidable = true;
		this.type = "networkPlayer";
        this.body.collisionType = me.collision.types.ENEMY_OBJECT;


        this.renderable.addAnimation('stand-down', [0]);
        this.renderable.addAnimation('run-down', [0, 4, 8, 12], 100);
        this.renderable.addAnimation('stand-left', [1]);
        this.renderable.addAnimation('run-left', [1, 5, 9, 13], 100);
        this.renderable.addAnimation('stand-up', [2]);
        this.renderable.addAnimation('run-up', [2, 6, 10, 14], 100);
        this.renderable.addAnimation('stand-right', [3]);
        this.renderable.addAnimation('run-right', [3, 7, 11, 15], 100);
        this.renderable.addAnimation('moveleft', [0,1,2], 100);
        this.renderable.addAnimation('moveright', [3,4,5], 100);

		// this.lastAnimationUsed = "stand-down";
		// this.animationToUseThisFrame = "stand-down";
		// this.renderable.setCurrentAnimation('stand-down');

		this.lastAnimationUsed = "moveright";
		this.animationToUseThisFrame = "moveright";
		this.renderable.setCurrentAnimation('moveright');



	},

	update: function(dt){
		this.body.vel.x = 0;
		this.body.vel.y = 0;

		// if (this.direction === 'up'){
		// 	this.animationToUseThisFrame = 'run-up';
		// } else if (this.direction === 'down') {
		// 	this.animationToUseThisFrame = 'run-down';
		// } else if (this.direction === 'right'){
		// 	this.animationToUseThisFrame = 'run-right';
		// } else if (this.direction === 'left'){
		// 	this.animationToUseThisFrame = 'run-left';
		// }

		if (this.direction === 'up'){
			this.animationToUseThisFrame = 'moveleft';
		} else if (this.direction === 'down') {
			this.animationToUseThisFrame = 'moveright';
		} else if (this.direction === 'right'){
			this.animationToUseThisFrame = 'moveright';
		} else if (this.direction === 'left'){
			this.animationToUseThisFrame = 'moveleft';
		}

		if (this.animationToUseThisFrame != this.lastAnimationUsed) {
		  this.lastAnimationUsed = this.animationToUseThisFrame;
		  this.renderable.setCurrentAnimation(this.animationToUseThisFrame);
		}

		this.body.update(dt);

		this._super(me.Entity, 'update', [dt]);
		return true;
	},

	onCollision: function(response, other){
		// Make all other objects solid
		return false;
	}
});