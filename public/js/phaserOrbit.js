var config = {width:400,height:300,
    renderer: Phaser.CANVAS,
    parent: 'phaser-box',
    transparent: true,
    antialias: true,
    forceSetTimeOut: true, // отключение raf
    state:this
    
};

var game = new Phaser.Game(config);
var tp_sprite_0;
var tp_sprite_1;

function preload(){
    console.log("preload-->");
    var type = $("#loc-planet").attr("data-planet-type");
    var genus = $("#loc-planet").attr("data-planet-genus");
    if(type == 8) genus = 0;
    console.log(type,genus);
    game.load.image('loc_planet','img/assets/' + type+'-'+genus+'.png');
    
    game.load.image('target_planet_0','img/assets/target_planet_0.png');
    game.load.image('target_planet_1','img/assets/target_planet_1.png');
}

function create(){
    console.log("create-->");
    
    
    
    var planet = game.add.sprite(game.world.centerX,game.world.centerY, 'loc_planet');
    planet.anchor.set(0.5);
    planet.scale.set(0.32);
    
    
    tp_sprite_0 = game.add.sprite(game.world.centerX,game.world.centerY, 'target_planet_0');
    tp_sprite_0.anchor.set(0.5);
    tp_sprite_0.scale.set(3.0);
    var tween_1 = game.add.tween(tp_sprite_0).to( { angle: 180 }, 1000, 'Linear', true);
    game.add.tween(tp_sprite_0.scale).to( { x: 2.0 , y: 2.0}, 1000, 'Linear', true);
    tween_1.repeat(-1,4000);
    
    tp_sprite_1 = game.add.sprite(game.world.centerX,game.world.centerY, 'target_planet_1');
    tp_sprite_1.anchor.set(0.5);
    tp_sprite_1.scale.set(2.0);
    var tween_2 = game.add.tween(tp_sprite_1).to( { angle: -180 }, 1000, 'Linear', true);
    tween_2.repeat(-1, 2000);
}

function update(){
  
  
}

function render() {

    //game.debug.spriteInfo(tp_sprite_0, 32, 32);
}
