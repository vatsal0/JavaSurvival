//Get canvas from html
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


//Resize canvas to perfectly fit given space
const pageHeight = window.innerHeight;
const pageWidth = window.innerWidth;
canvas.height = pageHeight;
canvas.width = pageWidth;

//Define variables for image loading
const imagesCount = 21;
let imagesLoaded = 0;

//Define tables for troops
const friendlies = [];
const enemies = [];
const projectiles = [];
let rafts = [];


//Define variables that will help with troop selection and deployment
let money = 1000000;
let currentTroop = 1;
const troops = {1: "Soldier", 2: "Sniper", 3: "Gunner", 4: "Rocket Launcher"};
const costs = {1: 50, 2: 150, 3: 400, 4: 1000};
const fireIntervals = {"Soldier": 400, "Sniper": 5000, "Gunner": 100, "Rocket Launcher": 2000};
const healths = {"Soldier": 100, "Sniper": 40, "Gunner": 400, "Rocket Launcher" : 150};
const damages = {"Soldier": 25, "Sniper": 250, "Gunner": 10, "Rocket Launcher" : 100};
const ranges = {"Soldier": 400, "Sniper": 1200, "Gunner": 250, "Rocket Launcher" : 600};

let lastDeployed = Date.now();
//soldiers cost 50; snipers cost 150; mini gunners cost 400; rocket launchers cost 1000


const round1 = [["Soldier",5],["Soldier",5],["Soldier",5],["Soldier",5]];

const rounds = [];
/*
Round 1:
30 Soldiers

Round 2:
20 Soldiers, 10 Snipers

Round 3: 10 Soldiers, 10 Snipers, 20 Gunners

Round 4: 30 Gunners, 20 Snipers, 10 Rocket Launchers

Round 5: 40 Gunners, 40 Rocket Launchers
 */

//Image glow is defined here to prevent scope problems
let glow;

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
function createImage(src,func) {
    let img = new Image();
    img.src = src;
    if (func) {
        img.onload = func;
    }
    return img;
}

function Troop(side, type, x, y, dx, dy, targetX, targetY) {
    this.side = side;
    this.type = type;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.targetX = targetX;
    this.targetY = targetY;
    this.lastShot  = Date.now();
    this.fireInterval = fireIntervals[type];
    this.maxHealth = healths[type];
    this.health = this.maxHealth;
    this.damage = damages[type];
    this.range = ranges[type];
}

function Raft(img, x, y) {
    this.img = img;
    this.x = x;
    this.y = y;
}

function Projectile(side, type, x, y, dx, dy, aoe, damage) {
    this.side = side;
    this.type = type;
    this.state = "active";
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.aoe = aoe;
    this.damage = damage;

}

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
});
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
let enemySniper = createImage("../Assets/Enemies/Sniper.png", function () {
    imagesLoaded++;
});
let enemyGunner = createImage("../Assets/Enemies/Gunner.png", function () {
    imagesLoaded++;
});
let enemyRocketLauncher = createImage("../Assets/Enemies/Rocket Launcher.png", function () {
    imagesLoaded++;
});
let barOutline = createImage("../Assets/Health/BarOutline.png", function () {
    imagesLoaded++;
});
let bar = createImage("../Assets/Health/Bar.png", function () {
    imagesLoaded++;
});
let raft1 = createImage("../Assets/Rafts/Raft1.png", function () {
    imagesLoaded++;
});
let raft2 = createImage("../Assets/Rafts/Raft2.png", function () {
    imagesLoaded++;
});
let raft3 = createImage("../Assets/Rafts/Raft3.png", function () {
    imagesLoaded++;
});
let raft4 = createImage("../Assets/Rafts/Raft4.png", function () {
    imagesLoaded++;
});
let bullet = createImage("../Assets/Bullet.png", function(){
    imagesLoaded++;
});
let rocket = createImage("../Assets/Rocket.png", function(){
    imagesLoaded++;
});


let raftsList = {"Soldier": raft1, "Sniper": raft2, "Gunner": raft3, "Rocket Launcher": raft4};
let friendlyTroopsList = {"Soldier": friendlySoldier, "Sniper": friendlySniper, "Gunner": friendlyGunner, "Rocket Launcher": friendlyRocketLauncher};
let enemyTroopsList = {"Soldier": enemySoldier, "Sniper": enemySniper, "Gunner": enemyGunner, "Rocket Launcher": enemyRocketLauncher};


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

function drawProjectile(proj){
    let rot = Math.atan2(proj.dy,proj.dx);
    if(proj.side === "Friendly"){
        if(proj.type === "Bullet"){
            let img = bullet;
            ctx.translate(resizeWidth(proj.x), resizeHeight(proj.y));
            ctx.rotate(rot);
            ctx.drawImage(img, 0, 0, img.width, resizeHeight(img.height));
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            for (let i = 0; i < enemies.length; i++) {
                let enemy = enemies[i];
                console.log(distance(proj.x, proj.y,enemy.x, enemy.y), proj.aoe);
                if (distance(proj.x, proj.y,enemy.x, enemy.y) < proj.aoe) {
                    enemy.health -= proj.damage;
                    if (enemy.health <= 0) {
                        enemies.splice(i, 1);
                    }
                    for (let i = 0; i < projectiles.length; i++) {
                        if (projectiles[i] === proj) {
                            projectiles.splice(i,1);
                        }
                    }
                }
            }

        }
        else if(proj.type === "Rocket"){
            let img = rocket;
            ctx.translate(resizeWidth(proj.x), resizeHeight(proj.y));
            ctx.rotate(rot);
            ctx.drawImage(img, 0, 0, img.width, resizeHeight(img.height));
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            for (let i = 0; i < enemies.length; i++) {
                let enemy = enemies[i];
                console.log(distance(proj.x, proj.y,enemy.x, enemy.y), proj.aoe);
                if (distance(proj.x, proj.y,enemy.x, enemy.y) < proj.aoe) {
                    enemy.health -= proj.damage;
                    if (enemy.health <= 0) {
                        enemies.splice(i, 1);
                    }
                    for (let i = 0; i < projectiles.length; i++) {
                        if (projectiles[i] === proj) {
                            projectiles.splice(i,1);
                        }
                    }
                }
            }
        }

    }
    if(proj.side === "Enemy"){
        let img = proj;
    }

}


function drawTroop(troop){
    let rot = Math.atan(troop.dy/troop.dx);
    if (troop.side === "Friendly") {
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
        let healthRatio = troop.health/troop.maxHealth;
        let currentStyle = ctx.fillStyle;
        let g = 255 * healthRatio;
        let r = 255-g;
        ctx.fillStyle = "rgb(" + r + "," + g + ",0)";
        ctx.drawImage(barOutline, resizeWidth(troop.x - 5), resizeHeight(troop.y - 20), resizeWidth(barOutline.width), resizeHeight(barOutline.height));
        ctx.fillRect(resizeWidth(troop.x - 4), resizeHeight(troop.y - 21), resizeWidth(bar.width)*healthRatio, resizeHeight(bar.height));
        ctx.fillStyle = currentStyle;
    }
    if (troop.side === "Enemy") {
        let img = enemySoldier;
        if (troop.type === "Sniper"){
            img = enemySniper;
        } else if (troop.type === "Gunner") {
            img = enemyGunner;
        } else if (troop.type === "Rocket Launcher") {
            img = enemyRocketLauncher;
        }
        ctx.translate(resizeWidth(troop.x+img.width-25),resizeHeight(troop.y+img.height-25));
        ctx.rotate(-rot);
        ctx.drawImage(img, resizeWidth(25-img.width), resizeHeight(25-img.height),resizeWidth(img.width), resizeHeight(img.height));
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let healthRatio = troop.health/troop.maxHealth;
        let currentStyle = ctx.fillStyle;
        let g = 255 * healthRatio;
        let r = 255-g;
        ctx.fillStyle = "rgb(" + r + "," + g + ",0)";
        ctx.drawImage(barOutline, resizeWidth(troop.x + img.width - 55), resizeHeight(troop.y - 20), resizeWidth(barOutline.width), resizeHeight(barOutline.height));
        ctx.fillRect(resizeWidth(troop.x + img.width - 54), resizeHeight(troop.y - 21), resizeWidth(bar.width)*healthRatio, resizeHeight(bar.height));
        ctx.fillStyle = currentStyle;
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
    if (money >= costs[currentTroop] && Date.now() - lastDeployed > 2000) {
        lastDeployed = Date.now();
        let targetX = e.pageX*1920/canvas.width;
        let targetY = e.pageY*1080/canvas.height;

        if (targetX > 480 && targetX < 1440 && targetY < 880) {
            let dx = .2;
            if (targetY > 540) {
                let dy = -.2 * (766-targetY)/(targetX-512);
                friendlies.push(new Troop("Friendly", troops[currentTroop],512,766,dx,dy,targetX, targetY));
            } else {
                let dy = -.2 * (258-targetY)/(targetX-512);
                friendlies.push(new Troop("Friendly", troops[currentTroop],512,258,dx,dy,targetX, targetY));
            }
            money -= costs[currentTroop];
        }
    }
}

document.addEventListener("click", onClickHandler, false);
function slow(){
    money += 10;
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    friendlies.forEach(function(friendly) {
        enemies.forEach(function(enemy){
           if (distance(friendly.x, friendly.y,enemy.x, enemy.y) < friendly.range && Date.now() - friendly.lastShot > friendly.fireInterval) {
               friendly.lastShot = Date.now();
               let w = friendlyTroopsList[friendly.type].width;
               let h = friendlyTroopsList[friendly.type].width;
               friendly.dx = enemy.x - friendly.x;
               friendly.dy = enemy.y - friendly.y;
               let angle = Math.atan2(friendly.dy, friendly.dx);
               friendly.targetX = friendly.x;
               friendly.targetY = friendly.y;
               let type = "Bullet";
               let aoe = 40;
               let fac = 2.5;
               if (friendly.type === "Rocket Launcher") {
                   type = "Rocket";
                   aoe = 100;
                   let fac = 1;
               }
               let p = new Projectile("Friendly", type, friendly.x + w*Math.cos(angle), friendly.y + h*Math.sin(angle), fac,fac*friendly.dy/friendly.dx, aoe, damages[friendly.type]);
               //console.log(p.x,p.y);
               projectiles.push(p);
           }
        });
    });


    projectiles.forEach(function(p) {
        //console.log(p.x, p.y);
       drawProjectile(p);
       p.x += p.dx;
       p.y += p.dy;
    });
    if (imagesLoaded >= imagesCount) {
        drawBackgroundElements();
        friendlies.forEach(function(item) {
            drawTroop(item);
            if (distance(item.x, item.y, item.targetX, item.targetY) > 2) {
                item.x += item.dx;
                item.y += item.dy;
            }

        });
       enemies.forEach(function(item) {
            drawTroop(item);
            if (distance(item.x, item.y, item.targetX, item.targetY) > 2) {
                item.x += item.dx;
                item.y -= item.dy;
            }

        });
        rafts.forEach(function(item) {
            ctx.drawImage(item.img, resizeWidth(item.x), resizeHeight(item.y), resizeWidth(raft1.width), resizeHeight(raft1.height));
        });
    }

    //go through a table of friendly and enemy troops and draw them based on position

    //update money value
}
setInterval(slow, 1000);
setInterval(draw, 10);


setTimeout(function() {
    rafts = [];
    let raftTroops = [];
    //[[Soldier,30], [Sniper,10]]
    for (let i=0; i < round1.length; i++) {
        raftTroops.push([round1[i][0], round1[i][1]]);
    }
    for (let x=1; x<= raftTroops.length; x++) {
        let soldierType = raftTroops[x-1][0];
        let img = raftsList[soldierType];
        let raftPos = x/(raftTroops.length + 1) * 1080;
        let troopsDeployed = 0;
        let troopCount = raftTroops[x-1][1];
        let deployEnemy = setInterval(function() {
            troopsDeployed++;
            if (troopsDeployed === troopCount) {
                clearInterval(deployEnemy);
            }
            let enemyImg = enemyTroopsList[soldierType];
            enemies.push(new Troop("Enemy", soldierType, 1720 - enemyImg.width, raftPos-25,-.2,0,480,raftPos-25));
        },5000);
        rafts.push(new Raft(img, 1720, raftPos-40));
    }
    //side, type, x, y, dx, dy, targetX, targetY;
}, 1000);
