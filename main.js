// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // <-- forces white background
document.body.appendChild(renderer.domElement);


// Function to create wavy circle geometry
function createWavyCircle(radius, segments, waveAmplitude, waveFrequency) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const r = radius + Math.sin(angle * waveFrequency) * waveAmplitude;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return new THREE.ShapeGeometry(shape);
}

// Geometry
const geometry = createWavyCircle(1, 256, 0.05, 15);

// Gradient material (pink → purple → blue)
const material = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    void main() {
      vec3 color = mix(vec3(1.0, 0.0, 0.6), vec3(0.0, 0.3, 1.0), vUv.x);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.DoubleSide
});

// Mesh
const circle = new THREE.Mesh(geometry, material);
scene.add(circle);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  circle.rotation.z += 0.01; // slow rotation
  renderer.render(scene, camera);
}
animate();

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
