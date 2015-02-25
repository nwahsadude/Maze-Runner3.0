game.PlayScreen = me.ScreenObject.extend({
	onResetEvent: function () {
		me.levelDirector.loadLevel("map002");

		game.gameReady();
	}
});