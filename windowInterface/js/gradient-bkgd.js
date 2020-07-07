const bkgd = document.querySelector('body').style;
bkgd.background = "linear-gradient(100deg, #00f033, #0fc8ff)";
bkgd.backgroundSize = "400%";
bkgd.transition = "transform 500ms ease-out;";
bkgd.transform = "rotateX(20deg) rotateY(30deg);";

let xBrowserRatio;
let yBrowserRatio;

function scaleRatio() {
  let browserWidth = window.innerWidth;
  let browserHeight = window.innerHeight;

  xBrowserRatio = browserWidth / 100;
  yBrowserRatio = browserHeight / 100;
}

function coordinates(event) {
    let mousex = event.clientX; // get cursor X position
    let mousey = event.clientY; // get cursor Y position
  
    updatePosition(mousex, mousey);
  }

function updatePosition(xPos, yPos) {
    let xOffset = Math.ceil(xPos / xBrowserRatio);
    let yOffset = Math.ceil(yPos / yBrowserRatio);
    //console.log("50% " + xPos +"%;");
    
}

// update scale when the page loads or is resized
window.addEventListener('load', scaleRatio);
window.addEventListener('resize', scaleRatio);

// detect cursor movements in browser window
window.addEventListener('mousemove', coordinates);
