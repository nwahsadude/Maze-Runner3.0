/**
 * Created by Shawn on 3/9/2015.
 */

game.playerParticles = me.ParticleEmitter.extend({
    init: function(x, y, settings){
        this._super(me.ParticleEmitter, 'init', [x, y, settings]);
        var image = me.loader.getImage('smoke');
        this.image = image;
        this.totalParticles = 200;
        this.angle = 0;
        this.angleVariation = 0.3490658503988659;
        this.minLife = 200;
        this.maxLife = 300;
        this.speed = 0;
        this.speedVariation = 1.5;
        this.frequency = 50;
        this.emitter.name = 'smoke';
        this.emitter.z = 4
        me.game.world.addChild(this.emitter);
        me.game.world.addChild(this.emitter.container);
        this.emitter.streamParticles();
    }
});

game.playerParticles = new me.ParticleEmitter()

//var x = this.pos.x + 16;
//var y = this.pos.y + 16;
//var image = me.loader.getImage('smoke');
//this.emitter = new me.ParticleEmitter(x, y, {
//    image: image,
//    totalParticles: 200,
//    angle: 0,
//    angleVariation: 0.3490658503988659,
//    minLife: 200,
//    maxLife: 300,
//    speed: 0,
//    speedVariation: 1.5,
//    frequency: 50
//});
//this.emitter.name = 'smoke';
//this.emitter.z = 4;
//me.game.world.addChild(this.emitter);
//me.game.world.addChild(this.emitter.container);
//this.emitter.streamParticles();