var config = {width:901,height:441,
    renderer: Phaser.CANVAS,
    parent: 'phaser-box',
    transparent: true,
    antialias: true,
    forceSetTimeOut: true, // отключение raf
    state:this
    
};

var game = new Phaser.Game(config);

var ph_tp_sprite_0;
var ph_tp_sprite_1;
var ph_text_info = {name:"",type:"",pos:"",owner:""};

function preload(){
    console.log("preload-->");
    //game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    var type = $("#loc-planet").attr("data-planet-type");
    var genus = $("#loc-planet").attr("data-planet-genus");
    ph_text_info.owner = $("#loc-planet").attr("data-planet-owner");
    ph_text_info.name = $("#loc-planet").attr("data-planet-name");
    ph_text_info.type = "Планеты,земного типа";
    ph_text_info.pos = 5
    
    if(type == 8) genus = 0;
    game.load.image('loc_planet','img/assets/' + type+'-'+genus+'.png');
    
    game.load.image('target_planet_0','img/assets/target_planet_0.png');
    game.load.image('target_planet_1','img/assets/target_planet_1.png');
}

function create(){
    console.log("create-->");
        
    var planet = game.add.sprite(game.world.centerX,game.world.centerY, 'loc_planet');
    planet.anchor.set(0.5);
    planet.scale.set(0.32);
    
    
    ph_tp_sprite_0 = game.add.sprite(game.world.centerX,game.world.centerY, 'target_planet_0');
    ph_tp_sprite_0.anchor.set(0.5);
    ph_tp_sprite_0.scale.set(3.0);
    var tween_1 = game.add.tween(ph_tp_sprite_0).to( { angle: 180 }, 1000, 'Linear', true);
    game.add.tween(ph_tp_sprite_0.scale).to( { x: 2.0 , y: 2.0}, 1000, 'Linear', true);
    tween_1.repeat(-1,4000);
    
    ph_tp_sprite_1 = game.add.sprite(game.world.centerX,game.world.centerY, 'target_planet_1');
    ph_tp_sprite_1.anchor.set(0.5);
    ph_tp_sprite_1.scale.set(2.0);
    var tween_2 = game.add.tween(ph_tp_sprite_1).to( { angle: -180 }, 1000, 'Linear', true);
    tween_2.repeat(-1, 2000);
    
    var text = game.add.text(game.world.centerX, game.world.centerY+(ph_tp_sprite_1.width/100)*70,
    

    ""+ph_text_info.name+"\n"+
    ""+ph_text_info.type+"\n"+
    "позиция : "+ph_text_info.pos+"\n"+
    "владелец : "+ph_text_info.owner);
    
    text.anchor.setTo(0.5, 0);
    text.font = "Jura";
    text.fontSize = "1rem";
    text.lineSpacing ="-2"
    text.fill = '#7482a2';
    text.align = 'center';
    text.stroke = '#000000';
    text.strokeThickness = 2;
    
    
    //text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);rgb(37, 177, 246)"#7482a2"#21b1f6
    
}

function update(){
  
  
}

function render() {

    //game.debug.spriteInfo(tp_sprite_0, 32, 32);
}
