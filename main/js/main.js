const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const pageHeight = window.innerHeight;
const pageWidth = window.innerWidth;


const image = {
    img: 0,
    width: 0,
    height:0
};

const images = {
    "Water": document.getElementById("Water")
};

function resizeX(x) {
    return (x.width/1920) * pageWidth;
}

function resizeY(y) {
    return (y.height/1080) * pageHeight;
}

ctx.drawImage(images["Water"],0,0);

console.log(canvas.height, canvas.width, images["Water"].width, images["Water"].height);