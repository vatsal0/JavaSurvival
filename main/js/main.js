const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const pageHeight = window.innerHeight;
const pageWidth = window.innerWidth;
canvas.height = pageHeight;
canvas.width = pageWidth;

const water = new Image(381,100);
water.src = "../Assets/Water.png";


const img = document.getElementById("Water");
ctx.drawImage(img,0,0);


console.log(canvas.height, canvas.width, pageHeight, pageWidth);