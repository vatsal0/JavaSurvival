//Basic functions that will be used for game mechanics
function resizeWidth(x) {
    return x/1920 * canvas.width;
}
function resizeHeight(y) {
    return y/1080 * canvas.height;
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
}

//Defining object constructors
function createImage(src,onload) {
    let img = new Image();
    img.src = src;
    if (onload) {
        img.onload = onload;
    }
    return img;
}

function Troop(side, type, x, y, dx, dy, targetX, targetY, fireInterval=1, projectile="bullet") {
    this.side = side;
    this.type = type;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.targetX = targetX;
    this.targetY = targetY;
    this.lastShot  = Date.now();
    this.fireInterval = fireInterval;
    this.projectile = projectile;
}

function Projectile(targetx, targety, speed, aoe, damage) {
    this.targety = targetx;
    this.targety = targety;
    this.speed = speed;
    this.aoe = aoe;
    this.damage = damage;
}

//Get canvas from html
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

//Resize canvas to perfectly fit given space
const pageHeight = window.innerHeight;
const pageWidth = window.innerWidth;
canvas.height = pageHeight;
canvas.width = pageWidth;

//Define variables for image loading
const imagesCount = 12;
let imagesLoaded = 0;

//Define tables for troops
const friendlies = [];
const enemies = [];

//Define variables that will help with troop selection and deployment
let money = 14641;
let currentTroop = 1;
const troops = {1: "Soldier", 2: "Sniper", 3: "Gunner", 4: "Rocket Launcher"};
const costs = {1: 50, 2: 150, 3: 400, 4: 1000};
let lastDeployed = Date.now();
//soldiers cost 50; snipers cost 150; mini gunners cost 400; rocket launchers cost 1000

//Image glow is defined here to prevent scope problems
let glow = 0;

//Define background components and images
let water = createImage("../Assets/Water.png",function() {
    ctx.drawImage(water,canvas.width - resizeWidth(water.width),0,resizeWidth(water.width),resizeHeight(water.height));
    imagesLoaded++;
});

let base = createImage("../Assets/Homebase.png", function() {
    ctx.drawImage(base,0,canvas.height/10,resizeWidth(base.width),resizeHeight(base.height));
    imagesLoaded++;
});

let troopButtons = createImage("../Assets/TroopButton.png", function(){
    for (let i = 0; i < 800; i+= 200) {
        ctx.drawImage(troopButtons, resizeWidth(550 + i), canvas.height-resizeHeight(200), resizeWidth(200), resizeHeight(200));
        ctx.font = "60px Segoe UI";
        let buttonNumber = (i/200 + 1);
        if (buttonNumber === currentTroop) {
            glow = createImage("../Assets/SelectGlow.png", function() {
               ctx.drawImage(glow, resizeWidth(550 + i), canvas.height-resizeHeight(50), resizeWidth(glow.width), resizeHeight(glow.height));
            });
        }
        ctx.fillText("" + buttonNumber, resizeWidth(634 + i), resizeHeight(960), resizeWidth(32));
    }
    imagesLoaded++;
});

let iconSoldier = createImage("../Assets/Icons/Soldier.png", function() {
    ctx.drawImage(iconSoldier,resizeWidth(570.42),resizeHeight(979.76),resizeWidth(iconSoldier.width),resizeHeight(iconSoldier.height));
    imagesLoaded++;
});

const iconSniper = createImage("../Assets/Icons/Sniper.png", function() {
    ctx.drawImage(iconSniper,resizeWidth(770.22),resizeHeight(992.2),resizeWidth(iconSniper.width),resizeHeight(iconSniper.height));
    imagesLoaded++;
});

let iconGunner = createImage("../Assets/Icons/Gunner.png", function() {
    ctx.drawImage(iconGunner,resizeWidth(969.8),resizeHeight(982.78),resizeWidth(iconGunner.width),resizeHeight(iconGunner.height));
    imagesLoaded++;
});

let iconRocketLauncher = createImage("../Assets/Icons/Rocket Launcher.png", function() {
    ctx.drawImage(iconRocketLauncher,resizeWidth(1169.53),resizeHeight(989.33),resizeWidth(iconRocketLauncher.width),resizeHeight(iconRocketLauncher.height));
    imagesLoaded++;
});

//Define images for friendly and enemy troops
let friendlySoldier = createImage("../Assets/Friendlies/Soldier.png", function () {
    imagesLoaded++;
})
let friendlySniper = createImage("../Assets/Friendlies/Sniper.png", function () {
    imagesLoaded++;
});
let friendlyGunner = createImage("../Assets/Friendlies/Gunner.png", function () {
    imagesLoaded++;
});
let friendlyRocketLauncher = createImage("../Assets/Friendlies/Rocket Launcher.png", function () {
    imagesLoaded++;
});
let enemySoldier = createImage("../Assets/Enemies/Soldier.png", function () {
    imagesLoaded++;
});

//Function to draw all background elements defined above, along with some text objects
function drawBackgroundElements() {
    ctx.drawImage(water,canvas.width - resizeWidth(water.width),0,resizeWidth(water.width),resizeHeight(water.height));
    ctx.drawImage(base,0,canvas.height/10,resizeWidth(base.width),resizeHeight(base.height));
    for (let i = 0; i < 800; i+= 200) {
        ctx.drawImage(troopButtons, resizeWidth(550 + i), canvas.height-resizeHeight(200), resizeWidth(200), resizeHeight(200));
        ctx.font = "20px Segoe UI";
        ctx.fillStyle = "black";
        let buttonNumber = (i/200 + 1);
        if (buttonNumber === currentTroop) {
            ctx.drawImage(glow, resizeWidth(550 + i), canvas.height-resizeHeight(50), resizeWidth(glow.width), resizeHeight(glow.height));
        }
        ctx.fillText("" + buttonNumber, resizeWidth(634 + i), resizeHeight(920), resizeWidth(32));
        ctx.fillText("$" +  costs[buttonNumber], resizeWidth(634 + i), resizeHeight(960), resizeWidth(32));
    }
    ctx.drawImage(iconSoldier,resizeWidth(570.42),resizeHeight(979.76),resizeWidth(iconSoldier.width),resizeHeight(iconSoldier.height));
    ctx.drawImage(iconSniper,resizeWidth(770.22),resizeHeight(992.2),resizeWidth(iconSniper.width),resizeHeight(iconSniper.height));
    ctx.drawImage(iconGunner,resizeWidth(969.8),resizeHeight(982.78),resizeWidth(iconGunner.width),resizeHeight(iconGunner.height));
    ctx.drawImage(iconRocketLauncher,resizeWidth(1169.53),resizeHeight(989.33),resizeWidth(iconRocketLauncher.width),resizeHeight(iconRocketLauncher.height));
    ctx.fillStyle = "#39BC6D";
    ctx.font = "60px Segoe UI";
    ctx.fillText("$" + money, 0, resizeHeight(1050), resizeWidth(300));
}

//Function to draw troop based on position, rotation, etc
function drawTroop(troop){
    let rot = Math.atan(troop.dy/troop.dx);
    if (troop.side === "Friendly") {
        let rot = Math.atan(troop.dy/troop.dx);
        let img = friendlySoldier;
        if (troop.type === "Sniper"){
            img = friendlySniper;
        } else if (troop.type === "Gunner") {
            img = friendlyGunner;
        } else if (troop.type === "Rocket Launcher") {
            img = friendlyRocketLauncher;
        }
        ctx.translate(resizeWidth(troop.x+25),resizeHeight(troop.y+25));
        ctx.rotate(rot);
        ctx.drawImage(img, resizeWidth(-25), resizeHeight(-25),resizeWidth(img.width), resizeHeight(img.height));
        ctx.setTransform(1, 0, 0, 1, 0, 0);

    }
    if (troop.side === "Enemy") {
        if (troop.type === "Soldier"){
            ctx.translate(resizeWidth(troop.x+enemySoldier.width-25),resizeHeight(troop.y+enemySoldier.height-25));
            ctx.rotate(rot);
            ctx.drawImage(enemySoldier, resizeWidth(25-enemySoldier.width), resizeHeight(25-enemySoldier.height),resizeWidth(enemySoldier.width), resizeHeight(enemySoldier.height));
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    }
}

//Event handler for selecting different troops (1-4)
document.body.onkeypress = function (key) {
    if (key.keyCode >= 49 && key.keyCode <= 52) {
        currentTroop = key.keyCode - 48;
    }
};

//Handler for clicking to deploy troops
function onClickHandler(e) {
    console.log(Date.now(), lastDeployed, Date.now() - lastDeployed);
    if (money >= costs[currentTroop] && Date.now() - lastDeployed > 2000) {
        lastDeployed = Date.now();
        let targetX = e.pageX*1920/canvas.width;
        let targetY = e.pageY*1080/canvas.height;

        if (targetX > 480 && targetX < 1440 && targetY < 880) {
            console.log(targetX,targetY);
            let dx = 1;
            if (targetY > 540) {
                let dy = -(766-targetY)/(targetX-512);
                friendlies.push(new Troop("Friendly", troops[currentTroop],512,766,dx,dy,targetX, targetY));
            } else {
                let dy = -(258-targetY)/(targetX-512);
                friendlies.push(new Troop("Friendly", troops[currentTroop],512,258,dx,dy,targetX, targetY));
            }
            money -= costs[currentTroop];
        }
    }
}

document.addEventListener("click", onClickHandler, false);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (imagesLoaded >= imagesCount) {
        drawBackgroundElements();
        friendlies.forEach(function(item, index, array) {
            drawTroop(item);
            if (distance(item.x, item.y, item.targetX, item.targetY) > 2) {
                item.x += item.dx;
                item.y += item.dy;
            }

        })
    }

    //go through a table of friendly and enemy troops and draw them based on position

    //update money value
}


setInterval(draw, 100);