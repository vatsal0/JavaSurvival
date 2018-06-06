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

