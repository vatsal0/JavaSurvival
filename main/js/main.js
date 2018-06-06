const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const pageHeight = window.innerHeight;
const pageWidth = window.innerWidth;
canvas.height = pageHeight;
canvas.width = pageWidth;

const water = new Image();
water.src = "../Assets/Water.png";
water.onload = function() {
    ctx.drawImage(water,canvas.width - resizeWidth(water.width),0,resizeWidth(water.width),resizeHeight(water.height));
};

const base = createImage("../Assets/Homebase.png")

base.onload = function() {
    ctx.drawImage(base,0,canvas.height/10,resizeWidth(base.width),resizeHeight(base.height));
};

console.log(resizeHeight(base.height)/canvas.height);




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
