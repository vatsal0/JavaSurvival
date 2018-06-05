const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const pageHeight = window.innerHeight;
const pageWidth = window.innerWidth;


console.log(canvas.height,canvas.width);

const images = {
    "Water": document.getElementById("Water")
};

const image = {
    src: "Image Source Placeholder",
    width: 0,
    height:0
}


function resizeToFitPage(image) {
    image.width = (image.width/1920)  * pageWidth;
    image.height = (image.height/1080) * pageHeight;
}


const person = {
    firstName: "John",
    lastName : "Doe",
    id       : 5566,
    fullName : function() {
        return this.firstName + " " + this.lastName;
    }
};

ctx.drawImage(images["Water"],0,0);
