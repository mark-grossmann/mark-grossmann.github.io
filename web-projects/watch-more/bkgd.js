// grab things from the document
const bkgd = document.getElementById("bkgd");
const bkgdCtx = bkgd.getContext('2d');
const video = document.querySelector('video');

// for time based effects (advances every frame)
let clock = 0;

// utilities
function mspScale(input, inpMin, inpMax, outMin, outMax) {
  //based on |scale| obect from max/msp
  let calc = (outMin + ((input-inpMin)*(outMax-outMin) / (inpMax-inpMin)));
  return calc;
}

// set up canvas things
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

// global visual vars
let data;
let previousData;
let thresh = 100;
let redness = 200;

// interativity
let xGrid;
getxGrid =()=> {xGrid = Math.floor(mspScale(event.clientX, 0, window.innerWidth, 0, 10)) + 1; //I want the screen split in 10 distinct sections
  console.log(xGrid);
  changeLfoFreq(); // change master gain lfo!
  }

let yGrid
getyGrid =()=> {yGrid = Math.floor(mspScale(event.clientY, 0, window.innerHeight, 0, 100)); // scale window height from 0. to 1.
  yGrid /= 100;
  console.log(yGrid);
  changeWideness(yGrid);
  }

function drawBkgd(){
  // draw image to the canvas (image, x, y, width, height)
  bkgdCtx.drawImage(video, 0, 0, width, height);
  let imageData = bkgdCtx.getImageData(0, 0, bkgd.width, bkgd.height);
  data = imageData.data;

  // clear canvas
  bkgdCtx.clearRect(0, 0, bkgd.width, bkgd.height);

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; ) { // incrementing handled in loops.
      let index = (x + y * imageData.width) * 4; // index position of every pixel
      let redIndex = index + 0;
      let grnIndex = index + 1;
      let bluIndex = index + 2;

      if (data[redIndex] > thresh){
        // do nothing to this pixel
        x++;
      } else {
        // rate: compresses sin function on x-axis; 50 gives us a range of -50 to 50; redness is an offset of the wave.
        let rate = xGrid;
        data[redIndex] = ((Math.sin(clock*rate) * 50) + redness);

        let possNexPixOffset = Math.floor(Math.random()*2); // 50% chance to grab data from the next pixel in the array (scramble the image a lil)
        data[grnIndex] = data[grnIndex + possNexPixOffset];
        data[bluIndex] = data[bluIndex + possNexPixOffset]; // grabbed from the same pixel for both grn and blue
      }
      x++
    }
  }
  bkgdCtx.putImageData(imageData, 0, 0);
  clock++;
  requestAnimationFrame(drawBkgd);
}

/////////////
////AUDIO////
/////////////

const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // init audio ctx
// master channel gain
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination); //connect master gain to device output

// set up arrays because I don't want to make all of these osc's by hand
let oscArray = new Array();
let trackGain = new Array();
let trackPan = new Array();
for (i=0; i<8; i++){ //8 oscillators
  oscArray[i] = audioCtx.createOscillator();
  oscArray[i].type = 'sine';

  // choosing freqs for the notes I want:
  // (also having some fun with ternary operators)
  let freq =  i==0? 130.812783 : // C
              i==1? 195.997718 : // G
              i==2? 261.625565 : // C
              i==3? 391.995436 : // G
              i==4? 493.883301 : // B
              i==5? 587.329536 : // D
              i==6? 739.988845 : // F#
                    987.766602   // B
  oscArray[i].frequency.setValueAtTime(freq, audioCtx.currentTime)

  // create a gain for this oscillator
  trackGain[i] = audioCtx.createGain();
  // gain staging
  trackGain[i].gain.setValueAtTime(0.07, audioCtx.currentTime);

// I want a * * s t e r e o   e x p e r i e n c e * *
  trackPan[i] = audioCtx.createStereoPanner();
  let pan =   i==0?  0.30 : // R
              i==1? -0.30 : // L
              i==2?  0.60 : // R
              i==3? -0.60 : // L
              i==4?  0.85 : // R
              i==5? -0.85 : // L
              i==6? -1.00 : // full left
                     1.00   // full right
  trackPan[i].pan.setValueAtTime(pan, audioCtx.currentTime);

  //connect osc to it's own gain and that gain to a panner and that panner to the master gain
  oscArray[i].connect(trackGain[i]);
  trackGain[i].connect(trackPan[i]);
  trackPan[i].connect(masterGain);
  // start the osc
  oscArray[i].start();
}

// init lfo for master gain
// wawawawawawawawawawawawawawawawaw
// awawawawawawawawawawawawawawawawa
// wawawawawawawawawawawawawawawawaw
lfo = audioCtx.createOscillator();
lfo.frequency.value = 1; // initial lfo frequency
lfo.type = 'sawtooth';
lfo.connect(masterGain.gain); //connect to the gain of the master channel
lfo.start();

// going to change the LFO rate with mouse X position
changeLfoFreq =()=> {lfo.frequency.setValueAtTime(xGrid, audioCtx.currentTime);}

// change how hard panned tracks are with mouse Y position
function changeWideness(mspScaledY){
  for (let i=0; i<trackPan.length; i++){
    let pan =   i==0?  0.40 : // R
                i==1? -0.40 : // L
                i==2?  0.70 : // R
                i==3? -0.70 : // L
                i==4?  0.90 : // R
                i==5? -0.90 : // L
                i==6? -1.00 : // full left
                       1.00   // full right

    let adjustPan = mspScaledY*pan
    trackPan[i].pan.setValueAtTime(adjustPan, audioCtx.currentTime);
  }
}

const start = document.getElementById('startButton');

// continue the audio ctx, delete the overlay, play the video when the user clicks start.
start.addEventListener('click', function() {
  audioCtx.resume();
  document.getElementById('overlay').remove();
  video.play();
});

// event listeners
window.addEventListener('load', setupBkgd);
window.addEventListener('mousemove', getxGrid);
window.addEventListener('mousemove', getyGrid);
window.addEventListener('resize', setupBkgd);
