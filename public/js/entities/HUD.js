/**
 * Created by Shawn on 3/5/2015.
 */
game.HUD = game.HUD || {};

game.HUD.Container = me.Container.extend({
    init: function(){
        this._super(me.Container, 'init');

        this.isPersistent = true;

        this.floating = true;

        this.z = Infinity;

        this.name = "HUD";

        this.addChild(new game.HUD.ScoreItem(630, 440));
        this.addChild(new game.HUD.HealthItem(20, 405));
        this.addChild(new game.HUD.DeathItem(20, 440));
    }
});

game.HUD.ScoreItem = me.Renderable.extend({
    init: function(x, y ){
        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        this.font = new me.BitmapFont("32x32_font", 32);
        this.font.set("right");

        this.score = -1;
    },

    update: function(dt){
        if (this.score !== game.data.score){
            this.score = game.data.score;
            return true;
        }
        return false;
    },

    draw: function(renderer){
        this.font.draw(renderer, "SCORE: " + game.data.score, this.pos.x, this.pos.y);
    }
});

game.HUD.HealthItem = me.Renderable.extend({
    init: function(x, y){
        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        this.font = new me.BitmapFont("32x32_font", 32);
        this.font.set("left");

        this.health = -1;
    },

    update: function(dt){
        if (this.health !== game.data.health){
            this.health = game.data.health;
            return true;
        }
        return false
    },

    draw: function(renderer){
        this.font.draw(renderer, "HEALTH: " + game.data.health, this.pos.x, this.pos.y);
    }
});

game.HUD.DeathItem = me.Renderable.extend({
    init: function(x, y){
        this._super(me.Renderable, 'init', [x, y, 10, 10]);

        this.font = new me.BitmapFont("32x32_font", 32);
        this.font.set("left");

        this.death = -1;
    },

    update: function(dt){
        if (this.death !== game.data.death){
            this.death = game.data.death;
            return true;
        }
        return false
    },

    draw: function(renderer){
        this.font.draw(renderer, "DEATHS: " + game.data.death, this.pos.x, this.pos.y);
    }
});