import * as THREE from "three";

console.log("the document is not necessarily loaded yet...");

document.addEventListener("DOMContentLoaded", (event) => {
  init(event);
});

function init() {
  console.log("apparently the document is loaded");
  const canvas = document.getElementById("canvas");
  console.log(canvas);

  const videoFile = document.getElementById("localVideo");
  const videoPlayer = document.getElementById("video1");

  videoFile.onchange = function () {
    const fileToPlay = this.files[0];
    videoPlayer.src = URL.createObjectURL(fileToPlay);
    videoPlayer.load();
    videoPlayer.play();
  };

  initGL(videoPlayer);
}

function initGL(video) {

  const canvasDim = canvas.getBoundingClientRect();
  const [width, height] = [canvasDim.width, canvasDim.height];

  //if (restart && GL.renderer) GL.renderer.dispose()

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height, true);
  renderer.setClearColor("rgb(255,255,255)", 0);

  canvas.appendChild(renderer.domElement);

  //this videotexture is now permanently attached to videoPlayer with id of video1
  //dispose of it or just keep it online for the duration of the session

  //in the end it is WebGL that knows how to extra the most recent frame if we
  //pass in an html video element to  gl.texImage2D() instead of an image

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.needsUpdate = true;
  const videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.FrontSide,
    toneMapped: false,
  });
  videoMaterial.needsUpdate = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 3000);
  camera.position.z = 10;

  const screen = new THREE.PlaneGeometry(20, 10);
  //const screen = new THREE.DodecahedronGeometry(1)
  //const screen = new THREE.SphereGeometry(1)
  const videoScreen = new THREE.Mesh(screen, videoMaterial);
  scene.add(videoScreen);

  renderer.render(scene, camera);

  let prevRenderTime = Date.now();
  const fpsInterval = 1000/2;
  requestAnimationFrame(renderLoop);

  function renderLoop(time) {

    requestAnimationFrame(renderLoop);

    //we are rendering way too many times a second
    const currentRenderTime = Date.now();
    const elapsed = currentRenderTime - prevRenderTime;

    //return if video is paused
    if (elapsed < fpsInterval) return;

    prevRenderTime = currentRenderTime - (elapsed % fpsInterval);
    time *= 0.001; //convert from milliseconds to seconds

    renderer.render(scene, camera);
  }
}

//this is a nice function from: 
//https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_textures_in_WebGL
function setupVideo(url) {
  const video = document.createElement("video");

  let playing = false;
  let timeupdate = false;

  video.playsInline = true;
  video.muted = true;
  video.loop = true;

  // Waiting for these 2 events ensures
  // there is data in the video

  video.addEventListener(
    "playing",
    () => {
      playing = true;
      checkReady();
    },
    true
  );

  video.addEventListener(
    "timeupdate",
    () => {
      timeupdate = true;
      checkReady();
    },
    true
  );

  video.src = url;
  video.play();

  function checkReady() {
    if (playing && timeupdate) {
      copyVideo = true;
    }
  }

  return video;
}
