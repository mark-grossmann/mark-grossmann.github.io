const bkgd = document.getElementById("bkgd");
const bkgdCtx = bkgd.getContext('2d');
const video2 = document.querySelector('video');
let clock;

function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
  //i'll be using this a lot and don't feel like copy pasting it
}

let pxScale = window.devicePixelRatio;
function setupBkgd() {
  // fixed canvas size
  width = window.innerWidth;
  height = window.innerHeight;

  // set the CSS display size
  bkgd.style.width = width + 'px';
  bkgd.style.height = height + 'px';

  bkgd.width = width * pxScale;
  bkgd.height = height * pxScale;

  // normalize the coordinate system
  bkgdCtx.scale(pxScale, pxScale);

  drawBkgd();
}

//user input
let fenceOffset;
let blueThreshold

let data; //I want to check what this is from the console.
function drawBkgd(){
  // draw image to the canvas (image, x, y, width, height)
  bkgdCtx.drawImage(video2, 0, 0, width, height);
  let imageData = bkgdCtx.getImageData(0, 0, bkgd.width, bkgd.height);
  let data = imageData.data;

  // clear canvas
  bkgdCtx.clearRect(0, 0, bkgd.width, bkgd.height);

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; ) { // incrementing handled in loops.
      let index = (x + y * imageData.width) * 4; // index position of every pixel
      let redIndex = index + 0;
      let grnIndex = index + 1;
      let bluIndex = index + 2;
      if (data[redIndex] < 110){
        //this threshold highlights people in green yay
        data[grnIndex] = data[redIndex] * 2;
      } else{
        data[grnIndex] = data[bluIndex];
      }
      x++
    }
  }
  requestAnimationFrame(drawBkgd);

  bkgdCtx.putImageData(imageData, 0, 0);
  clock++;

}

window.addEventListener('load', setupBkgd);
