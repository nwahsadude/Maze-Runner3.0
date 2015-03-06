/**
 * Created by Shawn on 3/5/2015.
 */

(function(){
   audioManager = {
       init: function(){
           audioManager.playBackgroundMusic(true);
       },

       playBackgroundMusic: function(){
           //me.audio.playTrack("backgroundmusic1",.5 * game.data.volume);
       },

       playSound: function(effect){
           switch(effect){
               case "shoot":
                   me.audio.play("shoot", false, null,.25 * game.data.volume);
                   break;
               case "respawn":
                   me.audio.play("respawn", false, null,.5 * game.data.volume);
                   break;
               default:
                   break;
           }
       }
   }
})();