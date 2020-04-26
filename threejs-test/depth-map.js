let camera, scene, renderer, controls, mesh, light;

let image = document.querySelector('#imgToProcess');

const audio = document.querySelector('#audio');

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let src = audioCtx.createMediaElementSource(audio); // turn audio tag audio into source
const analyser = audioCtx.createAnalyser();

src.connect(analyser); // connect source to analyser
analyser.connect(audioCtx.destination); // end destination of audio graph (sends sound to speakers)

analyser.smoothingTimeConstant = 0.95;

audio.addEventListener('play', function() {
  audioCtx.resume();
});

analyser.fftSize = 2048; //I want 1024 bins to work with
const bufferLength = analyser.frequencyBinCount; // 1024
console.log(bufferLength);
const fftData = new Uint8Array(bufferLength); // convert to 8-bit unsigned integer array
console.log(fftData);


function rgbToHsl(r, g, b) {
  // THIS IS FROM https://gist.github.com/mjackson/5311256
  // I went through and understand the math & code behind this but not the reasoning nor color theory, etc.
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);// just learned about ternary opertators theyre p dope

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

function init() {
  scene = new THREE.Scene();

  let width = window.innerWidth;
  let height = window.innerHeight;

  camera = new THREE.PerspectiveCamera(45, width/height, 1, 25000);
  camera.position.set(0, 300, 700);
  scene.add(camera);

  light = new THREE.DirectionalLight(0xfffffff, 1); // color, intensity
  light.position.set(1, 1, 1); // location x, y, z
  scene.add(light);

  renderer = new THREE.WebGLRenderer({alpha: 1, antialias: true});
  renderer.setSize(width, height);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  document.body.appendChild(renderer.domElement);
}

function depthMap() {
  const canvas = document.getElementById('drawing');
  const imgCtx = canvas.getContext('2d');

  imgCtx.drawImage(image, 0, 0, 200, 200);

  let imageData = imgCtx.getImageData(0, 0, canvas.width, canvas.height);

  let pixData = imageData.data;
  // console.log(data);
  return pixData;
}

function vertices() {
  let loader = new THREE.TextureLoader();

  let material = new THREE.MeshLambertMaterial({map: loader.load('./heart.jpg'), side: THREE.DoubleSide});

  // width, height, segments
  let geometry = new THREE.PlaneGeometry(800, 800, 199, 199);
  mesh = new THREE.Mesh(geometry, material);

  console.log(mesh.geometry.vertices.length);
  // mesh.geometry.vertices[i].z = data[i * 4];

  mesh.rotation.x = -Math.PI / 2; // rotate flat

  // compute lighting
  geometry.computeVertexNormals();

  scene.add(mesh);
}

function animate() {
  pixData = depthMap();

  renderer.render(scene, camera);
  controls.update();
  analyser.getByteFrequencyData(fftData);

  // create array of hue data for all of the pixels
  let hueArray = [];
  for (let i = 0; i < pixData.length / 4; i++) {
    let pixel = i*4;
    let r = pixData[pixel], g = pixData[pixel + 1], b = pixData[pixel + 2];
    let hsl = rgbToHsl(r, g, b);

    // convert hue to equiv bin
    let hue = hsl[0];
    let adjustHue = Math.floor(hue*bufferLength);
    hueArray[i] = adjustHue;
    //console.log(hueArray[i])
  }//console.log(hueArray)

  for (let i = 0; i < hueArray.length; i += 4){
    let hueToBin = fftData[hueArray[i]] //yeet
    mesh.geometry.vertices[i].z = hueToBin * 2;
  }

  // update geometry
  mesh.geometry.verticesNeedUpdate = true;

  requestAnimationFrame(animate);
}

window.addEventListener('load', () => {
  init();
  vertices();
  animate();
})
