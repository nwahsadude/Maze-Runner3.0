game.Bullet = me.Entity.extend({
	init: function(x, y, settings){
		this._super(me.Entity, 'init', [x, y, settings]);
		this.body.addShape(new me.Rect(0, 0, 24, 24));

		this.id = settings.id;
		this.alwaysUpdate = true;
		this.body.gravity = 0;
		this.isCollidable = true;
        this.type = "bullet"

		this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
		this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.ENEMY_OBJECT);

		this.shotAngle = settings.angle;
		this.renderable.angle = this.shotAngle;
		this.maxVelocity = settings.maxVelocity || 15;

		var localX = (settings.target.x - x);
		var localY = (settings.target.y - y);
		var localTargetVector = (new me.Vector2d(localX, localY));
		localTargetVector.normalize();
		localTargetVector.scaleV(new me.Vector2d(this.maxVelocity, this.maxVelocity));
		this.body.setVelocity(localTargetVector.x, localTargetVector.y);

	},

	update: function(dt){
		this.body.vel.x += this.body.accel.x * me.timer.tick;
		this.body.vel.y += this.body.accel.y * me.timer.tick;
		this.body.computeVelocity(this.body.vel);

		if (this.body.vel.x === 0 || this.body.vel.y === 0){
			me.game.world.removeChild(this);
		}

		if (this.body.entity.pos.x <= 0 || this.body.entity.pos.y <= 0 || this.body.entity.pos.x >= 1280 || this.body.entity.pos.y >= 960){
			me.game.world.removeChild(this);
		}

		this.body.update(dt);

        me.collision.check(this);



		this._super(me.Entity, 'update', [dt]);
		return true;
	},

	onCollision: function(response) {
        if (response.a.id != response.b.id){
            switch(response.b.type){
                case "networkPlayer":
                    this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                    me.game.world.removeChild(this);
                    game.hitPlayer(this.id, response.b.id);
                    return false;
                case 4 :
                    this.body.setCollisionMask(me.collision.types.PLAYER_OBJECT);
                    return false;
                default :
                    this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                    me.game.world.removeChild(this);
                    return false;
            }
        } else if(response.a.id === response.b.id){
            return false;

        }
        // Make all other objects solid
		return true;
	}
});

game.networkBullet = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.addShape(new me.Rect(0, 0, 24, 24));

        this.id = settings.id;
        this.alwaysUpdate = true;
        this.body.gravity = 0;
        this.isCollidable = true;
        this.type = "remoteBullet"

		this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
        this.body.setCollisionMask(me.collision.types.WORLD_SHAPE | me.collision.types.PLAYER_OBJECT | me.collision.types.ENEMY_OBJECT);
        //console.log(game.mainPlayer, game.players);

        this.shotAngle = settings.angle;
        this.renderable.angle = this.shotAngle;
        this.maxVelocity = settings.maxVelocity || 15;

        var localX = (settings.target.x - x);
        var localY = (settings.target.y - y);
        var localTargetVector = (new me.Vector2d(localX, localY));
        localTargetVector.normalize();
        localTargetVector.scaleV(new me.Vector2d(this.maxVelocity, this.maxVelocity));
        this.body.setVelocity(localTargetVector.x, localTargetVector.y);

    },

    update: function(dt){
        this.body.vel.x += this.body.accel.x * me.timer.tick;
        this.body.vel.y += this.body.accel.y * me.timer.tick;
        this.body.computeVelocity(this.body.vel);

        if (this.body.vel.x === 0 || this.body.vel.y === 0){
            me.game.world.removeChild(this);
        }

        if (this.body.entity.pos.x <= 0 || this.body.entity.pos.y <= 0 || this.body.entity.pos.x >= 1280 || this.body.entity.pos.y >= 960){
            me.game.world.removeChild(this);
        }

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
        switch(playerTemp.type){
            case "networkPlayer":
                if(playerTemp.id != bulletId){
                    this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                    me.game.world.removeChild(this);
                    return false;
                }
                return false;
            case "mainPlayer" :
                this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                me.game.world.removeChild(this);
                playerTemp.pos.x = playerTemp.pos.x + response.overlapV.x;
                playerTemp.pos.y = playerTemp.pos.y + response.overlapV.y;
                game.scoreHit(playerTemp.id, bulletId);
                return false;
            default :
                this.body.setCollisionMask(me.collision.types.NO_OBJECT);
                me.game.world.removeChild(this);
                return false;
        }
        // Make all other objects solid
        return false;
    }
});