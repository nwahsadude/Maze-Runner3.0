game.Bullet = me.Entity.extend({
	init: function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, settings]);
		this.body.addShape(new me.Rect(0, 0, 24, 24));

		this.id = settings.id;
		this.alwaysUpdate = true;
		this.body.gravity = 0;
        this.type = "bullet"

		this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
		this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.ENEMY_OBJECT);

        //this.shotAngle = settings.angle;
        //this.renderable.angle = this.shotAngle;

		this.maxVelocity = settings.maxVelocity || 5;

		var localX = (settings.target.x - x);
		var localY = (settings.target.y - y);
		var localTargetVector = (new me.Vector2d(localX, localY));
		localTargetVector.normalize();
		localTargetVector.scaleV(new me.Vector2d(this.maxVelocity, this.maxVelocity));
		this.body.setVelocity(localTargetVector.x, localTargetVector.y);


        var x = this.pos.x;
        var y = this.pos.y;

        this.emitter = particleManager.bulletParticles(x, y);
        me.game.world.addChild(this.emitter);
        me.game.world.addChild(this.emitter.container);
    },

	update: function(dt){
		this.body.vel.x += this.body.accel.x * me.timer.tick;
		this.body.vel.y += this.body.accel.y * me.timer.tick;
        this.renderable.angle += .5 * me.timer.tick;


		this.body.computeVelocity(this.body.vel);

		if (this.body.vel.x === 0 || this.body.vel.y === 0){
			me.game.world.removeChild(this);
		}

		if (this.body.entity.pos.x <= 0 || this.body.entity.pos.y <= 0 || this.body.entity.pos.x >= 1600 || this.body.entity.pos.y >= 1280){
            me.game.world.removeChild(this.emitter);
            me.game.world.removeChild(this.emitter.container);
			me.game.world.removeChild(this);
		}
        this.emitter.pos.x = this.pos.x;
        this.emitter.pos.y = this.pos.y;


		this.body.update(dt);

        me.collision.check(this);



		this._super(me.Entity, 'update', [dt]);
		return true;
	},

	onCollision: function(response) {

        if(response.a.id != response.b.id){
            switch(response.b.type){
                case "networkPlayer":
                    this.emitter.burstParticles();
                    this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                    var that = this;
                    this.removeParticleEmitter(that);
                    me.game.world.removeChild(this);
                    game.hitPlayer(this.id, response.b.id);
                    return false;

                default:
                    this.emitter.burstParticles();
                    this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                    //TODO Remove the particle emitter in a better way
                    var that = this;
                    this.removeParticleEmitter(that);
                    //setTimeout(function() {
                    //    me.game.world.removeChild(that.emitter);
                    //    me.game.world.removeChild(that.emitter.container);
                    //}, 3000);
                    //me.game.world.removeChild(this.emitter);
                    //me.game.world.removeChild(this.emitter.container);
                    me.game.world.removeChild(this);
                    return false;
            }
        }

		return true;
	},

    removeParticleEmitter: function(emitter){
        setTimeout(function() {
            me.game.world.removeChild(emitter.emitter);
            me.game.world.removeChild(emitter.emitter.container);
        }, 3000);
    }
});

game.networkBullet = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.addShape(new me.Rect(0, 0, 24, 24));

        this.id = settings.id;
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.type = "remoteBullet"

		this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT | me.collision.types.ENEMY_OBJECT);

        this.shotAngle = settings.angle;
        this.renderable.angle = this.shotAngle;
        this.maxVelocity = settings.maxVelocity || 15;

        var localX = (settings.target.x - x);
        var localY = (settings.target.y - y);
        var localTargetVector = (new me.Vector2d(localX, localY));
        localTargetVector.normalize();
        localTargetVector.scaleV(new me.Vector2d(this.maxVelocity, this.maxVelocity));
        this.body.setVelocity(localTargetVector.x, localTargetVector.y);

        var x = this.pos.x + 16;
        var y = this.pos.y + 16;

        this.emitter = particleManager.bulletParticles(x, y)
        me.game.world.addChild(this.emitter);
        me.game.world.addChild(this.emitter.container);

    },

    update: function(dt){
        this.body.vel.x += this.body.accel.x * me.timer.tick;
        this.body.vel.y += this.body.accel.y * me.timer.tick;
        this.body.computeVelocity(this.body.vel);

        if (this.body.vel.x === 0 || this.body.vel.y === 0){
            me.game.world.removeChild(this);
        }

        if (this.body.entity.pos.x <= 0 || this.body.entity.pos.y <= 0 || this.body.entity.pos.x >= 1600 || this.body.entity.pos.y >= 1280){
            this.removeParticleEmitter(this);
            me.game.world.removeChild(this);
        }

        this.emitter.pos.x = this.pos.x + 12;
        this.emitter.pos.y = this.pos.y + 12;

        this.body.update(dt);

        me.collision.check(this);
        this._super(me.Entity, 'update', [dt]);
        return true;
    },

    onCollision: function(response) {
        var playerTemp,
            bulletId;
        if(response.a.type === "remoteBullet"){
            playerTemp = response.b;
            bulletId = response.a.id;
        } else if (response.b.type === "remoteBullet"){
            playerTemp = response.a;
            bulletId = response.b.id;
        }
        var that = this;
        switch(playerTemp.type){
            case "networkPlayer":
                if(playerTemp.id != bulletId){
                    this.emitter.burstParticles();
                    this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                    this.removeParticleEmitter(that);
                    me.game.world.removeChild(this);
                    return false;
                }
                return false;
            case "mainPlayer" :
                this.emitter.burstParticles();
                this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                this.removeParticleEmitter(that);
                me.game.world.removeChild(this);
                game.scoreHit(playerTemp.id, bulletId);
                return false;
            default :
                this.emitter.burstParticles();
                this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                this.removeParticleEmitter(that);
                me.game.world.removeChild(this);
                return false;
        }
        //Make all other objects solid
        return true;
    },

    removeParticleEmitter: function(emitter){
        setTimeout(function() {
            me.game.world.removeChild(emitter.emitter);
            me.game.world.removeChild(emitter.emitter.container);
        }, 3000);
    }
});