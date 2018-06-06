const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const pageHeight = window.innerHeight;
const pageWidth = window.innerWidth;
canvas.height = pageHeight;
canvas.width = pageWidth;

const water = createImage("../Assets/Water.png",function() {
    ctx.drawImage(water,canvas.width - resizeWidth(water.width),0,resizeWidth(water.width),resizeHeight(water.height));
});

const base = createImage("../Assets/Homebase.png", function() {
    ctx.drawImage(base,0,canvas.height/10,resizeWidth(base.width),resizeHeight(base.height));
});

const troopButton = createImage("../Assets/TroopButton.png", function(){
    for (let i = 0; i < 800; i+= 200) {
        ctx.drawImage(troopButton, resizeWidth(550 + i), canvas.height-resizeHeight(200), resizeWidth(200), resizeHeight(200))
    }
});

const iconSoldier = createImage("../Assets/Homies/Soldier.png", function() {
    ctx.drawImage(iconSoldier,resizeWidth(570.42),resizeHeight(979.76),resizeWidth(iconSoldier.width),resizeHeight(iconSoldier.height));
});

const iconSniper = createImage("../Assets/Homies/Sniper.png", function() {
    ctx.drawImage(iconSniper,resizeWidth(770.22),resizeHeight(992.2),resizeWidth(iconSniper.width),resizeHeight(iconSniper.height));
});

const iconMinigunner = createImage("../Assets/Homies/Minigunner.png", function() {
    ctx.drawImage(iconMinigunner,resizeWidth(969.8),resizeHeight(982.78),resizeWidth(iconMinigunner.width),resizeHeight(iconMinigunner.height));
});

const iconRocketLauncher = createImage("../Assets/Homies/Rocket Launcher.png", function() {
    ctx.drawImage(iconRocketLauncher,resizeWidth(1169.53),resizeHeight(989.33),resizeWidth(iconRocketLauncher.width),resizeHeight(iconRocketLauncher.height));
});

function displayBase() {
    ctx.drawImage(base,100,100);
}

function resizeWidth(x) {
    return x/1920 * canvas.width;
}
function resizeHeight(y) {
    return y/1080 * canvas.height;
}

function createImage(src,onload) {
    let img = new Image();
    img.src = src;
    if (onload) {
        img.onload = onload;
    }
    return img;
}

