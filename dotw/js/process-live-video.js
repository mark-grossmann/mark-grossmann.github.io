// grab live video into video tag
const hlsSource = "https://videos-3.earthcam.com/fecnetwork/9974.flv/chunklist_w2024360066.m3u8"; // this link is what frequently breaks.
const video = document.getElementById('video');
  if (Hls.isSupported()) {
    var hls = new Hls();
    // bind them together
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      console.log("video and hls.js are now bound together !");
      hls.loadSource(hlsSource);
      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        console.log("manifest loaded, found " + data.levels.length + " quality level");
      });
    });
  }

/////////////////////////////////////////
// put the video on a plane w/ THREE.js//
/////////////////////////////////////////

// set variables
let camera, scene, renderer, controls, mesh, light, geometry, vidTexture;

let start = document.querySelectorAll("button")[0];
start.addEventListener('click', function() {
  video.play();
  // remove overlay
  document.getElementById('overlay').remove();
});

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

  renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  renderer.setClearColor( 0x000000, 0 ); // make sure the bkgd of the THREE canvas is see-thru
  renderer.setSize(width, height); // full size of window


  controls = new THREE.OrbitControls(camera, renderer.domElement);

  document.body.appendChild(renderer.domElement);
  // put THREE canvas infront after it's been created
  document.querySelectorAll("canvas")[0].style.zIndex="40";

  // turn video into texture
  vidTexture = new THREE.VideoTexture( video );
}

function vertices() {
  let material = new THREE.MeshLambertMaterial({map: vidTexture, side: THREE.DoubleSide});

  // width, height, segments
  geometry = new THREE.PlaneGeometry(1280, 720, 383, 215);
  mesh = new THREE.Mesh(geometry, material);

  console.log(mesh.geometry.vertices.length);

  mesh.rotation.x = -Math.PI / 2; // rotate flat

  // update geometry
  geometry.computeVertexNormals();

  scene.add(mesh);
}

function animate() {

  renderer.render(scene, camera);
  controls.update();

  // update geometry
  mesh.geometry.verticesNeedUpdate = true;

  requestAnimationFrame(animate);
}

window.addEventListener('load', () => {
  init();
  vertices()
  animate();
})
