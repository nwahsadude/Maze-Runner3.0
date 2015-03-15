game.PlayScreen = me.ScreenObject.extend({
	onResetEvent: function () {
		me.levelDirector.loadLevel("map003");

        this.HUD = new game.HUD.Container();

        me.game.world.addChild(this.HUD);

		game.gameReady();
        audioManager.init();
        particleManager.init();
	},

    onDestroyEvent: function(){
        me.game.world.removeChild(this.HUD);
    }
});