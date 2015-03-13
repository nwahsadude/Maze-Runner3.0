
game.HealthEntity = me.Entity.extend({
    init: function(x, y, settings){
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.addShape(new me.Rect(0, 0, 32, 32));
        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;

        this.id = settings.id
        this.body.gravity = 0;

        this.isHealthCoolDown = false;
        this.healthCooldown = game.data.healthCooldown;
    },

    update: function(dt){

        //this.setOpacity(0.5);

        return(this._super(me.Entity, 'update', [dt]));
    },

    onCollision: function(response){
        if(!this.isHealthCoolDown){
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
            this.renderable.alpha = 0.0;
            this.isHealthCoolDown = true;
            game.removeHealthEntity(response.b.id);
            if(game.mainPlayer.health < game.data.health){
                if(game.mainPlayer.health === game.data.health - 1){
                    game.mainPlayer.health = game.data.health;
                    game.updatePlayerHealth({id: game.mainPlayer.id, health: game.mainPlayer.health});
                } else {
                    game.mainPlayer.health += 2;
                    game.updatePlayerHealth({id: game.mainPlayer.id, health: game.mainPlayer.health});
                }
                console.log(game.mainPlayer.health);
            }
            var that = this;

            setTimeout(function() {
                that.isHealthCoolDown = false;
                that.respawn(response);
            }, this.healthCooldown);
        }
        return false;
    },

    respawn: function(response){
        this.body.setCollisionMask(4294967295);
        this.renderable.alpha = 1;
    }
});