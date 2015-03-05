game.PlayScreen = me.ScreenObject.extend({
	onResetEvent: function () {
		me.levelDirector.loadLevel("map002");
    console.log(game);
        this.HUD = new game.HUD.Container();

        me.game.world.addChild(this.HUD);

		game.gameReady();
	},

    onDestroyEvent: function(){
        me.game.world.removeChild(this.HUD);
    }
});