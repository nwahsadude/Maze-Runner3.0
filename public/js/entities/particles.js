/**
 * Created by Shawn on 3/9/2015.
 */

(function (){
    particleManager = {
        init: function(){
            // TODO find out if this is needed.
            this.enableParticles = true;
        },

        playerParticles: function(x, y){

            if(this.enableParticles){
                var image = me.loader.getImage('smoke');
                var that = new me.ParticleEmitter(x, y, {
                    image: image,
                    totalParticles: 1,
                    angle: 0,
                    angleVariation: 0.3490658503988659,
                    minLife: 200,
                    maxLife: 300,
                    speed: 0,
                    speedVariation: 1.5,
                    frequency: 50
                });
                //
                this.name = 'smoke';
                this.z = 3;

                return that;
            } else if (!this.enableParticles){
                console.log("running");
                var image = me.loader.getImage('smoke');
                var that = new me.ParticleEmitter(x, y, {
                    image: image,
                    totalParticles: 0,
                    width: 10,
                    height: 10
                });

                return that;
            }
        },

        bulletParticles: function(x, y){
            if (this.enableParticles){
                var image = me.loader.getImage('smoke');
                var that = new me.ParticleEmitter(x, y, {
                    image: image,
                    totalParticles: 10,
                    width: 10,
                    height: 10,
                    angle: 0,
                    angleVariation: 1.5,
                    minLife: 100,
                    maxLife: 500,
                    speed: 0,
                    speedVariation: 6,
                    minRotation: -3.14159265358979,
                    maxRotation: 3.14159265358979,
                    maxParticles: 50
                });
                this.name = 'smoke';
                this.z = 3;

                return that;
            } else if (!this.enableParticles){
                var image = me.loader.getImage('smoke');
                var that = new me.ParticleEmitter(x, y, {
                    image: image,
                    totalParticles: 0,
                    width: 10,
                    height: 10
                });

                return that;
            }
        },

        switchParticles: function(){
            if(this.enableParticles){
                this.enableParticles = false;
                document.getElementById("particleSwitch").textContent = "Enable Particles";
            } else if (!this.enableParticles){
                this.enableParticles = true;
                document.getElementById("particleSwitch").textContent = "Disable Particles";
            }
        }
    }


})();