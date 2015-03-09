/**
 * Created by Shawn on 3/7/2015.
 */
game.HealthEntity = me.CollectableEntity.extend({
    init: function (x, y, settings) {
        this._super(me.CollectableEntity, 'init', [x, y, settings]);
        this.body.addShape(new me.Rect(0, 0, 32, 32));
        this.body.gravity = 0;
        this.body.collisionType = me.collision.types.COLLECTABLE_OBJECT;

    },
    update: function(dt){

    },
    onCollision: function(response){
        if (response.a.type === "mainPlayer"){
            this.body.setCollisionMask(me.collision.types.NO_OBJECT);
            me.game.world.removeChild(this);
            console.log(game.mainPlayer.health);
            game.mainPlayer.health += 2;
            console.log(game.mainPlayer.health);
            return false;
        }
    }

});