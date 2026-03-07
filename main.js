// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

// Gradient shader material (light blue → UV)
const material = new THREE.ShaderMaterial({
  uniforms: { mixValue: { value: 0.0 } },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float mixValue;
    varying vec2 vUv;
    void main() {
      vec3 colorA = mix(vec3(0.6, 0.8, 1.0), vec3(0.0, 0.2, 0.6), vUv.y);
      vec3 colorB = mix(vec3(1.0, 0.0, 0.6), vec3(0.0, 0.3, 1.0), vUv.x);
      vec3 color = mix(colorA, colorB, mixValue);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.DoubleSide
});

// Geometries
const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
const lineGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(1, 0, 0)
]);
const circleGeometry = new THREE.CircleGeometry(1, 128);

// Tesseract (4D cube projection)
function createTesseract(size) {
  const vertices = [], edges = [];
  for (let i = 0; i < 16; i++) {
    const x = (i & 1 ? 1 : -1) * size;
    const y = (i & 2 ? 1 : -1) * size;
    const z = (i & 4 ? 1 : -1) * size;
    const w = (i & 8 ? 1 : -1) * size;
    vertices.push(new THREE.Vector3(x, y, z + w * 0.5));
  }
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const diff = i ^ j;
      if (diff && !(diff & (diff - 1))) edges.push(vertices[i], vertices[j]);
    }
  }
  return new THREE.BufferGeometry().setFromPoints(edges);
}
const tesseractGeometry = createTesseract(0.7);

// Mesh
let mesh = new THREE.Mesh(sphereGeometry, material);
scene.add(mesh);

// Web Audio setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let currentLoop = null;
let ambientOsc = null;

function startAmbientDrone() {
  if (ambientOsc) return; // already running
  ambientOsc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  ambientOsc.type = "sine";
  ambientOsc.frequency.value = 110; // low A2 drone
  ambientOsc.connect(gain);
  gain.connect(audioCtx.destination);

  // Fade in drone
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 2);

  ambientOsc.start();
}

function stopAmbientDrone() {
  if (ambientOsc) {
    ambientOsc.stop();
    ambientOsc = null;
  }
}

function startLoop(frequencies, interval = 0.5) {
  stopLoop();
  let index = 0;
  currentLoop = setInterval(() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequencies[index % frequencies.length];
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    // Fade in
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.2);

    osc.start();
    // Fade out
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    osc.stop(audioCtx.currentTime + 0.3);

    index++;
  }, interval * 1000);
}

function stopLoop() {
  if (currentLoop) {
    clearInterval(currentLoop);
    currentLoop = null;
  }
}

// Stage motifs (looping with fade)
function playStageMotif(stage) {
  stopLoop();
  if (stage === 0) {
    startLoop([261.63]); // Point: steady C4
  } else if (stage === 1) {
    startLoop([261.63, 392.00], 0.6); // Line: alternating C4 ↔ G4
  } else if (stage === 2) {
    startLoop([261.63, 329.63, 392.00, 523.25], 0.4); // Circle: arpeggio
  } else if (stage === 3) {
    startLoop([392.00, 494.00, 587.33], 0.5); // Sphere: chord tones loop
  } else if (stage === 4) {
    startLoop([261.63, 293.66, 349.23, 440.00, 523.25], 0.3); // Tesseract: cascading motif
  }
}

// Morphing logic
let stage = 0;
let morphTime = 0;
let morphing = false;

function morphTo(newGeometry) {
  morphing = true;
  morphTime = 0;

  const oldPositions = mesh.geometry.attributes.position.array.slice();
  const newPositions = newGeometry.attributes.position.array;
  const length = Math.min(oldPositions.length, newPositions.length);

  function updateMorph() {
    morphTime += 0.016;
    const t = Math.min(morphTime / 5, 1);
    const positions = mesh.geometry.attributes.position.array;

    for (let i = 0; i < length; i++) {
      positions[i] = oldPositions[i] * (1 - t) + newPositions[i] * t;
    }
    mesh.geometry.attributes.position.needsUpdate = true;

    material.uniforms.mixValue.value = t;

    if (t < 1) {
      requestAnimationFrame(updateMorph);
    } else {
      morphing = false;
      playStageMotif(stage); // start looping motif
      setTimeout(nextStage, 5000);
    }
  }
  updateMorph();
}

function nextStage() {
  stage++;
  if (stage === 1) morphTo(lineGeometry);
  else if (stage === 2) morphTo(circleGeometry);
  else if (stage === 3) morphTo(sphereGeometry);
  else if (stage === 4) {
    scene.remove(mesh);
    const tesseract = new THREE.LineSegments(
      tesseractGeometry,
      new THREE.LineBasicMaterial({ color: 0x9933ff })
    );
    mesh = tesseract;
    scene.add(mesh);
    playStageMotif(stage);
    setTimeout(nextStage, 5000);
  }
}

// Animate loop
function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Connect to Start Button
document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("startBtn").style.display = "none";
  startAmbientDrone(); // global drone starts
  playStageMotif(stage); // initial motif
  setTimeout(nextStage, 5000);
});
