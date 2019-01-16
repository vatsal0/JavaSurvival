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
const impacts = [];
let rafts = [];
//Define variables that will help with troop selection and deployment
let money = 3000;
let currentTroop = 1;
const troops = {1: "Soldier", 2: "Sniper", 3: "Gunner", 4: "Rocket Launcher"};
const costs = {1: 50, 2: 150, 3: 400, 4: 1000};
const fireIntervals = {"Soldier": 400, "Sniper": 3000, "Gunner": 100, "Rocket Launcher": 2000};
const healths = {"Soldier": 100, "Sniper": 40, "Gunner": 900, "Rocket Launcher" : 150};
const damages = {"Soldier": 25, "Sniper": 75, "Gunner": 10, "Rocket Launcher" : 100};
const ranges = {"Soldier": 400, "Sniper": 1200, "Gunner": 2500, "Rocket Launcher" : 6000};
const spreads = {"Soldier": 4, "Sniper": 0, "Gunner": 10, "Rocket Launcher" : 2};

let lastDeployed = Date.now();
let baseMaxHealth = 10000;
let baseHealth = baseMaxHealth;
//soldiers cost 50; snipers cost 150; mini gunners cost 400; rocket launchers cost 1000

const round1 = [["Soldier",5],["Soldier",5],["Soldier",5],["Soldier",5], ["Sniper", 3], ["Sniper", 3]];

const rounds = [
    [["Soldier",4]],
    [["Soldier",5],["Soldier",5],["Soldier",5],["Soldier",5], ["Sniper", 3], ["Sniper", 3]],
    [["Gunner", 2],["Gunner",2], ["Gunner",2], ["Sniper", 5], ["Sniper",5]]
];
let roundNumber = 1;


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
    this.centerX = x;
    this.centerY = y;
    this.spread = spreads[type];
    this.canMove = function() {
        let self = this;
      if (this.side === "Friendly") {
          let closest = "none";
          let prox = 100000;
          friendlies.forEach(function(other) {
              let d = distance(self.x, self.y, other.x, other.y);
              if (d < prox && other !== self) {
                  closest = other;
                  prox = d;
              }
          });
          return (this.x >= closest.x || prox > 100) && this.x < 1350;
      } else if (this.side === "Enemy") {
          let closest = "none";
          let prox = 100000;
          enemies.forEach(function(other) {
              let d = distance(self.x, self.y, other.x, other.y);
              if (d < prox && other !== self) {
                  closest = other;
                  prox = d;
              }
          });
          return (this.x <= closest.x || prox > 100);
      }

    };
    this.move = function () {
        if (this.canMove()) {
            this.x += this.dx;
            this.y += this.dy;
            this.centerX = this.x;
            this.centerY = this.y;
            let rotation = Math.atan(this.dy/this.dx);
            if (this.side === "Friendly") {
                this.centerX += 35.3553391 * Math.cos(rotation + Math.PI/4);
                this.centerY += 35.3553391 * Math.sin(rotation + Math.PI/4);
            } else {
                rotation *= -1;
                this.centerX += enemyTroopsList[this.type].width;
                this.centerX -= 35.3553391 * Math.cos(rotation + Math.PI/4);
                this.centerY += 35.3553391 * Math.sin(rotation + Math.PI/4);
            }
        }
    }
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

function Impact(side, x, y, radius, damage) {
    this.side = side;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.transparency = 1;
    this.damage = damage;
}
//Define background components and images
let water = createImage("Assets/Water.png",function() {
    ctx.drawImage(water,canvas.width - resizeWidth(water.width),0,resizeWidth(water.width),resizeHeight(water.height));
    imagesLoaded++;
});
let base = createImage("Assets/Homebase.png", function() {
    ctx.drawImage(base,0,canvas.height/10,resizeWidth(base.width),resizeHeight(base.height));
    imagesLoaded++;
});
let troopButtons = createImage("Assets/TroopButton.png", function(){
    for (let i = 0; i < 800; i+= 200) {
        ctx.drawImage(troopButtons, resizeWidth(550 + i), canvas.height-resizeHeight(200), resizeWidth(200), resizeHeight(200));
        ctx.font = "60px Segoe UI";
        let buttonNumber = (i/200 + 1);
        if (buttonNumber === currentTroop) {
            glow = createImage("Assets/SelectGlow.png", function() {
               ctx.drawImage(glow, resizeWidth(550 + i), canvas.height-resizeHeight(50), resizeWidth(glow.width), resizeHeight(glow.height));
            });
        }
        ctx.fillText("" + buttonNumber, resizeWidth(634 + i), resizeHeight(960), resizeWidth(32));
    }
    imagesLoaded++;
});
let iconSoldier = createImage("Assets/Icons/Soldier.png", function() {
    ctx.drawImage(iconSoldier,resizeWidth(570.42),resizeHeight(979.76),resizeWidth(iconSoldier.width),resizeHeight(iconSoldier.height));
    imagesLoaded++;
});
const iconSniper = createImage("Assets/Icons/Sniper.png", function() {
    ctx.drawImage(iconSniper,resizeWidth(770.22),resizeHeight(992.2),resizeWidth(iconSniper.width),resizeHeight(iconSniper.height));
    imagesLoaded++;
});
let iconGunner = createImage("Assets/Icons/Gunner.png", function() {
    ctx.drawImage(iconGunner,resizeWidth(969.8),resizeHeight(982.78),resizeWidth(iconGunner.width),resizeHeight(iconGunner.height));
    imagesLoaded++;
});
let iconRocketLauncher = createImage("Assets/Icons/Rocket Launcher.png", function() {
    ctx.drawImage(iconRocketLauncher,resizeWidth(1169.53),resizeHeight(989.33),resizeWidth(iconRocketLauncher.width),resizeHeight(iconRocketLauncher.height));
    imagesLoaded++;
});
//Define images for friendly and enemy troops
let friendlySoldier = createImage("Assets/Friendlies/Soldier.png", function () {
    imagesLoaded++;
});
let friendlySniper = createImage("Assets/Friendlies/Sniper.png", function () {
    imagesLoaded++;
});
let friendlyGunner = createImage("Assets/Friendlies/Gunner.png", function () {
    imagesLoaded++;
});
let friendlyRocketLauncher = createImage("Assets/Friendlies/Rocket Launcher.png", function () {
    imagesLoaded++;
});
let enemySoldier = createImage("Assets/Enemies/Soldier.png", function () {
    imagesLoaded++;
});
let enemySniper = createImage("Assets/Enemies/Sniper.png", function () {
    imagesLoaded++;
});
let enemyGunner = createImage("Assets/Enemies/Gunner.png", function () {
    imagesLoaded++;
});
let enemyRocketLauncher = createImage("Assets/Enemies/Rocket Launcher.png", function () {
    imagesLoaded++;
});
let barOutline = createImage("Assets/Health/BarOutline.png", function () {
    imagesLoaded++;
});
let bar = createImage("Assets/Health/Bar.png", function () {
    imagesLoaded++;
});
let raft1 = createImage("Assets/Rafts/Raft1.png", function () {
    imagesLoaded++;
});
let raft2 = createImage("Assets/Rafts/Raft2.png", function () {
    imagesLoaded++;
});
let raft3 = createImage("Assets/Rafts/Raft3.png", function () {
    imagesLoaded++;
});
let raft4 = createImage("Assets/Rafts/Raft4.png", function () {
    imagesLoaded++;
});
let bullet = createImage("Assets/Bullet.png", function(){
    imagesLoaded++;
});
let rocket = createImage("Assets/Rocket.png", function(){
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
    ctx.font = "60px Segoe UI";
    if (baseHealth <= 0) {
        baseHealth = 0;
        ctx.fillText("You lose!", 0, 50, 200);
    } else if (roundNumber > 0) {
        ctx.fillText("Round " + roundNumber, 0, 50,200);
    } else {
        ctx.fillText("You win!", 0, 50,200);
    }
    ctx.font = "30px Tw Cen MT";
    ctx.fillText("HP: " + baseHealth + "/" + baseMaxHealth, resizeWidth(128), resizeHeight(555), resizeWidth(223));

    ctx.drawImage(iconSoldier,resizeWidth(570.42),resizeHeight(979.76),resizeWidth(iconSoldier.width),resizeHeight(iconSoldier.height));
    ctx.drawImage(iconSniper,resizeWidth(770.22),resizeHeight(992.2),resizeWidth(iconSniper.width),resizeHeight(iconSniper.height));
    ctx.drawImage(iconGunner,resizeWidth(969.8),resizeHeight(982.78),resizeWidth(iconGunner.width),resizeHeight(iconGunner.height));
    ctx.drawImage(iconRocketLauncher,resizeWidth(1169.53),resizeHeight(989.33),resizeWidth(iconRocketLauncher.width),resizeHeight(iconRocketLauncher.height));
    ctx.fillStyle = "#39BC6D";

    ctx.fillText("$" + money, 0, resizeHeight(1050), resizeWidth(300));

}

//Function to draw troop based on position, rotation, etc

function drawProjectile(proj){
    let rot = Math.atan2(proj.dy,proj.dx);
    let img = bullet;
    if (proj.type === "Rocket") {
        img = rocket;
    }
    if(proj.side === "Friendly"){
        ctx.translate(resizeWidth(proj.x), resizeHeight(proj.y));
        ctx.rotate(rot);
        ctx.drawImage(img, 0, 0, img.width, resizeHeight(img.height));
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (let i = 0; i < enemies.length; i++) {
            let enemy = enemies[i];
            if (distance(proj.x, proj.y,enemy.centerX, enemy.centerY) < 25) {
                enemy.health -= proj.damage;
                if (proj.type !== "Bullet") {
                    impacts.push(new Impact("Friendly",proj.x, proj.y, proj.aoe, proj.damage/2));
                }
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
    if(proj.side === "Enemy"){
        ctx.translate(resizeWidth(proj.x), resizeHeight(proj.y));
        ctx.rotate(rot);
        ctx.drawImage(img, 0, 0, img.width, resizeHeight(img.height));
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (let i = 0; i < friendlies.length; i++) {
            let friendly = friendlies[i];
            if (distance(proj.x, proj.y,friendly.centerX, friendly.centerY) < 25) {
                friendly.health -= proj.damage;
                if (proj.type !== "Bullet") {
                    impacts.push(new Impact("Enemy",proj.x, proj.y, proj.aoe, proj.damage/2));
                }
                if (friendly.health <= 0) {
                    friendlies.splice(i, 1);
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
    //ctx.fillRect(resizeWidth(troop.centerX),resizeHeight(troop.centerY),50,50);
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
    money += 50;
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < friendlies.length; i++) {
        let friendly = friendlies[i];
        let target;
        let closestDist = 10000;
        enemies.forEach(function(enemy){
            let d = distance(friendly.x, friendly.y,enemy.x, enemy.y);
            if (d < friendly.range && d < closestDist && Date.now() - friendly.lastShot > friendly.fireInterval) {
                closestDist =  d;
                target = enemy;
            }
        });
        if (target) {
            friendly.lastShot = Date.now();
            let w = friendlyTroopsList[friendly.type].width;
            let h = friendlyTroopsList[friendly.type].width;
            let acc = friendly.spread * Math.PI/180;
            friendly.dx = (target.centerX - friendly.centerX);
            friendly.dy = (target.centerY - friendly.centerY);
            let angle = Math.atan(friendly.dy/friendly.dx) + (Math.random()*acc*2 - acc);
            friendly.dx = Math.cos(angle);
            friendly.dy = Math.sin(angle);
            friendly.targetX = friendly.x;
            friendly.targetY = friendly.y;
            let type = "Bullet";
            let aoe = 40;
            let fac = 12;
            if (friendly.type === "Rocket Launcher") {
                type = "Rocket";
                aoe = 100;
                fac = 3;
            }
            let p = new Projectile("Friendly", type, friendly.centerX, friendly.centerY, fac,fac*friendly.dy/friendly.dx, aoe, damages[friendly.type]);
            projectiles.push(p);
        } else if (friendly.targetX === friendly.x && friendly.targetY === friendly.y && Date.now() - friendly.lastShot > 1000){
            console.log("no target");
            friendly.targetX = 1800;
            friendly.targetY = friendly.y;
            friendly.dx = .2;
            friendly.dy = 0;
        }
        impacts.forEach(function(impact){
            if (impact.side === "Enemy" && distance(impact.x, impact.y, friendly.centerX, friendly.centerY) < impact.radius + 25 && impact.transparency >= .99) {
                friendly.health -= impact.damage;
                if (friendly.health <= 0) {
                    friendlies.splice(i,1);
                }
            }
        });
    }
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        let target;
        let closestDist = 10000;
        friendlies.forEach(function(friendly){
            let d = distance(enemy.x, enemy.y,friendly.x, friendly.y);
            if (d < enemy.range && d < closestDist && Date.now() - enemy.lastShot > enemy.fireInterval) {
                closestDist =  d;
                target = friendly;
            }
        });
        if (target) {
            enemy.lastShot = Date.now();
            let w = enemyTroopsList[enemy.type].width;
            let h = enemyTroopsList[enemy.type].width;
            let acc = enemy.spread * Math.PI/180;
            enemy.dx = (target.centerX - enemy.centerX);
            enemy.dy = (target.centerY - enemy.centerY);
            let angle = -1 * Math.atan(enemy.dy/enemy.dx) + (Math.random()*acc*2 - acc);
            enemy.dx = Math.cos(angle);
            enemy.dy = Math.sin(angle);
            enemy.targetX = enemy.x;
            enemy.targetY = enemy.y;
            let type = "Bullet";
            let aoe = 40;
            let fac = -5;
            if (enemy.type === "Rocket Launcher") {
                type = "Rocket";
                aoe = 100;
                fac = -1;
            }
            let p = new Projectile("Enemy", type, enemy.centerX, enemy.centerY, fac,-fac*enemy.dy/enemy.dx, aoe, damages[enemy.type]);
            projectiles.push(p);
        } else if (enemy.targetX === enemy.x && enemy.targetY === enemy.y && Date.now() - enemy.lastShot > 1000){
            enemy.targetX = 0;
            enemy.targetY = enemy.y;
            enemy.dx = -.2;
            enemy.dy = 0;
        }
        impacts.forEach(function(impact){
            if (impact.side === "Friendly" && distance(impact.x, impact.y, enemy.centerX, enemy.centerY) < impact.radius + 25 && impact.transparency >= .99) {
                enemy.health -= impact.damage;
                if (enemy.health <= 0) {
                    enemies.splice(i,1);
                }
            }
        });
    }

    for (let i = 0; i < projectiles.length; i++) {
        let p = projectiles[i];
        drawProjectile(p);
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > 1920) {
            projectiles.splice(i,1);
        }
    }
    if (imagesLoaded >= imagesCount) {
        drawBackgroundElements();
        if (baseHealth <= 0) {
            return;
        }
        friendlies.forEach(function(item) {
            drawTroop(item);
            if (distance(item.x, item.y, item.targetX, item.targetY) > 2) {
                item.move();
            }

        });
        for (let i = 0; i < enemies.length; i++) {
            let enemy = enemies[i];
            if (enemy.x < 500) {
                enemies.splice(i,1);
                baseHealth -= ((10000/enemy.fireInterval) * enemy.damage);
            }
        }
        enemies.forEach(function(item) {
            drawTroop(item);
            if (distance(item.x, item.y, item.targetX, item.targetY) > 2) {
                item.move();
            }

        });
        rafts.forEach(function(item) {
            ctx.drawImage(item.img, resizeWidth(item.x), resizeHeight(item.y), resizeWidth(raft1.width), resizeHeight(raft1.height));
        });
        for (let i = 0; i < impacts.length; i++) {
            let impact = impacts[i];
            ctx.beginPath();
            ctx.arc(resizeWidth(impact.x),resizeHeight(impact.y), impact.radius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,0,0," + impact.transparency + ")";
            ctx.fill();
            ctx.closePath();
            impact.transparency -= .01;
            if (impact.transparency < 0) {
                impacts.splice(i,1);
            }
        }
    }

    //go through a table of friendly and enemy troops and draw them based on position

    //update money value
}
setInterval(slow, 1000);
setInterval(draw, 10);

function roundFunc(i) {
    let round = rounds[i];
    let allTroopsDeployed = false;
    rafts = [];
    let raftTroops = [];
    //[[Soldier,30], [Sniper,10]]
    for (let i=0; i < round.length; i++) {
        raftTroops.push([round[i][0], round[i][1]]);
    }
    for (let x=1; x<= raftTroops.length; x++) {
        let soldierType = raftTroops[x-1][0];
        let img = raftsList[soldierType];
        let raftPos = x/(raftTroops.length + 1) * 880;
        let troopsDeployed = 0;
        let troopCount = raftTroops[x-1][1];
        let deployEnemy = setInterval(function() {
            troopsDeployed++;
            if (troopsDeployed === troopCount) {
                clearInterval(deployEnemy);
                allTroopsDeployed = true;
            }
            let enemyImg = enemyTroopsList[soldierType];
            enemies.push(new Troop("Enemy", soldierType, 1720 - enemyImg.width, raftPos-25,-.2,0,480,raftPos-25));
        },500);
        rafts.push(new Raft(img, 1720, raftPos-40));
    }
    let checkForNext = setInterval(function() {
        if (allTroopsDeployed && enemies.length === 0) {
            if (i+1 < rounds.length) {
                roundNumber++;
                roundFunc(i+1);
                clearInterval(checkForNext);
            } else {
                roundNumber = 0;
                rafts = [];
            }
        }
    }, 1000)
    //side, type, x, y, dx, dy, targetX, targetY;
}
setTimeout(function() {
    roundFunc(0);
}, 1000);
